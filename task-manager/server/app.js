const express = require('express');
const cors = require('cors');

const logger = require('./middleware/logger');
const requireJson = require('./middleware/requireJson');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth');
const cache = require('./cache/cache');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Enable CORS for local dev and production (Vercel)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const clientOrigin = process.env.CLIENT_ORIGIN;
      if (
        origin === 'http://localhost:5173' ||
        origin === 'http://127.0.0.1:5173' ||
        origin === 'http://localhost:3000' ||
        (clientOrigin && origin === clientOrigin) ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  })
);

// Body parser
app.use(express.json());

// Request logger
app.use(logger);

// Health check endpoint (for Docker / CI)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Require JSON content-type on mutating requests
app.use(requireJson);

// Mount authentication routes (/register, /login, /me)
app.use('/', authRoutes);

// Debug cache endpoint (P9 Assignment, auth-protected)
app.get('/debug/cache', auth, (req, res) => {
  res.status(200).json(cache.getDebugStats());
});

// Mount task routes (/tasks)
app.use('/tasks', taskRoutes);

// Mount AI routes (/api/ai, P13)
app.use('/api/ai', aiRoutes);

// 404 handler for unknown routes
app.use(notFound);

// Centralized error handler (must be last)
app.use(errorHandler);

module.exports = app;
