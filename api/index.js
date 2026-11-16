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
  return app(req, res);
};
