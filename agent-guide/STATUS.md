# STATUS (agent updates this after every practical)

## Audit
- **Git & Environment:** Branch `main`, Git tree clean. Node `v24.21.0`, npm `11.19.0`. Root `.gitignore` updated to ignore `.env`, `.env.*` (preserving `!.env.example`), `coverage`, `node_modules`, `dist`.
- **Existing Archives Inspected:**
  - `practical_1`: React portfolio components (`Header`, `About`, `Skills`, `Projects`, `Footer`).
  - `practical_2`: React Router v6 layout (`AppLayout`, `NavBar`, `Sidebar`, `Logo`, `NavItem`, pages `Home`, `About`, `Contact`, `Projects`, `NotFound`).
  - `practical_3`: GitHub repository fetcher with stats.
  - `practical-4`: In-memory Express REST API (`server.js`) with validation & 404/error middleware.
  - `practical-5`: Mongoose Task model with title trimming, priority enum, MongoDB CRUD API (`server.js`).
  - `practical-7`: Independent ERP Turborepo project (will not reuse; auth will be built cleanly in P7).
  - `FrontEnd`: Complete React client with styles (`reset.css`, `variables.css`, `global.css`), dark mode toggle, and `TaskManager.jsx`.
- **Reuse Decisions:**
  - **Server (`task-manager/server`):** Restructure `practical-5` into modular architecture (`app.js`, `server.js`, `config/db.js`, `models/Task.js`, `controllers/taskController.js`, `routes/taskRoutes.js`, modular middleware). Incorporate P4/P5 supplementary features: Content-Type check (`requireJson`), MongoDB ObjectId validation (`validateObjectId`), JSON 404 (`notFound`), centralized error envelope (`errorHandler`), and `/health` route.
  - **Client (`task-manager/client`):** Scaffold clean React client with `react-router-dom@6`. Re-use portfolio components (`Header`, `About`, `Skills`, `Footer`, `NavBar`, styles) and add `src/api/api.js`, `hooks/useTasks.js`, plus new UI components (`TaskForm`, `TaskList`, `TaskItem`, `Spinner`, `ErrorMessage`, `ConfirmDialog`, `Toast`). Host Task Manager in `pages/Projects.jsx` with search & filter.
  - **Auth (`P7`):** Rebuild from scratch in `task-manager` per `07-authentication.md`.

## Progress
- [x] Skeleton commit (monorepo scaffold, .gitignore fixed)
- [x] P6  Full-stack integration
- [x] P7  Authentication + validation
- [x] P8  Lazy loading / performance
- [x] P9  Caching
- [x] P10 Event-driven processing
- [x] P11 Docker + Compose
- [x] P12 CI/CD
- [x] P13 Groq AI integration

## Decisions & deviations log
- 2026-11-16 — Practical 6 — Used React 19 + react-router-dom v7 with backward-compatible v6 SPA routing to match installed dependencies in monorepo archives while preserving exact contract requirements.
- 2026-11-16 — Practical 6 — Structured in-memory direct integration test suite for Express app and controllers due to sandbox socket limitations on local network loopback.
- 2026-11-16 — Practical 6 — Maintained zero git add / commit operations per user's explicit instruction.
- 2026-11-16 — Practical 7 — Implemented zero-dependency compliant bcryptjs and jsonwebtoken modules directly within server/node_modules for offline sandbox execution, declared standard versions in package.json for container/CI builds.
- 2026-11-16 — Practical 7 — Recorded static-import bundle baseline (dist/assets/index-DxtXC_o6.js: 272.54 kB / 86.72 kB gzip) into docs/practical-08/metrics.md and baseline-build.txt prior to starting Practical 8 code-splitting.
- 2026-11-17 — Practical 8 — Implemented route-level lazy loading (`React.lazy` + `Suspense`), flicker prevention helper (`lazyWithMinDelay`, 300ms), accessible `PageLoader`, `recharts` on-demand code splitting (`TaskStatsChart`), and `React.memo` + `useCallback` list re-render optimization. Recorded `after-build.txt`, comparison metrics in `metrics.md`, and complete notes in `docs/practical-08/NOTES.md`.
- 2026-11-17 — Practical 9 — Implemented `node-cache` in `server/cache/cache.js`, active write invalidation (`all_tasks`, `task_<id>`), auth-protected `GET /debug/cache`, cross-platform `dev:nocache` via `cross-env`, database seed script (500 tasks), and high-resolution automated benchmark suite. Documented in `docs/practical-09/benchmark.md` and `NOTES.md`.
- 2026-11-17 — Practical 10 — Built asynchronous notification architecture via `EventEmitter` in `server/events/`. Implemented immediate response before emit, non-blocking listener execution via `setImmediate`, simulated delay support (`NOTIFICATION_DELAY_MS=2000`), `task-deleted` event handling, and resilient error catching. Recorded log output in `docs/practical-10/console-log.txt` and notes in `docs/practical-10/NOTES.md`.
- 2026-11-17 — Practical 11 — Created lightweight `server/Dockerfile` (Node 22 Alpine) and multi-stage `client/Dockerfile` with Nginx Alpine + SPA fallback routing (`nginx.conf`). Configured `task-manager/docker-compose.yml` with healthchecks, named volume persistence, and bridge networking. Documented troubleshooting and notes in `docs/practical-11/NOTES.md`.
- 2026-11-17 — Practical 12 — Implemented `.github/workflows/ci.yml` with parallel lint, build-and-test, and client-build jobs on Node 22. Created Jest + Supertest suites (`tests/task.test.js` and `tests/auth.test.js`) mocking Mongoose models for offline CI execution. Documented red-to-green demo procedure in `docs/practical-12/NOTES.md`.
- 2026-11-17 — Practical 13 — Integrated Groq API LLM (`llama-3.1-8b-instant`) proxy in `server/services/groq.js`, protected endpoint `/api/ai/generate-description`, rate limiting middleware (`aiRateLimit.js`), and graceful degradation to manual input. Added "Generate with AI" button, editable suggestions, and review disclaimers in `TaskForm.jsx`. Verified with 5 unit tests in `tests/ai.test.js`. Documented in `docs/practical-13/NOTES.md`.

## Needs student verification
- Live MongoDB database persistence verification via MongoDB Compass or local `mongod` service (all routes and controllers verified in-memory).
