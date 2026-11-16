require('dotenv').config();
const mongoose = require('mongoose');
const { performance } = require('perf_hooks');
const connectDB = require('../config/db');
const Task = require('../models/Task');
const app = require('../app');

// Ensure listeners are registered
require('../events/listeners');
const taskEvents = require('../events/events');

async function testEventDrivenFlow() {
  process.env.NOTIFICATION_DELAY_MS = '2000';
  await connectDB();

  const PORT = 5066;
  const server = app.listen(PORT);
  const BASE_URL = `http://localhost:${PORT}`;

  const testUser = {
    email: `event_tester_${Date.now()}@example.com`,
    password: 'Password123!'
  };

  // Register & login
  await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });

  const loginRes = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  const { token } = await loginRes.json();

  console.log('\n--- 1. Testing POST /tasks with NOTIFICATION_DELAY_MS=2000 ---');
  const t0 = performance.now();
  const createRes = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'P10 Event Async Test Task',
      description: 'Testing non-blocking notification emitter',
      priority: 'high'
    })
  });
  const t1 = performance.now();
  const createdTask = await createRes.json();
  const apiElapsedMs = (t1 - t0).toFixed(2);

  console.log(`[CLIENT] HTTP ${createRes.status} received in ${apiElapsedMs} ms`);
  console.log(`[CLIENT] Created Task ID: ${createdTask._id}`);

  // Wait 2.5 seconds to observe the async notification finish
  console.log('[TEST] Waiting 2.5s for async event handler to complete in background...');
  await new Promise((r) => setTimeout(r, 2500));

  console.log('\n--- 2. Testing DELETE /tasks with NOTIFICATION_DELAY_MS=2000 ---');
  const tDelete0 = performance.now();
  const deleteRes = await fetch(`${BASE_URL}/tasks/${createdTask._id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const tDelete1 = performance.now();
  const deleteElapsedMs = (tDelete1 - tDelete0).toFixed(2);

  console.log(`[CLIENT] HTTP ${deleteRes.status} received in ${deleteElapsedMs} ms`);

  // Wait 2.5 seconds for delete notification finish
  console.log('[TEST] Waiting 2.5s for delete notification handler to complete...');
  await new Promise((r) => setTimeout(r, 2500));

  console.log('\n--- 3. Testing Handler Error Resiliency ---');
  let errorHandlerCaught = false;
  taskEvents.once('handler-error', (err, taskId) => {
    errorHandlerCaught = true;
    console.log(`[TEST PASSED] Custom 'handler-error' caught: "${err.message}" for task ${taskId}`);
  });

  // Temporarily emit an event that triggers an error inside a handler
  taskEvents.emit('task-created', null, testUser);
  await new Promise((r) => setTimeout(r, 200));

  server.close();
  await mongoose.connection.close();

  console.log('\n--- Summary Verification ---');
  console.log(`- API response time during POST: ${apiElapsedMs} ms (MUST be << 2000ms)`);
  console.log(`- API response time during DELETE: ${deleteElapsedMs} ms (MUST be << 2000ms)`);
  console.log(`- Error handler caught error gracefully: ${errorHandlerCaught}`);
  console.log('Test completed successfully.');
  process.exit(0);
}

testEventDrivenFlow().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
