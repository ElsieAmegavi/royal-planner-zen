const sqlite3 = require('sqlite3').verbose();

// Initialize SQLite Database
const db = new sqlite3.Database('./royal_planner.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

module.exports = db;
