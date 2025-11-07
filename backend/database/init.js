const bcrypt = require('bcryptjs');
const db = require('./connection');

// Initialize database tables
function initializeDatabase() {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    academic_level TEXT,
    academic_years INTEGER DEFAULT 4,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('Users table created/verified');
    }
  });

  // User profiles table
  db.run(`CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    academic_level TEXT,
    academic_years INTEGER DEFAULT 4,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Semesters table
  db.run(`CREATE TABLE IF NOT EXISTS semesters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    gpa REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Courses table
  db.run(`CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    semester_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    credits REAL NOT NULL,
    grade TEXT NOT NULL,
    points REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (semester_id) REFERENCES semesters (id)
  )`);

  // Grade settings table
  db.run(`CREATE TABLE IF NOT EXISTS grade_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    grade TEXT NOT NULL,
    points REAL NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Planner events table
  db.run(`CREATE TABLE IF NOT EXISTS planner_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    time TEXT,
    priority TEXT DEFAULT 'medium',
    reminders TEXT,
    is_recurring BOOLEAN DEFAULT 0,
    recurring_days TEXT,
    course_code TEXT,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Journal entries table
  db.run(`CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT NOT NULL,
    tags TEXT,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Target grades table
  db.run(`CREATE TABLE IF NOT EXISTS target_grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    target_gpa REAL NOT NULL,
    target_semester TEXT NOT NULL,
    current_credits INTEGER DEFAULT 0,
    current_gpa REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Notifications table
  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    urgent BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Notification settings table
  db.run(`CREATE TABLE IF NOT EXISTS notification_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    assignments BOOLEAN DEFAULT 1,
    deadlines BOOLEAN DEFAULT 1,
    gpa_updates BOOLEAN DEFAULT 1,
    weekly_reports BOOLEAN DEFAULT 0,
    assignment_frequency TEXT DEFAULT '24',
    deadline_timings TEXT DEFAULT '["2", "24"]',
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating notification_settings table:', err);
    } else {
      console.log('All tables created/verified');
      // Insert default users after all tables are created
      insertDefaultUsers();
    }
  });
}

// Insert default users
function insertDefaultUsers() {
  const defaultUsers = [
    { email: 'student@royal.edu', password: 'password123', name: 'Alex Johnson' },
    { email: 'demo@test.com', password: 'demo123', name: 'Demo User' }
  ];

  defaultUsers.forEach(user => {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    db.run(`INSERT OR IGNORE INTO users (email, password, name) VALUES (?, ?, ?)`,
      [user.email, hashedPassword, user.name], (err) => {
        if (err) {
          console.error('Error inserting user:', err);
        } else {
          console.log(`Default user ${user.email} ready`);
        }
      });
  });

  console.log('Database initialized successfully');
}

module.exports = {
  initializeDatabase,
  insertDefaultUsers
};
