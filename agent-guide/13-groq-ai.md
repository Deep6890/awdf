# Practical 13 — AI API Integration (Groq)

**Goal:** "Generate description" button on the task form, powered by the **Groq API**, called only from the backend, with graceful failure.

## Groq facts
- OpenAI-compatible endpoint: `POST https://api.groq.com/openai/v1/chat/completions`
- Header: `Authorization: Bearer ${process.env.GROQ_API_KEY}`, `Content-Type: application/json`
- Body: `{ model, messages:[{role,content}], temperature, max_tokens }`; reply text at `choices[0].message.content`.
- Model from `process.env.GROQ_MODEL`, default `llama-3.1-8b-instant`. Models get renamed/retired: if you have web access, check https://console.groq.com/docs/models and update the default; otherwise keep it configurable and note it in `MANUAL_TASKS.md`.
- Student gets a free key at https://console.groq.com → put in `server/.env` as `GROQ_API_KEY`. Never commit it.
- No SDK: use Node's built-in `fetch` (Node 18+).

## Server
1. `services/groq.js`: `generateDescription(title)` using `fetch` with `AbortController` timeout (`AI_TIMEOUT_MS`, default 8000). System prompt: "You write concise task descriptions for a to-do app. Reply with 1–2 plain sentences, no markdown, no quotes, no preamble." User prompt includes **only the task title**. `max_tokens` ≈ 120, `temperature` ≈ 0.5. Trim the result; cap length (e.g. 300 chars).
2. `controllers/aiController.js` + `routes/aiRoutes.js`: `POST /api/ai/generate-description`, protected with `auth` and `validate({title: required, max 100})`.
3. **Graceful degradation:** any failure (missing key, 401/429/5xx from Groq, timeout, network, empty output) → respond **200** `{ description: "", fallback: true, message: "AI suggestion is unavailable right now. You can write the description yourself." }`. Log the real reason server-side without the key or full headers. The rest of the app is unaffected.
4. **Rate limit (supplementary):** `middleware/aiRateLimit.js` — max 1 AI request per user per task title per 60 s using an in-memory Map/NodeCache keyed `userId:normalizedTitle`. Exceeding → **429** `{ error: "Please wait before requesting another suggestion", retryAfterSeconds }`.
5. Mount the router in `app.js` before `notFound`.

## Client
1. `api.js`: `generateDescription(title)`.
2. In `TaskForm`: button **"Generate description"** (disabled when title is empty or while loading).
3. **Loading state:** button text "Generating…" + spinner.
4. Result goes into the description textarea as an **editable suggestion**, shown with a visible disclaimer: "AI-generated suggestion — please review before saving." The user can edit or clear it; saving remains a separate explicit action.
5. If `fallback: true` or an error/429: show the friendly message inline (not an alert, not raw JSON); task creation still works.
6. Never import, reference, or embed the key on the client. `grep -ri "groq" task-manager/client/src` should only match the word in UI text/comments if at all, never a key, and the client must call only your own backend.

## Tests
Add to the jest suite (mock `global.fetch`): success path returns description; rejected fetch / non-200 → `fallback:true` with HTTP 200; missing title → 400; no token → 401; second quick call → 429.

## Verify
- With a real key: generate works and text appears in the form.
- With `GROQ_API_KEY=invalid` → friendly fallback, app keeps working (demonstrate the PDF's "invalid key" test).
- Browser DevTools Network: only calls to `localhost:5000`, no `groq.com` request and no key visible.
- `git log -p -S"gsk_"` finds nothing (Groq keys start with `gsk_`).

## Key Questions → NOTES.md
Why backend-only (keys in browser code/network are public, can be stolen and abused; backend can also rate-limit/validate); graceful degradation (feature fails closed to manual input; third-party outages/quota shouldn't break core CRUD); privacy/governance (data leaves your system to a third party; never send passwords, tokens, emails, personal/confidential data; send minimum necessary — here only the title; users should be told it's AI-generated and reviewed by a human; follow provider terms and institutional policy).

## Evidence (MANUAL_TASKS)
Screenshots: button + generated suggestion with disclaimer, loading state, fallback message with invalid key, Network tab showing only own-backend calls.

## Commit
`feat(p13): add Groq-powered task description generator`

## Wrap-up after P13
Update `task-manager/README.md` (run locally, run with Docker, env vars, route table, CI badge, links to `docs/`), finalize `STATUS.md` and `MANUAL_TASKS.md`, run the full verification checklist one last time.
