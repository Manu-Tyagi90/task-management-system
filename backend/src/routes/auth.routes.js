const express = require('express');
const router = express.Router();
const {
  register,
  login,
  refreshAccessToken,
  logout,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  handleValidationErrors
} = require('../middleware/validation.middleware');

// Public routes
router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.post('/refresh', refreshAccessToken);

// Protected routes
router.use(protect); // All routes after this require authentication

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/update-profile', validateUpdateProfile, handleValidationErrors, updateProfile);
router.put('/change-password', validateChangePassword, handleValidationErrors, changePassword);

module.exports = router;