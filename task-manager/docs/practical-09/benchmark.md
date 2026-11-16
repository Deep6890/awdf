# Practical 9 — In-Memory Caching Benchmark Report

## 1. Test Setup & Methodology
- **Hardware & Environment:** Node.js v24.21.0 on Windows 11, Express 4.21.2, MongoDB 7.0 (Docker container `mongo-dev` on `localhost:27017`).
- **Dataset Size:** 500 tasks seeded via `scripts/seed.js` with randomized priorities, descriptions, and completion statuses.
- **Timing Measurement:** High-resolution timestamps via Node.js `performance.now()`.
- **Toggle Mechanism:** Switching `process.env.CACHE_ENABLED` between `'false'` and `'true'` (and using `npm run dev:nocache` via `cross-env CACHE_ENABLED=false`) without altering controller source code.
- **Cache Module:** `node-cache` instance configured in `cache/cache.js` with `stdTTL=60` and `checkperiod=120`.

---

## 2. Benchmark Readings (5 Requests Per Configuration)

### Table 1: Uncached Run (`CACHE_ENABLED=false`)

| Request # | HTTP Status | Tasks Returned | Response Time (ms) | Cache State | Notes |
|---|---|---|---|---|---|
| Request 1 | 200 OK | 500 | 18.11 ms | BYPASSED | First query, Mongo connection warm-up |
| Request 2 | 200 OK | 500 | 9.50 ms | BYPASSED | MongoDB query + BSON deserialization |
| Request 3 | 200 OK | 500 | 8.73 ms | BYPASSED | MongoDB query + BSON deserialization |
| Request 4 | 200 OK | 500 | 8.91 ms | BYPASSED | MongoDB query + BSON deserialization |
| Request 5 | 200 OK | 500 | 9.39 ms | BYPASSED | MongoDB query + BSON deserialization |

- **Average Uncached Response Time:** **10.93 ms** (5 requests)

---

### Table 2: Cached Run (`CACHE_ENABLED=true`)

| Request # | HTTP Status | Tasks Returned | Response Time (ms) | Cache State | Notes |
|---|---|---|---|---|---|
| Request 1 | 200 OK | 500 | 11.90 ms | **MISS** | First request: queried MongoDB and set `all_tasks` |
| Request 2 | 200 OK | 500 | 5.01 ms | **HIT** | In-memory lookup, 0 DB queries |
| Request 3 | 200 OK | 500 | 4.90 ms | **HIT** | In-memory lookup, 0 DB queries |
| Request 4 | 200 OK | 500 | 4.22 ms | **HIT** | In-memory lookup, 0 DB queries |
| Request 5 | 200 OK | 500 | 3.90 ms | **HIT** | In-memory lookup, 0 DB queries |

- **Average Cached Response Time (All Requests):** **5.99 ms** (-45.2% vs uncached)
- **Average Cache Hit Response Time (Requests 2–5):** **4.51 ms** (-58.7% vs uncached)
- **Cache Debug Stats (`GET /debug/cache`):** `{ hits: 4, misses: 1, keys: ["all_tasks"], ttl: 60, enabled: true }`

---

## 3. Analysis & Interpretation
1. **Latency Reduction:** Serving tasks directly from RAM (`node-cache`) reduces average latency from ~10.93 ms down to ~4.51 ms for hits — a **~58.7% performance improvement**.
2. **Database Offloading:** On a system receiving 100 requests per second, caching saves 99+ database queries per minute for `GET /tasks`, drastically saving IOPS, CPU cycles, and network socket handles.
3. **First Request Penalty:** Request 1 in the cached run is a **Cache MISS** (11.90 ms), as it executes the database query, serializes the result, and stores it in memory. Subsequent calls immediately experience high-speed RAM retrieval.

---

## 4. Cache Invalidation Demonstration (GET → PUT → GET)

To ensure clients never receive stale data after a mutation, the controller actively evicts the cache on write operations (`POST`, `PUT`, `DELETE`).

```
1. [Initial GET /tasks]
   -> Cache State: MISS -> POPULATED
   -> Keys in Cache: ["all_tasks"]

2. [Mutation: PUT /tasks/6afb5254d0cf3a74269225aa]
   -> Payload: { title: "Sample task #1 [UPDATED]" }
   -> HTTP Status: 200 OK
   -> Invalidation Hook: cache.del(['all_tasks', 'task_6afb5254d0cf3a74269225aa'])
   -> Keys in Cache Immediately After PUT: [] (Evicted!)

3. [Subsequent GET /tasks]
   -> Cache State: MISS -> Fresh DB Fetch -> POPULATED
   -> Response Time: 13.89 ms
   -> Verified Data: "Sample task #1 [UPDATED]" returned accurately.
   -> Keys in Cache: ["all_tasks"]
```

---

## 5. TTL Experiment (Trade-off Analysis)

Testing `CACHE_TTL` values of **5s**, **60s**, and **300s**:

| CACHE_TTL | Hit Ratio (under normal traffic) | Staleness Risk | Best Fit For |
|---|---|---|---|
| **5 seconds** | Low–Medium (~40–60%) | Negligible. Auto-expires in 5s even if an external tool alters DB directly. | High-concurrency dashboards with near-real-time requirements. |
| **60 seconds (Selected)** | High (~90–95%) | Low. With explicit write invalidation (`POST`/`PUT`/`DELETE`), list is always fresh. External DB writes refresh in ≤1 min. | **Optimal for Task Manager full-stack app.** |
| **300 seconds (5 min)** | Very High (~98%) | Moderate–High if external mutations occur or invalidation hooks fail. | Read-heavy static content (e.g., product catalog, blog posts). |
