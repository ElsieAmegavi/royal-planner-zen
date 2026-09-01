const express = require('express');
const db = require('../database/connection');
const { sendResponse, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get grade settings
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT grade, points FROM grade_settings WHERE user_id = ?', [req.user.userId], (err, settings) => {
    if (err) {
      return sendResponse(res, false, 'Database error', null, 500);
    }
    
    const gradePoints = {};
    settings.forEach(setting => {
      gradePoints[setting.grade] = setting.points;
    });
    
    // If no grade settings exist, return default settings
    if (Object.keys(gradePoints).length === 0) {
      const defaultSettings = {
        "A+": 4.0, "A": 4.0, "A-": 3.7,
        "B+": 3.3, "B": 3.0, "B-": 2.7,
        "C+": 2.3, "C": 2.0, "C-": 1.7,
        "D+": 1.3, "D": 1.0, "F": 0.0
      };
      return sendResponse(res, true, 'Default grade settings retrieved', defaultSettings);
    }
    
    sendResponse(res, true, 'Grade settings retrieved successfully', gradePoints);
  });
});

// Save grade settings
router.post('/', authenticateToken, (req, res) => {
  const { grade, points } = req.body;
  
  db.run('INSERT INTO grade_settings (user_id, grade, points) VALUES (?, ?, ?)',
    [req.user.userId, grade, points], function(err) {
      if (err) {
        return sendResponse(res, false, 'Failed to save grade settings', null, 500);
      }
      sendResponse(res, true, 'Grade settings saved successfully');
    });
});

// Update individual grade setting
router.put('/update', authenticateToken, (req, res) => {
  const { grade, points } = req.body;
  
  db.run('UPDATE grade_settings SET points = ? WHERE user_id = ? AND grade = ?',
    [points, req.user.userId, grade], function(err) {
      if (err) {
        return sendResponse(res, false, 'Failed to update grade settings', null, 500);
      }
      sendResponse(res, true, 'Grade settings updated successfully');
    });
});

// Bulk update all grade settings
router.put('/', authenticateToken, (req, res) => {
  const { gradeSettings } = req.body;

  // Delete all existing grade settings for this user
  db.run('DELETE FROM grade_settings WHERE user_id = ?', [req.user.userId], function(err) {
    if (err) {
      return sendResponse(res, false, 'Failed to clear existing grade settings', null, 500);
    }

    const entries = Object.entries(gradeSettings);
    if (entries.length === 0) {
      return sendResponse(res, true, 'Grade settings updated successfully');
    }

    let completed = 0;
    let failed = false;
    entries.forEach(([grade, points]) => {
      db.run('INSERT INTO grade_settings (user_id, grade, points) VALUES (?, ?, ?)',
        [req.user.userId, grade, points], function(err) {
          if (failed) return;
          if (err) {
            failed = true;
            return sendResponse(res, false, 'Failed to save grade settings', null, 500);
          }
          completed++;
          if (completed === entries.length) {
            sendResponse(res, true, 'Grade settings updated successfully');
          }
        });
    });
  });
});

// Delete grade setting
router.delete('/', authenticateToken, (req, res) => {
  const { grade } = req.body;
  
  db.run('DELETE FROM grade_settings WHERE user_id = ? AND grade = ?',
    [req.user.userId, grade], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete grade settings' });
      }
      res.json({ message: 'Grade settings deleted successfully' });
    });
});

module.exports = router;
