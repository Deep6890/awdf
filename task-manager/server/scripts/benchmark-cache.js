require('dotenv').config();
const { performance } = require('perf_hooks');

const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const label = process.argv[2] || (process.env.CACHE_ENABLED === 'false' ? 'Uncached' : 'Cached');

async function benchmark() {
  console.log(`\n========================================`);
  console.log(` Starting Benchmark: ${label}`);
  console.log(` Target URL: ${BASE_URL}`);
  console.log(` CACHE_ENABLED: ${process.env.CACHE_ENABLED !== 'false'}`);
  console.log(`========================================\n`);

  const benchmarkUser = {
    email: `benchmark_${Date.now()}@example.com`,
    password: 'BenchmarkPassword123!'
  };

  // 1. Register benchmark user
  let token = null;
  try {
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(benchmarkUser)
    });
    const regData = await regRes.json();
    token = regData.token;
  } catch (err) {
    console.error(`Failed to connect to ${BASE_URL}. Ensure server is running!`, err.message);
    process.exit(1);
  }

  if (!token) {
    // Try login if user already exists
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(benchmarkUser)
    });
    const loginData = await loginRes.json();
    token = loginData.token;
  }

  if (!token) {
    console.error('Could not authenticate benchmark user.');
    process.exit(1);
  }

  // 2. Perform 5 consecutive GET /tasks calls
  const N = 5;
  const readings = [];

  for (let i = 1; i <= N; i++) {
    const start = performance.now();
    const res = await fetch(`${BASE_URL}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const duration = performance.now() - start;

    readings.push({
      iteration: i,
      status: res.status,
      count: Array.isArray(data) ? data.length : 0,
      durationMs: Number(duration.toFixed(2))
    });
  }

  // 3. Inspect debug cache endpoint
  let debugStats = null;
  try {
    const debugRes = await fetch(`${BASE_URL}/debug/cache`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    debugStats = await debugRes.json();
  } catch {
    // optional debug stats
  }

  // 4. Output Markdown Table
  console.log(`### Results: ${label}\n`);
  console.log(`| Request # | Status | Tasks Returned | Response Time (ms) | Cache Status |`);
  console.log(`|---|---|---|---|---|`);

  let totalMs = 0;
  readings.forEach((r, idx) => {
    totalMs += r.durationMs;
    const isFirstInCached = label.toLowerCase().includes('cache') && !label.toLowerCase().includes('no') && !label.toLowerCase().includes('un') && idx === 0;
    const cacheStatus = label.toLowerCase().includes('un') || label.toLowerCase().includes('no')
      ? 'BYPASSED (Disabled)'
      : isFirstInCached
        ? 'MISS (DB Query + Cached)'
        : 'HIT (In-Memory)';
    console.log(`| Request ${r.iteration} | ${r.status} | ${r.count} | ${r.durationMs.toFixed(2)} ms | ${cacheStatus} |`);
  });

  const avgMs = (totalMs / N).toFixed(2);
  console.log(`\n**Average Response Time:** ${avgMs} ms (over ${N} requests)`);
  if (debugStats) {
    console.log(`**Cache Debug Info:** Hits: ${debugStats.hits}, Misses: ${debugStats.misses}, Keys: [${debugStats.keys.join(', ')}], Enabled: ${debugStats.enabled}\n`);
  }

  return { label, readings, avgMs, debugStats };
}

benchmark().catch((err) => {
  console.error('Benchmark execution error:', err);
  process.exit(1);
});
