require('dotenv').config();

// Validate JWT_SECRET
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('[FATAL] JWT_SECRET environment variable is required to start the server in production.');
    process.exit(1);
  } else {
    console.warn('[WARN] JWT_SECRET not found in .env; using local development secret.');
    process.env.JWT_SECRET = 'dev_jwt_secret_key_change_in_production';
  }
}

const app = require('./app');
const connectDB = require('./config/db');

// Register asynchronous event listeners (P10)
require('./events/listeners');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
