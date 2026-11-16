# 01 — Git and Workflow

## 1. Commit strategy (answers "we can't commit incomplete projects")
Because you build practical by practical, **each practical is committed when it is complete and working.**
That gives the repo one clean, working commit per practical (the rubric requires "at least one commit specifically for X").
Do **not** squash everything into one commit and do **not** commit half-working states.

Commit message format:
```
feat(p6): connect React task UI to Express/MongoDB backend
feat(p7): add JWT authentication, bcrypt hashing and request validation
perf(p8): add route-level lazy loading with Suspense and record before/after bundle sizes
perf(p9): add node-cache for GET /tasks with invalidation and benchmarks
feat(p10): add EventEmitter-based task notifications
build(p11): add Dockerfiles and docker-compose for the full stack
ci(p12): add GitHub Actions workflow with jest tests
feat(p13): add Groq-powered task description generator
```
Optionally split a practical into 2–3 commits (e.g. code, then docs) if natural. Minimum: one per practical.

First commit of the whole effort (before P6): `chore: scaffold task-manager monorepo structure` containing only the new folder skeleton, `.gitignore` fixes, and `agent-guide/` + `AGENTS.md`/`CLAUDE.md` if not yet committed.

## 2. Hard rules
- Never `git push`, `git push --force`, `git reset --hard`, `git rebase`, `git commit --amend` on existing commits, or delete branches.
- Never `git add -A` blindly. Check `git status` first; confirm no `.env`, `node_modules`, `dist`, `coverage`, API keys, or `.log` files are staged. Run `git diff --cached --name-only` before each commit.
- Do not rewrite or backdate history.
- Stay on the current branch (check its name; CI trigger in P12 must match it: `main` or `master`).

## 3. Verification checklist (run before each practical's commit)
```
cd task-manager/server && npm run lint && npm test          # from P12 onward tests exist; earlier: lint + smoke
cd task-manager/client && npm run lint && npm run build
```
Plus the practical-specific checks in each file. Fix failures; do not commit red.
Then:
- [ ] `docs/practical-XX/NOTES.md` written (see README rule 10)
- [ ] `task-manager/README.md` updated (routes/features/how to run)
- [ ] `MANUAL_TASKS.md` updated with the student-only evidence for this practical
- [ ] `STATUS.md` updated
- [ ] `git diff --cached --name-only` is clean of secrets

## 4. Definition of done (per practical)
Code works end to end • every Problem Statement bullet satisfied • every Supplementary Problem and Student Assignment task done • NOTES.md complete • README updated • committed.

## 5. Only stop and ask the student if
- `.env` values are required to proceed and cannot be mocked (e.g. real `GROQ_API_KEY` for a live AI call). Finish everything else, test with mocks, record it in `MANUAL_TASKS.md`, and continue.
- You find existing, unexplained changes in the working tree that are not yours.
- A command would be destructive or leave the repo folder.

Everything else: decide, document in NOTES.md, move on.
