const express = require('express');
const db = require('../database/connection');
const { sendResponse, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all journal entries
router.get('/', authenticateToken, (req, res) => {
  db.all('SELECT * FROM journal_entries WHERE user_id = ? ORDER BY date DESC', [req.user.userId], (err, entries) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    // Parse tags from JSON string to array before sending response
    const entriesWithParsedTags = entries.map(entry => ({
      ...entry,
      tags: JSON.parse(entry.tags)
    }));
    res.json({ data: entriesWithParsedTags });
  });
});

// Create new journal entry
router.post('/', authenticateToken, (req, res) => {
  const { title, content, mood, tags, date } = req.body;
  
  db.run('INSERT INTO journal_entries (user_id, title, content, mood, tags, date) VALUES (?, ?, ?, ?, ?, ?)',
    [req.user.userId, title, content, mood, JSON.stringify(tags), date], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create journal entry' });
      }
      res.json({ data: { id: this.lastID, title, content, mood, tags, date } });
    });
});

// Update journal entry
router.put('/:id', authenticateToken, (req, res) => {
  const entryId = req.params.id;
  const { title, content, mood, tags, date } = req.body;
  
  db.run('UPDATE journal_entries SET title = ?, content = ?, mood = ?, tags = ?, date = ? WHERE id = ? AND user_id = ?',
    [title, content, mood, JSON.stringify(tags), date, entryId, req.user.userId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update journal entry' });
      }
      res.json({ data: { message: 'Journal entry updated successfully' } });
    });
});

// Delete journal entry
router.delete('/:id', authenticateToken, (req, res) => {
  const entryId = req.params.id;
  
  db.run('DELETE FROM journal_entries WHERE id = ? AND user_id = ?', [entryId, req.user.userId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete journal entry' });
    }
    res.json({ data: { message: 'Journal entry deleted successfully' } });
  });
});

module.exports = router;
