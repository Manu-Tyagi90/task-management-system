const express = require('express');
const router = express.Router();

// Welcome route
router.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Task Management API',
    version: '1.0.0',
    endpoints: {
      test: '/api/test',
      health: '/health',
      auth: '/api/auth (coming soon)',
      users: '/api/users (coming soon)',
      tasks: '/api/tasks (coming soon)'
    }
  });
});

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: '✅ API routes are working perfectly!',
    timestamp: new Date().toISOString(),
    headers: req.headers['user-agent']
  });
});

// These will be added in Part 2 and 3
// router.use('/auth', require('./auth.routes'));
// router.use('/users', require('./user.routes'));
// router.use('/tasks', require('./task.routes'));

module.exports = router;