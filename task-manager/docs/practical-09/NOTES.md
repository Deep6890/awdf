# Practical 9 — In-Memory Caching and Query Optimization (Notes & Viva)

## 1. What Was Built
1. **In-Memory Cache Architecture:**
   - Implemented `cache/cache.js` using `node-cache`, configured with `stdTTL=60` and `checkperiod=120`.
   - Exported a wrapper module providing `get(key)`, `set(key, val, ttl)`, `del(keys)`, `flush()`, and tracking hit/miss counters `{ hits, misses }`.
   - Supported runtime feature toggle via `process.env.CACHE_ENABLED !== 'false'`.
2. **Controller Integration & Exact Cache Keys:**
   - `GET /tasks`: Checks `cache.get('all_tasks')`. On HIT, returns cached array immediately. On MISS, queries MongoDB using `Task.find().sort({ createdAt: -1 }).lean()`, populates `all_tasks` in cache, and returns.
   - `GET /tasks/:id`: Supplementary single-item cache under `task_<id>`.
3. **Active Write Invalidation:**
   - `POST /tasks`: Evicts `all_tasks` via `cache.del('all_tasks')`.
   - `PUT /tasks/:id`: Evicts both `all_tasks` and `task_<id>`.
   - `DELETE /tasks/:id`: Evicts both `all_tasks` and `task_<id>`.
4. **Debug Cache Monitoring Endpoint:**
   - Exposed `GET /debug/cache` (auth-protected), returning `{ hits, misses, keys, ttl, enabled }`.
5. **Cross-Platform Scripting & Benchmarks:**
   - Added `"dev:nocache": "cross-env CACHE_ENABLED=false node server.js"` using `cross-env`.
   - Created `scripts/seed.js` to seed 500 benchmark tasks into MongoDB with `--clear` flag for cleanup.
   - Created `scripts/benchmark-cache.js` and `scripts/run-all-benchmarks.js` to record high-resolution timings across 5 consecutive requests for uncached and cached configurations.
   - Documented full benchmark results in `docs/practical-09/benchmark.md`.

---

## 2. Key Questions (Assignment & PDF Requirements)

### Q1: Why must the cache be invalidated immediately on write operations?
If a cache is not invalidated on write (`POST`, `PUT`, `DELETE`), subsequent `GET` requests continue reading stale data from memory until the Time-To-Live (TTL) expires. For example, if a user updates a task from "pending" to "done", but `cache.del('all_tasks')` is omitted, reloading the page will still show the task as "pending" for up to 60 seconds. Invalidation guarantees strong eventual consistency and immediate user feedback.

### Q2: What is the TTL trade-off for a task management application?
- **Short TTL (5–15 seconds):** Guarantees data freshness even if mutations happen outside the primary API (e.g., direct DB admin edits), but reduces cache hit ratio under moderate traffic, resulting in more database queries.
- **Moderate TTL (60 seconds):** The sweet spot for a task app. With active write invalidation, the list is always fresh during regular usage, while providing a 90%+ hit ratio under repeated page views and dashboard polling.
- **Long TTL (300+ seconds):** Maximizes hit ratio, but increases the risk of serving stale data if external systems modify the database or if an invalidation hook fails.

### Q3: Why does `node-cache` fail for multi-instance horizontal scaling, and what is the production solution?
`node-cache` is an **in-process memory cache** residing entirely inside the memory heap of a single Node.js process:
1. **Split-Brain Inconsistency:** When running multiple server instances (e.g., across 3 Docker containers or serverless workers behind a load balancer), instance A has its own memory and instance B has its own memory. When a client performs a `PUT` on instance A, instance A evicts its cache, but instance B's cache still holds the stale data! A client routed to instance B will see outdated tasks.
2. **Process Volatility:** Restarting or autoscaling the container wipes the entire cache.
3. **Production Solution:** Use a centralized, shared distributed cache such as **Redis** or **Memcached**. All application instances connect to the same Redis cluster over the network, ensuring that an invalidation command from any instance clears the shared key instantly for all workers.

---

## 3. Reflection & Errors Encountered

1. **Measurement Note:**
   - Uncached benchmark numbers were captured cleanly by toggling `CACHE_ENABLED=false` (using `npm run dev:nocache`) rather than commenting out or editing application code.
2. **Error: JWT Token Acquisition in Benchmark Harness**
   - *Problem:* Initial benchmark script checked `regData.token` directly on `/register`. Since the auth controller returns `{ message, user }` on registration and issues the JWT token on `/login`, requests received `401 Invalid token`.
   - *Fix:* Updated `benchmark-cache.js` and `run-all-benchmarks.js` to call `POST /login` immediately after registration to properly obtain the Bearer token.
3. **Optimization: Mongoose Query Lean Mode**
   - *Problem:* Caching full Mongoose documents introduces prototype overhead and slower JSON serialization.
   - *Fix:* Added `.lean()` to `Task.find().sort({ createdAt: -1 }).lean()`, returning plain JavaScript objects that store cleanly in `node-cache` and serialize up to 40% faster in Express responses.

---

## 4. 5 Likely Viva Questions & Concise Answers

### 1. What is the difference between Cache-Aside (Lazy Loading) and Write-Through caching?
- **Cache-Aside (used here):** The application first looks in the cache; on a cache miss, it reads from the database, writes the data to the cache, and returns it. On updates, it evicts (deletes) the cached key.
- **Write-Through:** The application writes data to both the cache and the database synchronously on every write operation.

### 2. What is the significance of the `checkperiod` option in `node-cache`?
`stdTTL` specifies how long in seconds a key remains valid. `checkperiod` (set to 120s) is the interval at which `node-cache` runs its background garbage collection timer to scan and delete expired keys from Node's memory heap, preventing memory leaks.

### 3. What does `GET /debug/cache` return and why is it useful?
It returns `{ hits, misses, keys, ttl, enabled }`. It allows operators and testers to inspect cache utilization in real time, verify whether keys are populated, and confirm that hit counters increment on successive reads without inspecting server logs.

### 4. What happens when a client sends a `PUT /tasks/:id` request?
1. The controller updates the MongoDB document.
2. It calls `cache.del(['all_tasks', 'task_' + id])` to evict both the full list key and the individual task item key.
3. It returns the updated task with status 200.
4. The next `GET /tasks` or `GET /tasks/:id` call triggers a cache miss, loads the fresh data from MongoDB, and repopulates the cache.

### 5. Why did we add `cross-env` for `dev:nocache`?
In Windows PowerShell or CMD, running `CACHE_ENABLED=false node server.js` fails because POSIX inline environment syntax is not recognized. `cross-env` sets environment variables consistently across Windows, macOS, and Linux without platform-specific shell scripts.
