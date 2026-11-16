require('dotenv').config();

// Validate JWT_SECRET (must be present in .env)
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'test') {
  console.error('[FATAL] JWT_SECRET environment variable is required in .env to start the server.');
  process.exit(1);
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
