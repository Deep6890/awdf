# MANUAL TASKS (only the student can do these)

The agent keeps this file up to date. Tick items as you finish. Save screenshots into the `docs/practical-XX/` folder named in each line.

## One-time setup
- [ ] Copy `Practical_List.pdf` into `agent-guide/`.
- [ ] MongoDB available: local `mongod` / Docker (`docker run -d -p 27017:27017 mongo:7`) / Atlas URI.
- [ ] Create `task-manager/server/.env` from `.env.example` (real `MONGO_URI`, a long random `JWT_SECRET`).
- [ ] Create a free Groq API key at https://console.groq.com and put it in `server/.env` as `GROQ_API_KEY`.
- [ ] Docker Desktop installed and running (P11).
- [ ] GitHub repo exists with remote set; Actions enabled (P12).
- [ ] Never commit `.env`. Check `git status` before each push.

## Evidence per practical
- **P6**: create/edit/delete screenshots; error state with backend stopped; Compass/Atlas documents. → `docs/practical-06/`
- **P7**: Postman: register, login, protected route with token, without token (401), expired/invalid token. → `docs/practical-07/`
- **P8**: DevTools Network **before** (baseline) and **after** (Slow 3G showing the fallback loader); React Profiler re-render screenshot. → `docs/practical-08/`
- **P9**: Postman/Thunder "Time" for 3 uncached and 3 cached GET /tasks. → `docs/practical-09/`
- **P10**: console screenshot showing `[API] Response sent` before the listener's finish log (with `NOTIFICATION_DELAY_MS=2000`). → `docs/practical-10/`
- **P11**: `docker ps` with 3 containers; app in browser at `localhost:5173`; data persists after `down`/`up`. → `docs/practical-11/`
- **P12**: failed run screenshot, then passed run screenshot (procedure below). → `docs/practical-12/`
- **P13**: suggestion with disclaimer; loading state; fallback with invalid key; Network tab shows no direct Groq calls. → `docs/practical-13/`

## P12 push procedure (red → green)
The agent prepares 3 local commits (workflow, deliberately broken test, fix). Push them **one at a time**, waiting for each Actions run:
1. Push commit 1 → wait for **green**.
2. Push commit 2 (broken test) → wait for **red** → screenshot the failed run and read the log.
3. Push commit 3 (fix) → wait for **green** → screenshot.
(Pushing all three at once skips the demo.) Replace `<user>/<repo>` in the README badge.

## Lab file / viva
- [ ] Read each `docs/practical-XX/NOTES.md` (Key Question answers, errors, viva questions) until you can explain it in your own words. The rubric gives marks for explaining *why*.
- [ ] Add the screenshots and NOTES content to the lab file.
