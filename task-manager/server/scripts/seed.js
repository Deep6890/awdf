require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Task = require('../models/Task');

const SAMPLE_PREFIX = 'Sample task';
const TARGET_COUNT = 500;

async function runSeed() {
  await connectDB();

  const isClear = process.argv.includes('--clear');

  if (isClear) {
    const result = await Task.deleteMany({
      title: { $regex: `^${SAMPLE_PREFIX}` }
    });
    console.log(`Cleared ${result.deletedCount} sample benchmark tasks from database.`);
    await mongoose.connection.close();
    process.exit(0);
  }

  // Count existing sample tasks for idempotency
  const existingCount = await Task.countDocuments({
    title: { $regex: `^${SAMPLE_PREFIX}` }
  });

  if (existingCount >= TARGET_COUNT) {
    console.log(`Already seeded: found ${existingCount} sample tasks. Skipping insert.`);
    await mongoose.connection.close();
    process.exit(0);
  }

  const tasksToCreate = [];
  const priorities = ['low', 'medium', 'high'];

  for (let i = existingCount + 1; i <= TARGET_COUNT; i++) {
    tasksToCreate.push({
      title: `${SAMPLE_PREFIX} #${i}`,
      description: `Auto-generated benchmark task #${i} with sample metadata for caching performance analysis`,
      priority: priorities[i % priorities.length],
      completed: i % 3 === 0,
      createdAt: new Date(Date.now() - i * 1000)
    });
  }

  await Task.insertMany(tasksToCreate);
  console.log(`Successfully seeded ${tasksToCreate.length} sample tasks (total now: ${TARGET_COUNT}).`);

  await mongoose.connection.close();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('Seed script error:', err);
  process.exit(1);
});
