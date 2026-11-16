# Practical 8 — Performance Optimization and Lazy Loading

**Goal:** Route-based code splitting with `React.lazy` + `Suspense`, measured before and after.

## 1. Baseline FIRST (before changing any code)
All routes must still be **static imports**.
```
cd task-manager/client
npm run build
```
Save the full terminal output to `docs/practical-08/baseline-build.txt` and write the total JS size/gzip and chunk list into `docs/practical-08/metrics.md` (table: file, size, gzip). This baseline cannot be reconstructed later, so do it before step 2.
Add to `MANUAL_TASKS.md`: baseline DevTools Network screenshot (disable cache, hard reload, note total JS transferred + Load time).

## 2. Implement
1. In `App.jsx`: `const Projects = lazy(() => import('./pages/Projects'))`, same for `Contact`, `Login`, `Register` (and `Home` if desired). All lazy targets need **default exports**.
2. Wrap **only the `<Routes>` block** in `<Suspense fallback={<PageLoader />}>` — not the whole App, not NavBar.
3. `components/PageLoader.jsx`: meaningful fallback (spinner + "Loading page…"), accessible (`role="status"`).
4. **Supplementary — minimum delay fallback (300 ms):** helper `lazyWithMinDelay(factory, ms=300)` = `lazy(() => Promise.all([factory(), new Promise(r => setTimeout(r, ms))]).then(([m]) => m))`. Use it for route components so the loader never flickers.
5. **Supplementary / Assignment — heavy third-party component:** `npm i recharts` and add `components/TaskStatsChart.jsx` (completed vs pending, or tasks by priority) on the Projects page, loaded with `lazy` + its own small `Suspense` only when the user clicks **"Show stats"**. Verify it becomes a separate chunk.
6. **Supplementary — unnecessary re-render:** use React DevTools Profiler on the Projects page; the likely culprit is `TaskItem` re-rendering when typing in `TaskForm`/search. Fix with `React.memo(TaskItem)` + `useCallback` handlers in `useTasks`, and describe the before/after in NOTES.md. (The student must capture the Profiler screenshot — add to MANUAL_TASKS.)

## 3. Measure after
`npm run build` again → `docs/practical-08/after-build.txt`; update `metrics.md` with a before/after table (initial bundle size drop, list of new chunk files, per-chunk sizes). State honestly that **total code is the same; initial download is smaller**.

## Verify
- Build output shows separate chunks for Projects, Contact, Login, Register, and the chart.
- `npm run dev` with DevTools throttled to Slow 3G: fallback is visible, no console errors, no "Element type is invalid".
- Suspense wraps only Routes (NavBar stays visible while a page loads).

## Key Questions → NOTES.md
Initial bundle vs lazy chunk (when downloaded); why perceived performance improves (less to parse/execute before first paint; rest on demand); when not worth it (tiny app, chunks tiny, extra request waterfalls).

## Evidence (MANUAL_TASKS)
DevTools Network screenshots before/after (Slow 3G showing fallback), Profiler screenshot of the re-render, saved to `docs/practical-08/`.

## Commit
`perf(p8): add route-level lazy loading with Suspense and record before/after bundle sizes`
(The baseline files may be in an earlier commit; that's fine.)
