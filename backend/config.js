module.exports = {
  PORT: process.env.PORT || 3001,
  JWT_SECRET: process.env.JWT_SECRET || 'royal-planner-secret-key-2024',
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:8080',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:devpassword@localhost:5433/royal_planner'
};
