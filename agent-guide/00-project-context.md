# 00 — Project Context

## 1. What we are building
A **Task Management full-stack app** (React + Express + MongoDB) that grows through Practicals 6–13.
Practicals 1–5 produced the pieces separately (portfolio React app with routing and API fetch; Express CRUD API; Mongoose). Practical 6 merges them into one project; 7–13 extend it.

## 2. Final repository layout

The git repository root is `E:\Sem-5\AWDF` (it already has `.git`). Final state:

```
AWDF/                              <- git root
├── .git/
├── .github/workflows/ci.yml       <- MUST be at git root for GitHub Actions (P12)
├── .gitignore                     <- must ignore node_modules, .env, dist, coverage
├── AGENTS.md / CLAUDE.md          <- pointers to agent-guide
├── agent-guide/                   <- this folder
├── practical_1 … practical-7/     <- OLD archives, READ-ONLY, do not edit or delete
├── FrontEnd/                      <- READ-ONLY, inspect only
└── task-manager/                  <- NEW consolidated project for P6–P13
    ├── client/                    <- Vite + React
    │   ├── Dockerfile, nginx.conf, .dockerignore, .env.example
    │   └── src/
    │       ├── api/api.js
    │       ├── components/        (Header, About, Skills, Footer, NavBar, Spinner, ErrorMessage,
    │       │                       TaskForm, TaskItem, TaskList, ConfirmDialog, Toast, PageLoader,
    │       │                       ProtectedRoute, TaskStatsChart)
    │       ├── context/AuthContext.jsx
    │       ├── hooks/useTasks.js
    │       ├── pages/             (Home, Projects, Contact, Login, Register, NotFound)
    │       ├── App.jsx, main.jsx
    ├── server/                    <- Express + Mongoose
    │   ├── Dockerfile, .dockerignore, .env.example
    │   ├── app.js                 <- builds & exports the Express app (no listen) -> testable
    │   ├── server.js              <- loads env, connects DB, app.listen
    │   ├── config/db.js
    │   ├── models/Task.js, User.js
    │   ├── controllers/taskController.js, authController.js, aiController.js
    │   ├── routes/taskRoutes.js, authRoutes.js, aiRoutes.js
    │   ├── middleware/logger.js, auth.js, validate.js, requireJson.js, validateObjectId.js,
    │   │              notFound.js, errorHandler.js, aiRateLimit.js
    │   ├── cache/cache.js         (P9)
    │   ├── events/events.js, listeners.js   (P10)
    │   ├── services/groq.js       (P13)
    │   ├── scripts/seed.js, benchmark-cache.js
    │   ├── tests/*.test.js
    │   └── package.json
    ├── docker-compose.yml         (P11)
    ├── .env.example               <- compose-level variables
    ├── README.md                  <- run instructions, routes, API list, badges, screenshots index
    └── docs/practical-06 … practical-13/   <- NOTES.md + evidence per practical
```

Why this layout: one monorepo satisfies P6's "two repos or one monorepo"; Docker (P11) and CI (P12) need predictable `client/` and `server/` build contexts; the workflow lives at git root and uses `working-directory: task-manager/server`.

## 3. Stack decisions (do not re-litigate)

| Area | Decision |
|---|---|
| Node | Use the installed Node major (check `node -v`; expected 20 or 22). The PDF says v18+. Docker and CI use **node 22** (Node 18 is end-of-life and current Vite needs Node 20+). Note this in `docs/practical-11/NOTES.md`. |
| Client | Vite + React 18/19, **react-router-dom v6** (`npm i react-router-dom@6`, the PDF says v6), plain CSS (no UI framework). |
| Server | Express, Mongoose, dotenv, cors, bcryptjs, jsonwebtoken, node-cache. CommonJS. |
| AI | **Groq API** (OpenAI-compatible HTTP), called with Node's built-in `fetch`. No OpenAI SDK. |
| Tests | jest + supertest, models mocked (no DB needed in CI). |
| Lint | ESLint on client (from Vite template) and server (add flat config). |
| Tasks ownership | Tasks are **global** (shared by logged-in users). Each task stores `createdBy` (User id) for the P10 notification. |
| Cache key | Exactly `all_tasks` (matches the PDF). Single-task key `task_<id>`. |

## 4. Environment variables

`task-manager/server/.env` (git-ignored; student creates it; `.env.example` is committed):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskdb      # or an Atlas URI
JWT_SECRET=change_me_long_random_string
JWT_EXPIRES_IN=1h
CLIENT_ORIGIN=http://localhost:5173
CACHE_ENABLED=true
CACHE_TTL=60
NOTIFICATION_DELAY_MS=0
GROQ_API_KEY=your_groq_key_here
GROQ_MODEL=llama-3.1-8b-instant
AI_TIMEOUT_MS=8000
```
`task-manager/client/.env` (optional): `VITE_API_URL=http://localhost:5000`

Rules: `.env.example` has placeholder values only. Code must read `process.env.*` with safe defaults for non-secrets; `JWT_SECRET` has **no** default (fail fast at startup if missing, except `NODE_ENV=test`).

## 5. API contract (use these exact paths — they come from the PDF)

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health` | no | `{ status: "ok" }` — used by Docker healthcheck and CI tests |
| POST | `/register` | no | P7. 201 on success |
| POST | `/login` | no | P7. returns `{ token, user }` |
| GET | `/me` | yes | P7 supplementary |
| GET | `/tasks` | yes (from P7) | cached (P9) |
| GET | `/tasks/:id` | yes | 404 JSON if missing; cached separately (P9) |
| POST | `/tasks` | yes | 201; validation; emits `task-created` (P10) |
| PUT | `/tasks/:id` | yes | 200; invalidates cache |
| DELETE | `/tasks/:id` | yes | 200; emits `task-deleted`; invalidates cache |
| POST | `/api/ai/generate-description` | yes | P13 |
| GET | `/debug/cache` | yes | P9 hit/miss counters |

**Standard error envelope** (every error, always JSON, never a stack trace):
```json
{ "error": "Human readable message", "details": ["optional", "field messages"] }
```
Status codes: 200, 201, 400 (validation / bad id / bad JSON), 401, 404, 415 (wrong Content-Type), 429 (AI rate limit), 500.

Task schema: `title` (String, required, trimmed), `description` (String), `completed` (Boolean, default false), `priority` (enum low|medium|high, default medium), `createdBy` (ObjectId ref User), `createdAt` (Date, default Date.now).
User schema: `email` (unique, lowercase, required), `password` (hashed), `createdAt`.

## 6. Server middleware order in `app.js` (matters — viva question)
```
cors → express.json → logger → [requireJson on POST/PUT] → routes (auth + validate per route)
     → notFound (JSON 404) → errorHandler (LAST)
```

## 7. Audit step (do this before Practical 6)
1. `git status`, `git branch --show-current`, `git log --oneline -n 15`.
2. Inspect `practical_1`, `practical_2`, `practical_3`, `practical-4`, `practical-5`, `practical-7`, `FrontEnd`: list files (skip node_modules), read `package.json`, `src`, `server.js`, models.
3. Decide, per piece, what to reuse:
   - Client: the most complete portfolio app (Header/About/Skills/Footer/NavBar, routes Home/Projects/Contact, state, API fetch with Spinner/ErrorMessage) → copy into `task-manager/client`.
   - Server: the Mongoose-based Express API from practical-5 → copy into `task-manager/server`, restructure per §2, and add the P4/P5 supplementary items (Content-Type check, ID validation, JSON 404, priority enum, trim hook, GET /tasks/:id).
   - If `practical-7` already contains auth code, you may borrow from it, but **rebuild it inside `task-manager`** following `07-authentication.md`; do not assume it is correct or complete.
4. Confirm root `.gitignore` ignores `node_modules`, `.env`, `dist`, `coverage`. Fix if not.
5. Write the audit summary and decisions into `STATUS.md` ("Audit" section).
6. If `task-manager/` already exists, continue from what is there rather than recreating.

## 8. Verifying your own work without the student
- MongoDB: if `MONGO_URI` is not available, start a local one: `docker run -d --name mongo-dev -p 27017:27017 mongo:7`. If Docker is unavailable, use `mongodb-memory-server` **only as a dev dependency for your own manual smoke test**, not in the committed code path. If neither works, run the jest suite (mocked) and mark the live-DB checks as "needs student verification" in `MANUAL_TASKS.md`.
- Always smoke-test with real HTTP calls (curl / a small node script), not just by reading code.
