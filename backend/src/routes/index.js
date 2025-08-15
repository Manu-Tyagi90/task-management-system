const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const taskRoutes = require('./task.routes');

// Welcome route
router.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Task Management API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
        me: 'GET /api/auth/me',
        updateProfile: 'PUT /api/auth/update-profile',
        changePassword: 'PUT /api/auth/change-password'
      },
      users: {
        list: 'GET /api/users (admin)',
        get: 'GET /api/users/:id',
        update: 'PUT /api/users/:id (admin)',
        delete: 'DELETE /api/users/:id (admin)',
        assignable: 'GET /api/users/assignable'
      },
      tasks: {
        list: 'GET /api/tasks',
        create: 'POST /api/tasks',
        get: 'GET /api/tasks/:id',
        update: 'PUT /api/tasks/:id',
        delete: 'DELETE /api/tasks/:id',
        stats: 'GET /api/tasks/stats',
        addComment: 'POST /api/tasks/:id/comments',
        updateComment: 'PUT /api/tasks/:id/comments/:commentId',
        deleteComment: 'DELETE /api/tasks/:id/comments/:commentId'
      },
      test: 'GET /api/test',
      health: 'GET /health'
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

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;