const bcrypt = require('bcryptjs');
const db = require('./connection');

// Table statements run sequentially (unlike the old single-file SQLite
// connection, a Postgres connection pool does not guarantee query order
// across calls, and later tables have foreign keys into earlier ones).
const TABLES = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    academic_level TEXT,
    academic_years INTEGER DEFAULT 4,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    academic_level TEXT,
    academic_years INTEGER DEFAULT 4
  )`,
  `CREATE TABLE IF NOT EXISTS semesters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id),
    year INTEGER NOT NULL,
    semester INTEGER NOT NULL,
    gpa REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id),
    semester_id INTEGER NOT NULL REFERENCES semesters (id),
    name TEXT NOT NULL,
    credits REAL NOT NULL,
    grade TEXT NOT NULL,
    points REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS grade_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id),
    grade TEXT NOT NULL,
    points REAL NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS planner_events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id),
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    time TEXT,
    priority TEXT DEFAULT 'medium',
    reminders TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_days TEXT,
    course_code TEXT,
    location TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS journal_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT NOT NULL,
    tags TEXT,
    date TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS target_grades (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id),
    target_gpa REAL NOT NULL,
    target_semester TEXT NOT NULL,
    current_credits INTEGER DEFAULT 0,
    current_gpa REAL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    urgent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS notification_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users (id),
    assignments BOOLEAN DEFAULT TRUE,
    deadlines BOOLEAN DEFAULT TRUE,
    gpa_updates BOOLEAN DEFAULT TRUE,
    weekly_reports BOOLEAN DEFAULT FALSE,
    assignment_frequency TEXT DEFAULT '24',
    deadline_timings TEXT DEFAULT '["2", "24"]'
  )`
];

async function initializeDatabase() {
  for (const statement of TABLES) {
    await db.pool.query(statement);
  }
  console.log('All tables created/verified');
  await insertDefaultUsers();
}

async function insertDefaultUsers() {
  const defaultUsers = [
    { email: 'student@royal.edu', password: 'password123', name: 'Alex Johnson' },
    { email: 'demo@test.com', password: 'demo123', name: 'Demo User' }
  ];

  for (const user of defaultUsers) {
    const hashedPassword = bcrypt.hashSync(user.password, 10);
    await db.pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING',
      [user.email, hashedPassword, user.name]
    );
    console.log(`Default user ${user.email} ready`);
  }

  console.log('Database initialized successfully');
}

module.exports = {
  initializeDatabase,
  insertDefaultUsers
};
