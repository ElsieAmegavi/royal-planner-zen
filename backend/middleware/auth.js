const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

// Standardized API response helper
const sendResponse = (res, success, message, data = null, statusCode = 200) => {
  const response = {
    error: !success,
    message: message,
    data: data
  };
  return res.status(statusCode).json(response);
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return sendResponse(res, false, 'Access token required', null, 401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return sendResponse(res, false, 'Invalid token', null, 401);
    }
    req.user = user;
    next();
  });
};

module.exports = {
  sendResponse,
  authenticateToken
};
