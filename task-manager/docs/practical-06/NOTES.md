# Practical 6 — Full Stack Integration (React + Express + MongoDB)

## 1. What Was Built
- **Consolidated Monorepo (`task-manager/`):**
  - **Client (`task-manager/client/`):** Vite + React application configured with React Router v6.
    - Centralized API layer in `src/api/api.js` using `BASE_URL` with environment variable fallback (`VITE_API_URL` or `http://localhost:5000`), uniform headers, and centralized HTTP error throwing.
    - Custom React hook `useTasks` managing `tasks`, `loading`, `error`, `saving`, `actionError`, and toast notifications.
    - Optimistic task creation: inserts a temporary task (`_tmp-<timestamp>`) with dimmed styling immediately, calls the API, replaces it with the persisted server document on success, and automatically rolls back and displays an error toast if creation fails.
    - Component suite: `TaskForm` (title, description, priority), `TaskList`, `TaskItem` (with inline editing, priority badges, and completed toggling), `Spinner`, `ErrorMessage` (with Retry button), `ConfirmDialog` modal (for deletion confirmation), and `Toast` notifications.
    - Hosted in `pages/Projects.jsx` with real-time keyword search and filtering by priority ('low', 'medium', 'high') and completion status.
  - **Server (`task-manager/server/`):** Modular Express REST API connected to MongoDB via Mongoose.
    - `app.js` and `server.js` separation for modular testing without binding port listeners.
    - Schema validation in `models/Task.js` featuring `title` (required, trimmed), `description`, `completed`, `priority` enum (`['low', 'medium', 'high']`), and a `pre('save')` trim hook.
    - Standard REST endpoints: `GET /health`, `GET /tasks`, `GET /tasks/stats`, `GET /tasks/:id`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`.
    - Robust middleware pipeline: `cors`, `express.json()`, timestamped `logger`, `requireJson` (rejects non-JSON POST/PUT with 415), `validateObjectId` (validates MongoDB ObjectId, 400 on bad format), `notFound` (JSON 404), and centralized `errorHandler` (maps Mongoose `ValidationError` and `CastError` to 400 with details, safe 500 envelope).

---

## 2. Key Questions & Answers

### Q1: Why is CORS needed between the frontend and backend?
**Answer:**
Browsers enforce the **Same-Origin Policy (SOP)** as a security boundary to prevent malicious scripts on one origin from making unauthorized requests to another. Since the React frontend runs on `http://localhost:5173` and the Express backend runs on `http://localhost:5000`, they have different origins (different port numbers). By default, the browser blocks cross-origin requests. Enabling CORS (Cross-Origin Resource Sharing) on Express allows the server to send the `Access-Control-Allow-Origin: http://localhost:5173` response header, signaling to the browser that requests from this client origin are permitted.

### Q2: Why must the client re-fetch or update its state from the server response rather than just trusting the input?
**Answer:**
The server is the **single source of truth**. When a client submits data, the server performs business logic, schema sanitization, validation, default value assignment, ObjectId creation (`_id`), and timestamp generation (`createdAt`). If the frontend immediately assumed local state matched the server without confirmation, the UI would lack server-assigned fields (like `_id` needed for subsequent updates and deletes) and could present false information if the database write failed or was altered by backend hooks (such as string trimming).

### Q3: What is the risk of unhandled write errors in full-stack applications?
**Answer:**
If write errors (such as network drops, 400 validation rejections, or 500 server crashes) are unhandled:
1. **UI / Server Desynchronization:** The user sees their change in the UI, believing it was saved, but refreshing the page causes the data to disappear (silent data loss).
2. **Ghost Actions & Crashes:** Without server-returned IDs, future update or delete calls will attempt to modify nonexistent IDs.
3. **Repeated Submissions:** The user may click buttons repeatedly without feedback, potentially creating duplicate records.

---

## 3. Reflection: Errors Hit & Solutions Found

1. **Issue:** `POST /tasks` without `Content-Type: application/json` received 404 or raw HTML error in earlier iterations.
   - **Fix:** Added custom `requireJson` middleware placed ahead of mutating route handlers. It inspects `req.headers['content-type']` for `application/json` and returns standard 415 Unsupported Media Type if missing or mismatched.
2. **Issue:** Mongoose invalid ObjectId lookups causing server crashes or generic 500 errors.
   - **Fix:** Implemented `validateObjectId` middleware utilizing `mongoose.isValidObjectId(req.params.id)`. Any malformed ID immediately responds with a structured `400 Bad Request` (`{ error: 'Invalid ID format' }`) before invoking database operations.
3. **Issue:** Optimistic task creation left lingering temporary items when network errors occurred.
   - **Fix:** In `useTasks.js`, temporary tasks are flagged with `_tmp-` IDs and rendered dimmed. The async `addTask` function wraps the server call in a `try...catch...finally` block; on error, it cleanly filters out the temporary task from state and fires an error `Toast` with the backend's validation message.

---

## 4. Viva Voce Questions & Answers

### 1. What is the difference between `app.js` and `server.js`, and why separate them?
**Answer:** `app.js` configures the Express application, mounts middleware, and registers routes without calling `app.listen()`. `server.js` imports `app.js`, connects to the database, and starts the HTTP server. This separation allows `app.js` to be imported into test suites (like Jest or Supertest) to execute integration tests without binding to a physical network port.

### 2. How does the `pre('save')` Mongoose hook work?
**Answer:** It is a Mongoose document middleware that executes right before a document is persisted to MongoDB. In our Task model, it checks if `this.title` exists and strips leading and trailing whitespace using `.trim()`, ensuring dirty whitespace does not pollute the database.

### 3. What does "Optimistic UI" mean, and when should it be avoided?
**Answer:** Optimistic UI is a frontend pattern where the UI updates immediately under the assumption that the backend write will succeed, providing a fast, responsive experience. If the write fails, the UI rolls back the change and displays an error. It should be avoided for high-stakes or irreversible operations such as financial transactions, payments, or actions with high validation uncertainty.

### 4. What status code should be returned when a client tries to update a task that does not exist versus an invalid ID?
**Answer:** If the ID format is invalid (e.g. not a 24-character hex string for MongoDB ObjectId), return `400 Bad Request`. If the ID format is valid but no document matches it in the database, return `404 Not Found`.

### 5. Why do we put `errorHandler` as the very last middleware in Express?
**Answer:** Express identifies error-handling middleware by its 4-parameter signature: `(err, req, res, next)`. When any preceding route or middleware calls `next(err)`, Express skips all remaining standard middleware and jumps straight to the next registered 4-parameter error handler. Placing it last ensures it catches errors from all routes across the entire application.
