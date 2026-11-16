# Agent Guide — Practicals 6 to 13 (Task Manager, full stack)

You are an AI coding agent finishing a student's lab work. This folder is your standing instruction set.
The student should not need to re-prompt you. Read, plan, build, verify, commit, update STATUS, move on.

## Files in this folder

| File | Purpose |
|---|---|
| `00-project-context.md` | Final folder structure, stack, env vars, API contract, conventions. **Read fully.** |
| `01-git-and-workflow.md` | Commit-per-practical rules, verification checklist, definition of done |
| `06-fullstack-integration.md` | Practical 6 |
| `07-authentication.md` | Practical 7 |
| `08-performance-lazy-loading.md` | Practical 8 |
| `09-caching.md` | Practical 9 |
| `10-event-driven.md` | Practical 10 |
| `11-docker.md` | Practical 11 |
| `12-cicd.md` | Practical 12 |
| `13-groq-ai.md` | Practical 13 (uses the **Groq** API) |
| `MANUAL_TASKS.md` | Things only the human can do (screenshots, API keys, pushing to GitHub). Keep it updated. |
| `STATUS.md` | Progress tracker. **Update after every practical.** |
| `Practical_List.pdf` | Original assignment PDF (student copies it here). Ground truth if a guide file seems to conflict. |

## Operating rules

1. **Order is fixed:** 6 → 7 → 8 → 9 → 10 → 11 → 12 → 13. Each later practical builds on the previous one.
2. **Start with the audit** described in `00-project-context.md` §7. Write findings to `STATUS.md`.
3. **One practical at a time.** Finish it completely (code + docs + verification + commit) before starting the next.
4. **Each practical ends with its own commit** (see `01-git-and-workflow.md`). Never push. Never force anything.
5. **Do not ask the student questions** unless you hit a blocker listed in `01-git-and-workflow.md` §5. Make the sensible decision, note it in `docs/practical-XX/NOTES.md`, continue.
6. **Never read, print, or commit secrets.** `.env` files are git-ignored. Only `.env.example` is committed.
7. **Do not touch** `practical_1`, `practical_2`, `practical_3`, `practical-4`, `practical-5`, `practical-7`, `FrontEnd`. Copy from them; never edit them.
8. **Follow the PDF's endpoint names and file names exactly** where the guide specifies them (graders compare against the PDF).
9. **Include every "Supplementary Problem" and "Student Assignment" task.** They are cheap and are listed in each file.
10. **Every practical produces `docs/practical-XX/NOTES.md`** containing: what was built, answers to the PDF's Key Questions (concise, accurate, plain language), errors hit and how they were fixed (Reflection mark), and 5 likely viva questions with short answers. The student has to be able to explain this work, so write it to be learned from.
11. Windows is the student's OS. Use npm scripts, `cross-env` for env vars, no bash-only syntax in `package.json` scripts.
12. Keep code simple and readable: CommonJS on the server (matches the PDF's `require`), ES modules + functional components + hooks on the client. Comment the "why", not the "what".
