const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/connection');
const { sendResponse } = require('../middleware/auth');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, academicLevel } = req.body;

    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return sendResponse(res, false, 'Database error', null, 500);
      }
      if (user) {
        return sendResponse(res, false, 'User already exists', null, 400);
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      db.run('INSERT INTO users (email, password, name, academic_level) VALUES (?, ?, ?, ?)',
        [email, hashedPassword, fullName, academicLevel], function(err) {
          if (err) {
            return sendResponse(res, false, 'Failed to create user', null, 500);
          }

          // Create user profile
          db.run('INSERT INTO user_profiles (user_id, name, email, academic_level) VALUES (?, ?, ?, ?)',
            [this.lastID, fullName, email, academicLevel]);

          // Create default grade settings
          const defaultGrades = [
            ['A+', 4.0], ['A', 4.0], ['A-', 3.7],
            ['B+', 3.3], ['B', 3.0], ['B-', 2.7],
            ['C+', 2.3], ['C', 2.0], ['C-', 1.7],
            ['D+', 1.3], ['D', 1.0], ['F', 0.0]
          ];

          defaultGrades.forEach(([grade, points]) => {
            db.run('INSERT INTO grade_settings (user_id, grade, points) VALUES (?, ?, ?)',
              [this.lastID, grade, points]);
          });

          // Create default notification settings
          db.run('INSERT INTO notification_settings (user_id) VALUES (?)', [this.lastID]);

          const token = jwt.sign({ userId: this.lastID, email }, process.env.JWT_SECRET || 'royal-planner-secret');
          sendResponse(res, true, 'User registered successfully', { 
            token, 
            user: { id: this.lastID, email, name: fullName } 
          });
        });
    });
  } catch (error) {
    sendResponse(res, false, 'Server error', null, 500);
  }
});

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return sendResponse(res, false, 'Database error', null, 500);
    }
    if (!user) {
      return sendResponse(res, false, 'Invalid credentials', null, 401);
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return sendResponse(res, false, 'Invalid credentials', null, 401);
    }

    const token = jwt.sign({ userId: user.id, email }, process.env.JWT_SECRET || 'royal-planner-secret');
    sendResponse(res, true, 'Login successful', { 
      token, 
      user: { id: user.id, email: user.email, name: user.name } 
    });
  });
});

module.exports = router;
