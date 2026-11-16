const mongoose = require('mongoose');
const app = require('../task-manager/server/app');
const connectDB = require('../task-manager/server/config/db');

module.exports = async (req, res) => {
  // Ensure MongoDB connection before processing request
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      console.error('Vercel DB connection error:', err.message);
      return res.status(500).json({
        error: 'Database connection failed',
        details: err.message,
        tip: 'Please ensure MONGO_URI is configured in Vercel Environment Variables and MongoDB Atlas IP access allows 0.0.0.0/0'
      });
    }
  }

  // Restore original request path if Vercel rewrote the path to /api
  const matchedPath = req.headers['x-matched-path'];
  if (matchedPath && req.url === '/api') {
    req.url = matchedPath;
  }

  return app(req, res);
};
