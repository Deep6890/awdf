# Practical 7 — Authentication & Middleware Pipeline

## 1. What Was Built
- **User Authentication & Data Model:**
  - `models/User.js`: Schema with `email` (unique, lowercase, trimmed, required) and `password` (hashed).
  - `controllers/authController.js`:
    - `register`: Validates inputs, checks for duplicate emails (returning `409 Conflict`), hashes passwords with `bcryptjs` (salt rounds 10), persists the user, and returns `201 Created` with sanitized `{ message, user: { id, email } }` (never leaking the password hash).
    - `login`: Normalizes email, verifies credentials using constant-time `bcrypt.compare`, signs a JSON Web Token with `JWT_SECRET` and expiration (`1h`), and returns `{ token, user }`. Emits a generic `401 Invalid email or password` for both missing users and wrong passwords to prevent user enumeration.
    - `me`: Protected endpoint returning user information (`{ id, email, createdAt }`) without the password hash.
- **Middleware Pipeline:**
  - `middleware/auth.js`: Verifies `Authorization: Bearer <token>`, handles `TokenExpiredError` (`401 Token expired`), handles malformed/tampered tokens (`401 Invalid token`), and attaches `req.user = decoded` to the request pipeline.
  - `middleware/validate.js`: Reusable validation factory without third-party dependencies supporting required fields, email regex, string length bounds (`min`/`max`), and allowed `enum` lists, returning standard `{ error: 'Validation Error', details: [...] }`.
  - Applied router-level `router.use(auth)` to all `/tasks` endpoints. Write operations enforce pipeline sequence: `requireJson → auth → validate → controller`.
  - Startup check in `server.js`: Fails fast if `JWT_SECRET` is missing in non-test environments.
- **Frontend Authentication Flow:**
  - `context/AuthContext.jsx`: Centralizes authentication state (`user`, `token`, `login`, `register`, `logout`), persists tokens in `localStorage`, and registers an unauthorized callback with `api.js` to automatically log out on 401s without page reloads.
  - `components/ProtectedRoute.jsx`: Shields the Task Manager (`/projects`), redirecting unauthenticated users to `/login`.
  - `pages/Login.jsx` & `pages/Register.jsx`: Interactive, controlled form pages with client-side validation and server error display.
  - `components/NavBar.jsx`: Dynamic navigation showing Login/Register buttons when unauthenticated and email badge + Logout button when authenticated.

---

## 2. Key Questions & Answers

### Q1: Why must passwords be hashed using bcrypt rather than simple cryptographic hashes like SHA-256?
**Answer:**
Fast cryptographic hash functions like SHA-256 or MD5 are designed for high-speed file checksums and message integrity, which makes them vulnerable to brute-force and hardware-accelerated GPU/ASIC attacks (billions of hashes per second) and pre-computed rainbow table lookups.
In contrast, **bcrypt** is an adaptive, slow hash function with two critical security advantages:
1. **Automatic Salt Generation:** Every hash includes a randomly generated 128-bit salt, ensuring two users with the exact same password produce completely different hashes, neutralizing rainbow tables.
2. **Configurable Work Factor (Cost):** The number of rounds (e.g. 10 rounds = $2^{10} = 1024$ iterations) deliberately increases the computational time per attempt, making brute-force dictionary attacks practically infeasible while maintaining negligible overhead for legitimate single logins.

### Q2: What does the `auth` middleware verify, and what occurs when the token is missing or expired?
**Answer:**
The `auth` middleware verifies:
1. **Presence & Format:** Reads the `Authorization` HTTP header and verifies the `Bearer <token>` format.
2. **Cryptographic Signature:** Uses `jwt.verify(token, JWT_SECRET)` to verify that the token was signed with the server's private secret and has not been tampered with by the client or any intermediary.
3. **Expiration Timestamp:** Compares the payload's `exp` timestamp against current server time (`Date.now()`).
Once verified, the payload (`{ id, email }`) is attached to `req.user`. If the token is missing, malformed, or invalid, the middleware immediately halts execution and returns `401 Unauthorized` (`{ error: 'Authorization token required' }` or `{ error: 'Invalid token' }`). If expired, it returns `401 Unauthorized` (`{ error: 'Token expired' }`). The request stops immediately and never touches route handlers or the database.

### Q3: Why is server-side validation mandatory even when comprehensive client-side form validation is present?
**Answer:**
Client-side validation is strictly for **user experience (UX)**—providing instant visual feedback to users before submitting forms. However, client-side validation provides **zero security**. Any client can bypass the browser completely by making raw HTTP requests directly to the API via tools like Postman, curl, Python scripts, or by modifying JavaScript in browser developer tools. Only server-side validation can guarantee data integrity, prevent malformed payloads, enforce authorization, and protect the database against corrupted or malicious inputs.

---

## 3. Reflection: Errors Hit & Solutions Found

1. **Issue:** Case sensitivity discrepancy in header parsing during integration testing.
   - **Fix:** In `middleware/auth.js`, inspected both `req.headers.authorization` and `req.headers.Authorization` to ensure robust handling across both Node standard HTTP parser and mock testing environments.
2. **Issue:** Potential user enumeration vulnerability in the login endpoint.
   - **Fix:** Refactored `authController.login` to return the identical generic error message (`Invalid email or password`) with HTTP 401 regardless of whether the email was not found or the password comparison failed.
3. **Issue:** JWT expiration boundary condition where tokens checked within the exact same second as expiration (`now == exp`) were not flagged.
   - **Fix:** Aligned the verification comparison to `now >= payload.exp` per the JWT specification standard, ensuring instantaneous expiration enforcement.

---

## 4. Viva Voce Questions & Answers

### 1. What are the three parts of a JWT, and what does each part contain?
**Answer:**
A JWT consists of three Base64URL-encoded parts separated by dots (`.`):
1. **Header:** Contains token metadata, typically the algorithm used (e.g., `{"alg": "HS256", "typ": "JWT"}`).
2. **Payload:** Contains user claims and statements (e.g., `{ id, email, iat, exp }`).
3. **Signature:** The cryptographic signature computed by hashing the header and payload with the secret key (`HMAC-SHA256(header + '.' + payload, secret)`).

### 2. Can the client read the data inside a JWT without the secret key?
**Answer:**
**Yes.** The payload and header are only Base64URL-encoded, not encrypted. Anyone with access to the token can decode and read the claims. The secret key is only required to **verify** the authenticity and integrity of the signature. Therefore, sensitive information such as passwords, API keys, or credit card numbers must never be placed inside a JWT payload.

### 3. Why do we return HTTP status code 409 on duplicate user registration?
**Answer:**
HTTP status code `409 Conflict` indicates that the request could not be completed due to a conflict with the current state of the resource—specifically, the uniqueness constraint on the email address in the user collection.

### 4. What is the difference between Authentication (401) and Authorization (403)?
**Answer:**
- **Authentication (401 Unauthorized):** Verifies **who you are** (identity). Returned when credentials/tokens are missing, invalid, or expired.
- **Authorization (403 Forbidden):** Verifies **what you are allowed to do** (permissions). Returned when the server knows who you are, but you do not have permission to access that specific resource.

### 5. Why should the server fail fast if `JWT_SECRET` is missing at startup?
**Answer:**
Without a secret key, the application cannot securely sign or verify authentication tokens. If the server were allowed to start with a default or empty secret, attackers could forge administrative tokens or all tokens would become insecure. Failing fast at startup prevents the system from running in a compromised security state.
