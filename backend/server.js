const express = require('express');
const cors = require('cors');
const db = require('./database/connection');
const { initializeDatabase } = require('./database/init');
const { PORT, CORS_ORIGIN } = require('./config');

// Import route modules
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const semesterRoutes = require('./routes/semesters');
const gradeRoutes = require('./routes/grades');
const eventRoutes = require('./routes/events');
const journalRoutes = require('./routes/journal');
const targetRoutes = require('./routes/targets');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');

const app = express();

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check (used by hosting platforms)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/grade-settings', gradeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/target-grades', targetRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Initialize database, then start the server — a Postgres connection is a
// real network round-trip, so requests must not be accepted before the
// tables (and their foreign keys) actually exist.
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Royal Planner Backend server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});