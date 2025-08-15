// backend/src/index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/database');
const routes = require('./routes');

const app = express();

/* Security headers */
app.use(
  helmet({
    crossOriginResourcePolicy: false, // let external downloads/CDNs work
  })
);

/* CORS — allow your Vercel app + localhost */
const STATIC_ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,     // e.g. https://task-management-system-frontend-gold.vercel.app
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5174',
].filter(Boolean);

// Optional: temporarily allow all Vercel preview URLs during testing
const isAllowedPreview = (origin) => origin && /\.vercel\.app$/.test(origin);

const corsOptions = {
  origin: (origin, callback) => {
    // Non-browser tools (no Origin header) -> allow
    if (!origin) return callback(null, true);
    if (STATIC_ALLOWED_ORIGINS.includes(origin) || isAllowedPreview(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  // Explicitly allow common headers (browser will mirror these for preflight)
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 600, // cache preflight for 10 minutes
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // IMPORTANT: handle preflight (OPTIONS)

/* Standard middleware */
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* Connect DB (after middleware is fine) */
connectDB();

/* Basic route for testing */
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Task Management API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/* Health check */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is healthy',
    uptime: process.uptime(),
  });
});

/* API Routes */
app.use('/api', require('./routes'));

/* Error handler */
app.use((err, req, res, next) => {
  if (err && /Not allowed by CORS/i.test(err.message)) {
    return res.status(403).json({ success: false, message: err.message });
  }
  console.error('Error:', err.stack || err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

/* 404 */
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
  });
});

/* Start server */
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('\n========================================');
  console.log(`🚀 Server is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📘 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🕐 Started: ${new Date().toLocaleString()}`);
  console.log('========================================\n');
});

/* Graceful shutdown */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;