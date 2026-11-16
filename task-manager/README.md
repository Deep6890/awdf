# Task Manager — Full-Stack Web Application

![CI](https://github.com/<user>/<repo>/actions/workflows/ci.yml/badge.svg)

A complete full-stack Task Management application built using React (Vite), Express.js, and MongoDB, developed across Practicals 6 to 13 of **Advanced Web Development Frameworks (ITUE301)**.

---

## Architecture & Monorepo Layout

```
task-manager/
├── client/                     # React frontend (Vite, React Router, custom CSS, Recharts)
│   ├── src/
│   │   ├── api/api.js          # Centralized API fetcher with automatic Bearer token injection
│   │   ├── context/AuthContext # Authentication context managing user session & tokens
│   │   ├── components/         # UI (TaskForm with Groq AI, TaskList, TaskItem, TaskStatsChart, etc.)
│   │   ├── hooks/useTasks.js   # Custom hook with optimistic task creation and rollback
│   │   ├── pages/              # Lazy-loaded pages (Home, Projects, Contact, Login, Register, NotFound)
│   │   ├── utils/              # lazyWithDelay (flicker prevention)
│   │   ├── App.jsx, main.jsx
│   │   └── Styles/             # Global CSS and themes (Dark / Light mode)
│   ├── Dockerfile, nginx.conf  # Production multi-stage Nginx container
│   └── vercel.json             # SPA rewrites for standalone client deploy
├── server/                     # Express REST API with Mongoose
│   ├── app.js                  # Express app setup and middleware pipeline (exported for tests)
│   ├── server.js               # Entrypoint (checks JWT_SECRET, connects DB, listens on port)
│   ├── config/db.js            # MongoDB connection (with retry logic and serverless caching)
│   ├── models/                 # Mongoose schemas: Task.js, User.js
│   ├── controllers/            # taskController.js, authController.js, aiController.js
│   ├── routes/                 # taskRoutes.js, authRoutes.js, aiRoutes.js
│   ├── middleware/             # logger, requireJson, auth, validate, validateObjectId, notFound, errorHandler, aiRateLimit
│   ├── cache/cache.js          # In-memory caching layer (node-cache) with hit/miss tracking
│   ├── events/                 # Event-driven processing (TaskEvents singleton & async listeners)
│   ├── services/groq.js        # Groq LLM integration (llama-3.1-8b-instant via native fetch)
│   ├── scripts/                # Database seed script, benchmark runner, event tester
│   ├── tests/                  # Jest + Supertest suites (task.test.js, auth.test.js, ai.test.js)
│   └── Dockerfile              # Node 22 Alpine backend container
├── api/
│   └── index.js                # Serverless function entrypoint when root directory is task-manager
├── docker-compose.yml         # Multi-container orchestration (Mongo, Backend, Frontend)
├── vercel.json                 # Vercel configuration for task-manager directory deployment
└── docs/                       # Comprehensive documentation, benchmarks, and viva prep
    ├── practical-06/NOTES.md   # Full-stack integration
    ├── practical-07/NOTES.md   # Authentication & pipeline
    ├── practical-08/NOTES.md   # Lazy loading & bundle metrics (before vs after)
    ├── practical-08/metrics.md # Detailed chunk size breakdown
    ├── practical-09/NOTES.md   # In-memory caching & query optimization
    ├── practical-09/benchmark.md # High-resolution response time benchmark report
    ├── practical-10/NOTES.md   # Asynchronous processing with EventEmitter
    ├── practical-10/console-log.txt # Output log evidence
    ├── practical-11/NOTES.md   # Containerization with Docker & Compose
    ├── practical-12/NOTES.md   # CI/CD pipeline with GitHub Actions
    └── practical-13/NOTES.md   # Groq AI description generator & graceful degradation
```

---

## API Endpoints (Practicals 6–13)

| Method | Endpoint | Auth | Description | Status Codes |
|---|---|---|---|---|
| `GET` | `/health` | No | Server health check (Docker & CI) | `200` |
| `POST` | `/register` | No | Register a new user (`email`, `password`) | `201`, `400`, `409` |
| `POST` | `/login` | No | Authenticate user & receive JWT token | `200`, `400`, `401` |
| `GET` | `/me` | Yes | Get authenticated user profile | `200`, `401` |
| `GET` | `/debug/cache` | Yes | Inspect in-memory cache hits, misses, keys | `200`, `401` |
| `GET` | `/tasks` | Yes | Retrieve tasks (cached under `all_tasks`) | `200`, `401` |
| `GET` | `/tasks/stats` | Yes | Retrieve task counts (total, completed, pending) | `200`, `401` |
| `GET` | `/tasks/:id` | Yes | Retrieve single task (cached under `task_<id>`) | `200`, `400`, `401`, `404` |
| `POST` | `/tasks` | Yes | Create task (emits `task-created`, clears cache) | `201`, `400`, `401`, `415` |
| `PUT` | `/tasks/:id` | Yes | Update task (clears `all_tasks` and `task_<id>`) | `200`, `400`, `401`, `404`, `415` |
| `DELETE` | `/tasks/:id` | Yes | Delete task (emits `task-deleted`, clears cache) | `200`, `400`, `401`, `404` |
| `POST` | `/api/ai/generate-description` | Yes | Generate task description with Groq LLM | `200`, `400`, `401`, `429` |

---

## Environment Variables

### Backend (`task-manager/server/.env`)
```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskdb
JWT_SECRET=super_secret_jwt_key_change_in_production_minimum_32_chars
JWT_EXPIRES_IN=1h
CLIENT_ORIGIN=http://localhost:5173
CACHE_ENABLED=true
CACHE_TTL=60
NOTIFICATION_DELAY_MS=0
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
AI_TIMEOUT_MS=8000
```

### Frontend (`task-manager/client/.env` - Optional)
```bash
VITE_API_URL=http://localhost:5000
```

---

## Running Locally

### 1. Direct Local Development (Port 5000 & 5173)

**Terminal 1 — Server:**
```bash
cd task-manager/server
npm run dev              # or npm run dev:nocache to disable caching
```

**Terminal 2 — Client:**
```bash
cd task-manager/client
npm run dev
```
Open [http://localhost:5173](http://localhost:5173). The client automatically connects to `http://localhost:5000`.

### 2. Multi-Container Execution with Docker Compose

Ensure Docker Desktop is running, then:
```bash
cd task-manager
docker compose up --build -d
```
All three services (MongoDB, Backend, Frontend) will initialize. Open [http://localhost:5173](http://localhost:5173).  
To shut down and preserve data: `docker compose down`.  
To wipe data: `docker compose down -v`.

---

## Testing & Quality Assurance

Run the automated test suites (14 tests covering CRUD, Auth, Caching, and Groq AI):
```bash
cd task-manager/server
npm test
```

Run server and client linting:
```bash
# Server
cd task-manager/server
npm run lint

# Client
cd task-manager/client
npm run lint
```

---

## Vercel Deployment

1. Import your repository into [vercel.com](https://vercel.com).
2. Set Root Directory to `task-manager` (or leave root `.`).
3. Add environment variables: `MONGO_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`, `GROQ_API_KEY`.
4. Deploy. The included `vercel.json` and serverless API handlers route traffic seamlessly.
