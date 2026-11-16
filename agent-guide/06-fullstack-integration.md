# Practical 6 — Full Stack Integration (React + Node + MongoDB)

**Goal:** One working app: React UI ⇄ Express ⇄ MongoDB. Full CRUD from the UI, persisted, with loading/error handling on every call.
**Auth is NOT in this practical** (added in P7), so routes are open for now.

## Build steps
1. **Scaffold** `task-manager/client` and `task-manager/server` per `00-project-context.md` (reuse code found in the audit).
2. **Server baseline** (merges P4 + P5 including supplementary items):
   - `app.js`/`server.js` split, `config/db.js`, `Task` model with fields from the contract, `pre('save')` trim of title.
   - Routes: `GET /health`, `GET/POST /tasks`, `GET/PUT/DELETE /tasks/:id`.
   - Middleware: logger (method, URL, ISO timestamp), `requireJson` (POST/PUT must be `application/json`, else 415), `validateObjectId` (400 on bad id), `notFound` (JSON 404), `errorHandler` (last; maps Mongoose `ValidationError` → 400 with `details`, `CastError` → 400, everything else → 500 `{error:"Something went wrong"}`; log the stack server-side only).
   - Controllers wrap in try/catch and call `next(err)`.
   - `cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' })` placed before routes.
   - `findByIdAndUpdate(..., { new: true, runValidators: true })`.
3. **Client**:
   - `src/api/api.js`: single `BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'` and one `request()` helper that sets JSON headers, throws on `!res.ok` using the server's `error` message, returns parsed JSON. Exports `getTasks, createTask, updateTask, deleteTask`. Do **not** hardcode the URL anywhere else.
   - `hooks/useTasks.js`: state `tasks`, `loading` (initial fetch), `error`, plus per-action state (`saving`, `actionError`). Re-fetch **or** update local state from the server's response after each write (never assume success).
   - Components: `TaskForm` (title, description, priority), `TaskList`, `TaskItem` (toggle completed, edit, delete), `Spinner`, `ErrorMessage` (with **Retry** button), `ConfirmDialog` (before delete), `Toast` (success/failure for every create/update/delete).
   - `pages/Projects.jsx` now hosts the task manager (replaces the GitHub repo list from P3). Keep search/filter-by-name from P3 supplementary.
   - Keep portfolio pieces (Header/About/Skills/Footer/NavBar, Home, Contact, NotFound, dark/light toggle) working.
   - **Optimistic create:** insert a temporary task (`_tmp-<timestamp>` id, dimmed) immediately, replace with the server's task on success, **roll back and toast an error on failure**.
4. `GET /tasks` must be called on mount so a browser refresh shows persisted data.

## Verify
- `curl` each endpoint; check status codes 200/201/400/404/415.
- Kill the backend → UI shows `ErrorMessage` with Retry; start backend → Retry works.
- Create → edit → delete → refresh persists (against real Mongo).
- Bad payload (empty title) shows the server's validation message in the UI (toast/inline), not a crash.

## Key Questions → put answers in NOTES.md
- Why CORS is needed (different origins: 5173 vs 5000; browser enforces same-origin policy; server must send `Access-Control-Allow-Origin`).
- Why re-fetch/update from the server response (server is the source of truth; validation/defaults/ids/timestamps are set server-side; failures would otherwise leave UI lying).
- Risk of unhandled write errors (silent data loss, UI out of sync, duplicate submissions).

## Evidence (add to `MANUAL_TASKS.md`)
Screenshots: create/edit/delete working, error state with server stopped, MongoDB Compass/Atlas showing documents, CORS error demo (optional), `docs/practical-06/`.

## Commit
`feat(p6): connect React task UI to Express/MongoDB backend`
