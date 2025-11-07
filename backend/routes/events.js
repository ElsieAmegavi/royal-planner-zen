const express = require('express');
const db = require('../database/connection');
const { sendResponse, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all events
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM planner_events WHERE user_id = ? ORDER BY date', [req.user.userId], (err, events) => {
    if (err) {
      return sendResponse(res, false, 'Database error', null, 500);
    }
    sendResponse(res, true, 'Events retrieved successfully', events || []);
  });
});

// Create new event
router.post('/', authenticateToken, (req, res) => {
  const { title, description, date, type, time, priority, reminders, isRecurring, recurringDays, courseCode, location } = req.body;
  
  db.run('INSERT INTO planner_events (user_id, title, description, date, type, time, priority, reminders, is_recurring, recurring_days, course_code, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [req.user.userId, title, description, date, type, time, priority, JSON.stringify(reminders), isRecurring, JSON.stringify(recurringDays), courseCode, location], function(err) {
      if (err) {
        return sendResponse(res, false, 'Failed to create event', null, 500);
      }
      sendResponse(res, true, 'Event created successfully', { 
        id: this.lastID, 
        title, 
        description, 
        date, 
        type, 
        time, 
        priority, 
        reminders, 
        isRecurring, 
        recurringDays, 
        courseCode, 
        location 
      });
    });
});

// Update event
router.put('/:id', authenticateToken, (req, res) => {
  const eventId = req.params.id;
  const { title, description, date, type, time, priority, reminders, isRecurring, recurringDays, courseCode, location } = req.body;
  
  db.run('UPDATE planner_events SET title = ?, description = ?, date = ?, type = ?, time = ?, priority = ?, reminders = ?, is_recurring = ?, recurring_days = ?, course_code = ?, location = ? WHERE id = ? AND user_id = ?',
    [title, description, date, type, time, priority, JSON.stringify(reminders), isRecurring, JSON.stringify(recurringDays), courseCode, location, eventId, req.user.userId], function(err) {
      if (err) {
        return sendResponse(res, false, 'Failed to update event', null, 500);
      }
      sendResponse(res, true, 'Event updated successfully');
    });
});

// Delete event
router.delete('/:id', authenticateToken, (req, res) => {
  const eventId = req.params.id;
  
  db.run('DELETE FROM planner_events WHERE id = ? AND user_id = ?', [eventId, req.user.userId], function(err) {
    if (err) {
      return sendResponse(res, false, 'Failed to delete event', null, 500);
    }
    sendResponse(res, true, 'Event deleted successfully');
  });
});

module.exports = router;
