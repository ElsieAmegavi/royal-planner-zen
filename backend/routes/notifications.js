const express = require('express');
const db = require('../database/connection');
const { sendResponse, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all notifications
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [req.user.userId], (err, notifications) => {
    if (err) {
      return sendResponse(res, false, 'Database error', null, 500);
    }
    sendResponse(res, true, 'Notifications retrieved successfully', notifications || []);
  });
});

// Mark notification as read
router.put('/:id/read', authenticateToken, (req, res) => {
  const notificationId = req.params.id;
  
  db.run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [notificationId, req.user.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to mark notification as read' });
    }
    res.json({ message: 'Notification marked as read' });
  });
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, (req, res) => {
  db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
    res.json({ message: 'All notifications marked as read' });
  });
});

// Get notification settings
router.get('/settings', authenticateToken, (req, res) => {
  db.get('SELECT * FROM notification_settings WHERE user_id = ?', [req.user.userId], (err, settings) => {
    if (err) {
      return sendResponse(res, false, 'Database error', null, 500);
    }
    if (settings) {
      sendResponse(res, true, 'Notification settings retrieved successfully', settings);
    } else {
      // Return default notification settings if none exist
      const defaultSettings = {
        id: null,
        user_id: req.user.userId,
        assignments: true,
        deadlines: true,
        gpa_updates: true,
        weekly_reports: false,
        assignment_frequency: "24",
        deadline_timings: '["2", "24"]'
      };
      sendResponse(res, true, 'No notification settings found, returning defaults', defaultSettings);
    }
  });
});

// Update notification settings
router.put('/settings', authenticateToken, (req, res) => {
  const { assignments, deadlines, gpaUpdates, weeklyReports, assignmentFrequency, deadlineTimings } = req.body;
  
  db.run('UPDATE notification_settings SET assignments = ?, deadlines = ?, gpa_updates = ?, weekly_reports = ?, assignment_frequency = ?, deadline_timings = ? WHERE user_id = ?',
    [assignments, deadlines, gpaUpdates, weeklyReports, assignmentFrequency, JSON.stringify(deadlineTimings), req.user.userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update notification settings' });
      }
      res.json({ message: 'Notification settings updated successfully' });
    });
});

module.exports = router;
