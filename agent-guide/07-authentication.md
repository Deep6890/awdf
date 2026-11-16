# Practical 7 — Authentication and Middleware Pipeline

**Goal:** Register/login with bcrypt + JWT, protect all task routes, server-side validation, frontend login flow.

## Server
1. `npm i bcryptjs jsonwebtoken`.
2. `models/User.js`: `email` (required, unique, lowercase, trim), `password` (required), `createdAt`.
3. `controllers/authController.js`:
   - `register`: validate → check duplicate email (409 `Email already registered`) → `bcrypt.hash(password, 10)` → `User.create` → **201** `{ message, user:{id,email} }` (never return the hash).
   - `login`: find user → `bcrypt.compare` (never `===`) → `jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' })` → `{ token, user }`. Use the same generic message `Invalid email or password` for unknown email and wrong password (don't leak which).
   - `me`: returns `req.user` details (fetch from DB without password).
4. `middleware/auth.js`: read `Authorization: Bearer <token>`; missing/malformed → 401; `jwt.verify` **inside try/catch**; expired → 401 `Token expired`; invalid → 401 `Invalid token`; on success set `req.user = decoded` and `next()`.
5. `middleware/validate.js`: small reusable validator factory (no extra deps), e.g. `validate({ email:'email', password:{min:6} })`, `validate({ title:{required:true,max:100} })`. Return 400 with the standard envelope and `details` list. Apply to `/register`, `/login`, `POST /tasks`, `PUT /tasks/:id` (title, if present, must be a non-empty string; priority in enum).
6. Routes: `POST /register`, `POST /login`, `GET /me` (auth). Apply `auth` to **all** task routes (router-level `router.use(auth)`).
7. Task create stores `createdBy: req.user.id`.
8. Startup check: if `JWT_SECRET` missing (and `NODE_ENV !== 'test'`), log a clear error and exit.
9. Pipeline order for protected write route: `requireJson → auth → validate → controller` (matches the PDF diagram: auth then validation).

## Client
1. `context/AuthContext.jsx`: `user`, `token`, `login`, `register`, `logout`; persist token in `localStorage`; restore on load.
2. `api/api.js`: attach `Authorization: Bearer` when a token exists. On **401** from a protected request: clear token and redirect to `/login` (use a callback registered by AuthContext; do not `window.location` reload).
3. Pages `Login.jsx`, `Register.jsx` (controlled inputs, client-side checks, show server error messages), `components/ProtectedRoute.jsx` wrapping `/projects`. NavBar: show Login/Register when logged out; email + **Logout** when logged in.
4. Logout clears the token and navigates to `/login`.

## Verify (real HTTP)
- register → 201; duplicate → 409; missing email/short password → 400.
- login wrong password → 401; correct → token.
- `/tasks` without token → 401; with bad token → 401 (server must not crash); with expired token (sign one with `expiresIn:'1s'`, wait) → 401; valid → 200.
- `POST /tasks` with empty body title → 400 before touching the DB.
- Mongo `users` collection: password field starts with `$2`.
- UI: protected route redirect, login → add task, logout, token expiry redirect.
- `grep -r JWT_SECRET` shows no hardcoded secret.

## Key Questions → NOTES.md
Why hash (breach impact; bcrypt is slow + auto-salted, unlike SHA); what auth middleware verifies (signature, expiry; then trusts payload) and what happens when missing/expired (401, request stops); why validate on the server (frontend can be bypassed with curl/Postman).

## Before committing: capture the P8 baseline
Immediately after this practical works (and **before any P8 change**), do the baseline steps in `08-performance-lazy-loading.md` §1 and commit them as part of this commit or a tiny follow-up commit `docs(p8): record baseline bundle size`.

## Evidence (MANUAL_TASKS)
Postman screenshots: register, login, protected route with/without token, expired/invalid token.

## Commit
`feat(p7): add JWT authentication, bcrypt hashing and request validation`
