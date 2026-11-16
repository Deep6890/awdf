const app = require('../task-manager/server/app');
const connectDB = require('../task-manager/server/config/db');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (err) {
      console.error('Vercel DB connection error:', err.message);
    }
  }

  // Restore original request path if Vercel rewrote the path to /api
  const matchedPath = req.headers['x-matched-path'];
  if (matchedPath && req.url === '/api') {
    req.url = matchedPath;
  }

  return app(req, res);
};
