# Practical 12 — CI/CD Pipeline with GitHub Actions (Notes & Viva)

## 1. What Was Built
1. **Automated CI Workflow (`.github/workflows/ci.yml`):**
   - Configured GitHub Actions workflow triggering on `push` and `pull_request` to `main`.
   - Structured 3 independent, parallelizable jobs:
     - `lint`: Checks server and client codebase with zero warnings/errors.
     - `build-and-test`: Executes unit and integration tests via Jest + Supertest with mocked database models (no live database required in CI).
     - `client-build`: Compiles the React + Vite frontend bundle to ensure build health.
   - Pinned Node.js to version `22` matching the active LTS project toolchain.
2. **Comprehensive Test Suites (`server/tests/`):**
   - `tests/task.test.js`:
     - `GET /health` → 200 `{ status: "ok" }`.
     - `GET /tasks` without token → 401 Unauthorized (protected endpoint).
     - `GET /tasks` with valid JWT + mocked `Task.find` → 200 and mocked array.
     - `POST /tasks` with missing title → 400 Bad Request.
     - `GET /unknown-route` → 404 JSON error envelope.
   - `tests/auth.test.js`:
     - `POST /register` with missing email → 400.
     - `POST /login` with non-existent user → 401.
     - `GET /me` with valid token → 200 and user data.
     - `GET /debug/cache` with valid token → 200 and cache status.
3. **Database Independence:**
   - Mongoose models (`Task`, `User`) are mocked using `jest.mock()`, enabling instant unit test execution (< 2 seconds) in isolated CI runner containers without needing a MongoDB service container.

---

## 2. Key Questions (Assignment & PDF Requirements)

### Q1: What is the difference between Continuous Integration (CI) and Continuous Deployment (CD)?
- **Continuous Integration (CI):** The practice of automating the building, linting, and testing of code whenever team members push changes or submit pull requests. The goal is to detect syntax errors, broken tests, and integration conflicts immediately. *This practical implements CI.*
- **Continuous Deployment (CD):** The automated process of deploying code changes directly to staging or production environments (e.g., updating containers on Kubernetes, deploying to Render, or releasing to Vercel) immediately after passing all CI stages, without manual human intervention. Continuous Delivery is similar, but requires manual approval before deploying to production.

### Q2: Why is it best practice to test on every push?
1. **Small Diffs & Isolated Failures:** Testing small, frequent commits makes it trivial to identify exactly which line of code broke the build.
2. **Immediate Developer Feedback:** Developers receive test failure alerts within minutes of pushing, while the code context is still fresh in memory.
3. **Cheaper Bug Remediation:** Fixing a bug during active development costs a fraction of fixing a bug discovered in staging, QA, or production.
4. **Main Branch Stability:** Prevents broken code from merging into `main`, ensuring the team always has a releasable codebase.

### Q3: What happens if a test file path is wrong or tests are missing, and how does it differ from an assertion failure in CI logs?
- **Missing Tests / Incorrect Test Path:** Jest exits with code 1 and outputs:
  ```
  Pattern: tests/does-not-exist.test.js - 0 matches
  No tests found, exiting with code 1
  ```
  The CI job fails at the `npm test` step with an execution/configuration error rather than a test assertion failure.
- **Assertion Failure:** Jest discovers and runs the tests, but an expectation fails:
  ```
  FAIL tests/task.test.js
  Expected: 200
  Received: 500
  ```
  Reading the CI log immediately distinguishes between infrastructure/path misconfigurations (zero tests matched) and logic regressions (assertion failure).

---

## 3. Deliberate Fail → Fix Demonstration Procedure (Red → Green)

To demonstrate CI/CD failure detection and recovery:
1. **Step 1 (Green Baseline):**
   - Push current code with passing tests.
   - Observe GitHub Actions tab: `lint`, `build-and-test`, and `client-build` pass with green checkmarks.
2. **Step 2 (Red - Deliberately Broken Test):**
   - In `server/tests/task.test.js`, temporarily change:
     ```js
     expect(res.status).toBe(201); // expected 200
     ```
   - Run `npm test` locally or push commit: `test(p12): deliberately break test to demonstrate failing pipeline`.
   - Observe GitHub Actions tab: `build-and-test` job turns **RED** with exit code 1. Take a screenshot for lab file evidence.
3. **Step 3 (Green Recovery):**
   - Revert back to `expect(res.status).toBe(200);`.
   - Push commit: `fix(p12): correct the test so the pipeline passes`.
   - Observe GitHub Actions tab: Pipeline returns to **GREEN**. Take a screenshot.

---

## 4. 5 Likely Viva Questions & Concise Answers

### 1. What does the `needs: lint` directive in GitHub Actions do?
It creates a job dependency. The `build-and-test` job will not start until the `lint` job finishes successfully. If linting fails (e.g., syntax or code style errors), the pipeline cancels testing immediately to save compute minutes and provide faster feedback.

### 2. Why do we mock Mongoose models in our unit test suite?
Mocking models decouples the tests from external dependencies (no real MongoDB instance needed). This makes tests run in under 2 seconds, prevents database state leakage between test runs, and allows unit testing in lightweight CI virtual machines without spinning up database services.

### 3. How does `supertest` test an Express app without starting an HTTP server on a port?
`supertest` passes the Express `app` callback directly to Node's internal `http.createServer(app)`. It binds to an ephemeral local port or memory socket, dispatches HTTP requests, asserts on responses, and closes the socket immediately without needing manual port configuration.

### 4. What is the role of `cache: npm` in `actions/setup-node`?
It caches downloaded `node_modules` between CI runs based on the lockfile hash. Future CI runs skip downloading packages from the global registry, reducing pipeline run times from minutes to seconds.

### 5. Why is `defaults.run.working-directory` needed in our workflow file?
Because our repository is structured as a monorepo with `task-manager/server` and `task-manager/client`. Setting `working-directory` instructs GitHub Actions to execute commands (`npm install`, `npm test`) inside the specific subfolder where `package.json` resides.
