# Practical 12 — CI/CD Pipeline with GitHub Actions

**Goal:** On every push to the main branch: install, lint, test, report pass/fail. Demonstrate a red run then a green run.
This practical demonstrates **Continuous Integration** (CD is not implemented — say so in NOTES).

## Server refactor for testability (if not already done)
`app.js` exports the app without `listen`; `server.js` connects and listens. Tests import `app` only.

## Tests (`server/tests/`)
`npm i -D jest supertest` and `"scripts": { "test": "jest" }`, `jest.config.js` with `testEnvironment: 'node'`. In tests set `process.env.NODE_ENV='test'`, `JWT_SECRET='test-secret'`. **No real DB:** `jest.mock('../models/Task')` (and `User` where needed). Tests must be able to genuinely fail (no `expect(true)`).
Minimum set:
1. `GET /health` → 200 `{status:'ok'}`.
2. `GET /tasks` without token → 401 (the PDF's example expects 200, but routes are protected since P7 — note this deviation in NOTES).
3. `GET /tasks` with a valid JWT signed in the test and mocked `Task.find` → 200 and array body. (Clear the cache between tests: `cache.flushAll()`.)
4. `POST /tasks` with valid token and missing title → 400.
5. Unknown route → 404 JSON `{error}`.
6. (From P13) `POST /api/ai/generate-description` with `global.fetch` mocked to reject → 200 with `fallback: true`.
Add a second test file covering a different endpoint (assignment requirement).

## Lint (supplementary: second job)
Add ESLint to `server` (flat config, `eslint:recommended`, node globals, jest env for tests) with `"lint": "eslint ."`. The client already has lint from the Vite template.

## Workflow file — at **git root**: `.github/workflows/ci.yml`
Check the branch name first (`git branch --show-current`); use it in `branches:` (the PDF assumes `main`).
```yaml
name: CI Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: task-manager/server
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: task-manager/server/package-lock.json
      - run: npm install
      - run: npm run lint

  build-and-test:
    needs: lint
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: task-manager/server
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: task-manager/server/package-lock.json
      - run: npm install
      - run: npm test

  client-build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: task-manager/client
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm install
      - run: npm run build
```
Optional extra job: `docker-build` running `docker compose build` from `task-manager` to prove the images build (no push, no registry, no secrets). Only add if the compose build doesn't need `.env` at build time.
Package lock files must be committed (`package-lock.json`). YAML: 2-space indent, no tabs.
README badge (supplementary): `![CI](https://github.com/<user>/<repo>/actions/workflows/ci.yml/badge.svg)` — leave `<user>/<repo>` as a clearly marked placeholder and add to MANUAL_TASKS to fill in.

## The deliberate fail → fix demonstration (prepare locally, student pushes)
Create three **local** commits in this order, never push:
1. `ci(p12): add GitHub Actions workflow with jest tests` (workflow + tests, all green locally).
2. `test(p12): deliberately break test to demonstrate failing pipeline` (change one expected value, e.g. health 200 → 201). Confirm `npm test` fails locally.
3. `fix(p12): correct the test so the pipeline passes`.
Write the exact push procedure in `MANUAL_TASKS.md`: push commit 1 → wait for green → push commit 2 → wait for red → screenshot → push commit 3 → wait for green → screenshot (each commit pushed **separately**, by checking out/pushing `git push origin <sha>:refs/heads/main` one at a time, or by pushing in sequence and waiting). The final HEAD must be the passing one.

## Key Questions → NOTES.md
CI vs CD (CI = merge/test automatically; CD = automatically release/deploy; this practical shows CI only); why test on every push (small diffs, immediate feedback, cheaper fixes); wrong test path → Jest reports "no tests found" (non-zero exit) so the job also fails, but at the `npm test` step with a different message than an assertion failure — read the log to tell them apart.

## Optional real deployment (NOT required, mention in NOTES only)
Free hosting options (Render/Railway for the API, MongoDB Atlas, Vercel/Netlify for the client) are possible later; the PDF only requires CI. Do not add deployment secrets or workflows.

## Evidence (MANUAL_TASKS)
Screenshots of the failed and the passed Actions run (README or `docs/practical-12/`).

## Commit
Three commits as above.
