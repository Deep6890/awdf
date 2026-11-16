require('dotenv').config();
const mongoose = require('mongoose');
const { performance } = require('perf_hooks');
const connectDB = require('../config/db');
const Task = require('../models/Task');
const cache = require('../cache/cache');
const app = require('../app');

async function runFullBenchmark() {
  await connectDB();
  console.log('MongoDB connected for automated benchmark suite.');

  // Start app on port 5055 for clean isolated testing
  const PORT = 5055;
  const server = app.listen(PORT);
  const BASE_URL = `http://localhost:${PORT}`;

  const benchmarkUser = {
    email: `benchmark_user_${Date.now()}@example.com`,
    password: 'Password123!'
  };

  // Register user
  await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(benchmarkUser)
  });

  // Login user to get JWT token
  const loginRes = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(benchmarkUser)
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log('Benchmark user authenticated. Token acquired:', Boolean(token));

  // 1. UNCACHED BENCHMARK (CACHE_ENABLED=false)
  process.env.CACHE_ENABLED = 'false';
  cache.flush();
  cache.resetStats();

  const uncachedReadings = [];
  for (let i = 1; i <= 5; i++) {
    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const t1 = performance.now();
    uncachedReadings.push({
      req: i,
      status: res.status,
      count: data.length,
      timeMs: Number((t1 - t0).toFixed(2))
    });
  }

  // 2. CACHED BENCHMARK (CACHE_ENABLED=true)
  process.env.CACHE_ENABLED = 'true';
  cache.flush();
  cache.resetStats();

  const cachedReadings = [];
  for (let i = 1; i <= 5; i++) {
    const t0 = performance.now();
    const res = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const t1 = performance.now();
    cachedReadings.push({
      req: i,
      status: res.status,
      count: data.length,
      timeMs: Number((t1 - t0).toFixed(2)),
      isMiss: i === 1
    });
  }

  // 3. CACHE DEBUG STATS
  const debugRes = await fetch(`${BASE_URL}/debug/cache`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const debugStats = await debugRes.json();

  // 4. INVALIDATION DEMO (GET -> PUT -> GET)
  console.log('\n--- Cache Invalidation Demonstration ---');
  // Initial GET ensures 'all_tasks' is cached
  await fetch(`${BASE_URL}/tasks`, { headers: { Authorization: `Bearer ${token}` } });
  const keysBefore = cache.keys();
  console.log('Keys before mutation:', keysBefore);

  // Pick a task to update
  const sampleTask = await Task.findOne();
  const originalTitle = sampleTask.title;
  const updatedTitle = `${originalTitle} [UPDATED]`;

  // Perform PUT
  const putRes = await fetch(`${BASE_URL}/tasks/${sampleTask._id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title: updatedTitle })
  });
  const putData = await putRes.json();
  const keysAfterPut = cache.keys();
  console.log('PUT status:', putRes.status);
  console.log('Keys immediately after PUT (invalidated):', keysAfterPut);

  // Next GET triggers MISS and re-populates cache with updated title
  const t0Fresh = performance.now();
  const freshRes = await fetch(`${BASE_URL}/tasks`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Fresh GET status:', freshRes.status);
  const freshData = await freshRes.json();
  console.log('Fresh GET data type:', Array.isArray(freshData) ? 'Array' : typeof freshData, freshData);
  const freshDuration = (performance.now() - t0Fresh).toFixed(2);
  const foundUpdated = Array.isArray(freshData) ? freshData.find((t) => t._id.toString() === sampleTask._id.toString()) : null;

  console.log('Fresh GET response time (MISS):', freshDuration, 'ms');
  console.log('Updated title in fresh GET:', foundUpdated?.title);

  // Revert the title back
  await Task.findByIdAndUpdate(sampleTask._id, { title: originalTitle });
  cache.del(['all_tasks', `task_${sampleTask._id}`]);

  // Clean up server and connection
  server.close();
  await mongoose.connection.close();

  // Print Summary Results JSON
  console.log('\n=== FINAL BENCHMARK SUMMARY ===');
  console.log(
    JSON.stringify(
      {
        uncachedReadings,
        cachedReadings,
        debugStats,
        invalidationProof: {
          keysBefore,
          keysAfterPut,
          updatedTaskConfirmed: foundUpdated?.title === updatedTitle
        }
      },
      null,
      2
    )
  );
  process.exit(0);
}

runFullBenchmark().catch((err) => {
  console.error('Benchmark suite error:', err);
  process.exit(1);
});
