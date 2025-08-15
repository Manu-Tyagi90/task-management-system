const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getAssignableUsers
} = require('../controllers/user.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// All routes require authentication
router.use(protect);

// Get assignable users (all authenticated users can access)
router.get('/assignable', getAssignableUsers);

// User management routes (admin only)
router.route('/')
  .get(adminOnly, getUsers);

router.route('/:id')
  .get(getUser) // Users can view their own profile
  .put(adminOnly, updateUser)
  .delete(adminOnly, deleteUser);

module.exports = router;