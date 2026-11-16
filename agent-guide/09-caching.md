# Practical 9 — In-Memory Caching and Query Optimization

**Goal:** `node-cache` on `GET /tasks`, invalidated on writes, with measured before/after response times.

## Implementation
1. `npm i node-cache` (server). `cache/cache.js`: `new NodeCache({ stdTTL: Number(process.env.CACHE_TTL) || 60, checkperiod: 120 })`; export the instance plus a small wrapper exposing `stats` counters `{ hits, misses }` (increment in the wrapper's `get`).
2. `GET /tasks`: if `CACHE_ENABLED !== 'false'` → `cache.get('all_tasks')`; HIT returns immediately; MISS queries Mongo, `cache.set('all_tasks', tasks)`, returns. Use the exact key `all_tasks`.
3. **Invalidate after every successful write:** POST → `del('all_tasks')`; PUT/DELETE → `del('all_tasks')` **and** `del('task_<id>')`.
4. **Supplementary:** `GET /tasks/:id` cached under `task_<id>` separately.
5. **Assignment:** `GET /debug/cache` (auth-protected) → `{ hits, misses, keys, ttl, enabled }`.
6. Client: no change needed. Optionally show nothing.
7. Make the toggle cross-platform: `npm run dev:nocache` = `cross-env CACHE_ENABLED=false node server.js` (add `cross-env` dev dep). Do not use `VAR=x cmd` syntax.

## Benchmark (real numbers, at least 3 readings per case — use 5)
1. `scripts/seed.js`: insert ~500 sample tasks (clearly marked, e.g. title prefix `Sample task`), idempotent, with a `--clear` flag for removal. Small datasets hide the effect.
2. `scripts/benchmark-cache.js <label>`: registers/logs in a benchmark user, calls `GET /tasks` N=5 times, measures with `performance.now()`, prints a markdown table row set. The first request in the cached run is a MISS; record it separately and say so.
3. Run twice: server with `CACHE_ENABLED=false` (uncached) and `true` (cached). Write results to `docs/practical-09/benchmark.md`: two tables (uncached / cached, 5 readings each, average) and a short interpretation.
4. **Supplementary — TTL experiment:** try `CACHE_TTL` 5, 60, 300; document the staleness vs performance trade-off (staleness only possible if invalidation is skipped or data changes outside the API).
5. **Demonstrate invalidation:** script/steps showing GET → PUT → GET returns updated data. Also describe (in NOTES, don't ship) what a missing `del` would do.
6. State in NOTES that uncached numbers were taken with `CACHE_ENABLED=false` rather than by editing code.

## Verify
- Repeated GET shows hit counter rising in `/debug/cache`.
- After POST/PUT/DELETE the next GET is a miss and returns fresh data.
- With caching disabled everything still works.

## Key Questions → NOTES.md
Why invalidate on write (stale/incorrect reads for up to TTL); TTL trade-off for a task app (short = fresher but more DB load; ~30–60 s reasonable, longer risks stale lists); why node-cache fails for multi-instance (per-process memory: instance A's invalidation does not clear instance B's cache; restart wipes it → use Redis).

## Evidence (MANUAL_TASKS)
Postman/Thunder Client screenshots showing the **Time** field for 3 cached + 3 uncached requests (the PDF explicitly asks for Postman/Thunder readings; scripted numbers are the backup).

## Commit
`perf(p9): add node-cache for GET /tasks with invalidation and benchmarks`
