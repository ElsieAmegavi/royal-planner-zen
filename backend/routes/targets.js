const express = require('express');
const db = require('../database/connection');
const { sendResponse, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get target grades
router.get('/', authenticateToken, (req, res) => {
  db.get('SELECT * FROM target_grades WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [req.user.userId], (err, target) => {
    if (err) {
      return sendResponse(res, false, 'Database error', null, 500);
    }
    
    if (target) {
      // Convert snake_case to camelCase for frontend compatibility
      const formattedTarget = {
        id: target.id,
        targetGpa: target.target_gpa,
        targetSemester: target.target_semester,
        currentCredits: target.current_credits,
        currentGpa: target.current_gpa,
        createdAt: target.created_at
      };
      sendResponse(res, true, 'Target grade retrieved successfully', formattedTarget);
    } else {
      sendResponse(res, true, 'No target grade found', null);
    }
  });
});

// Create target grade
router.post('/', authenticateToken, (req, res) => {
  const { targetGpa, targetSemester, currentCredits, currentGpa } = req.body;
  
  db.run('INSERT INTO target_grades (user_id, target_gpa, target_semester, current_credits, current_gpa) VALUES (?, ?, ?, ?, ?)',
    [req.user.userId, targetGpa, targetSemester, currentCredits, currentGpa], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create target grade' });
      }
      
      // Return formatted response with camelCase field names
      const formattedTarget = {
        id: this.lastID,
        targetGpa,
        targetSemester,
        currentCredits,
        currentGpa,
        createdAt: new Date().toISOString()
      };
      res.json(formattedTarget);
    });
});

// Delete target grade
router.delete('/', authenticateToken, (req, res) => {
  db.run('DELETE FROM target_grades WHERE user_id = ?', [req.user.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete target grade' });
    }
    res.json({ message: 'Target grade deleted successfully' });
  });
});

module.exports = router;
