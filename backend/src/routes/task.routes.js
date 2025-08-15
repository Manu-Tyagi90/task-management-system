const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment,
  updateComment,
  deleteComment,
  getTaskStats
} = require('../controllers/task.controller');
const { protect } = require('../middleware/auth.middleware');
const {
  validateCreateTask,
  validateUpdateTask,
  validateTaskComment,
  handleValidationErrors
} = require('../middleware/validation.middleware');

// All routes require authentication
router.use(protect);

// Task statistics (place before /:id to avoid conflict)
router.get('/stats', getTaskStats);

// Task CRUD
router.route('/')
  .get(getTasks)
  .post(validateCreateTask, handleValidationErrors, createTask);

router.route('/:id')
  .get(getTask)
  .put(validateUpdateTask, handleValidationErrors, updateTask)
  .delete(deleteTask);

// Task comments
router.route('/:id/comments')
  .post(validateTaskComment, handleValidationErrors, addComment);

router.route('/:id/comments/:commentId')
  .put(validateTaskComment, handleValidationErrors, updateComment)
  .delete(deleteComment);

module.exports = router;