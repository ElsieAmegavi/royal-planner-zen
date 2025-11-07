const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/connection');
const { sendResponse, authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/', authenticateToken, (req, res) => {
  db.get('SELECT * FROM user_profiles WHERE user_id = ?', [req.user.userId], (err, profile) => {
    if (err) {
      return sendResponse(res, false, 'Database error', null, 500);
    }
    if (profile) {
      sendResponse(res, true, 'Profile retrieved successfully', profile);
    } else {
      // Return default profile structure if no profile exists
      const defaultProfile = {
        id: null,
        user_id: req.user.userId,
        name: "",
        email: "",
        academic_level: "",
        academic_years: 4
      };
      sendResponse(res, true, 'No profile found, returning defaults', defaultProfile);
    }
  });
});

// Update user profile
router.put('/', authenticateToken, (req, res) => {
  const { name, email, academicLevel, academicYears } = req.body;
  
  db.run('UPDATE user_profiles SET name = ?, email = ?, academic_level = ?, academic_years = ? WHERE user_id = ?',
    [name, email, academicLevel, academicYears, req.user.userId], function(err) {
      if (err) {
        return sendResponse(res, false, 'Failed to update profile', null, 500);
      }
      sendResponse(res, true, 'Profile updated successfully');
    });
});

// Update user password
router.put('/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  try {
    // Get current user
    db.get('SELECT * FROM users WHERE id = ?', [req.user.userId], async (err, user) => {
      if (err) {
        return sendResponse(res, false, 'Database error', null, 500);
      }
      if (!user) {
        return sendResponse(res, false, 'User not found', null, 404);
      }
      
      // Verify current password
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return sendResponse(res, false, 'Current password is incorrect', null, 400);
      }
      
      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      db.run('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, req.user.userId], function(err) {
        if (err) {
          return sendResponse(res, false, 'Failed to update password', null, 500);
        }
        sendResponse(res, true, 'Password updated successfully');
      });
    });
  } catch (error) {
    sendResponse(res, false, 'Server error', null, 500);
  }
});

module.exports = router;
