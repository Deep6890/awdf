const mongoose = require('mongoose');

let isConnected = false;

/**
 * Connect to MongoDB with automated retries (robust for containerized cold starts)
 * and connection caching for serverless environments (Vercel).
 */
const connectDB = async (retries = 5, delayMs = 2000) => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskdb';
  const isServerless = Boolean(process.env.VERCEL);
  const maxRetries = isServerless ? 1 : retries;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });
      isConnected = true;
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt}/${maxRetries} failed: ${err.message}`);
      if (attempt < maxRetries) {
        console.log(`Retrying MongoDB connection in ${delayMs / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        if (isServerless) {
          throw err;
        }
        if (process.env.NODE_ENV !== 'test') {
          console.warn('Continuing server execution; waiting for MongoDB or retry on next request...');
        }
      }
    }
  }
};

module.exports = connectDB;
