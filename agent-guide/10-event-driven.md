# Practical 10 — Asynchronous Processing with EventEmitter

**Goal:** On task creation, respond immediately, then handle a notification asynchronously via Node's built-in `EventEmitter`. No external queue libraries.

## Implementation
1. `events/events.js`: `class TaskEvents extends EventEmitter {}; module.exports = new TaskEvents();`
2. `events/listeners.js` (required **once** from `server.js` at startup, not from `app.js` tests unless needed):
   - `task-created` listener: logs `[Notification] Task "<title>" created at <ISO> by <assigned user email>` (assigned user = `createdBy`/`req.user.email` passed in the payload).
   - Work inside the listener runs via `setImmediate(...)` / async with `await new Promise(r => setTimeout(r, Number(process.env.NOTIFICATION_DELAY_MS)||0))` so a slow handler never blocks the event loop. A synchronous `while` busy-loop would block everything — do **not** use one for the demo delay; mention why in NOTES.
   - Log a completion line `[Notification] Handler finished at <ISO>` after the delay.
   - **Supplementary — `task-deleted`:** separate listener, different log message.
   - **Supplementary — error handling:** wrap handler bodies in try/catch and `taskEvents.emit('handler-error', err, taskId)`; register a `handler-error` listener that logs. Also register a reserved `'error'` listener so an unhandled `'error'` event can't crash the process (explain this in NOTES).
3. `POST /tasks` order (exactly this, per the PDF):
   ```js
   const task = await Task.create({ ...req.body, createdBy: req.user.id });
   cache.del('all_tasks');
   console.log(`[API] Response sent at ${new Date().toISOString()}`);
   res.status(201).json(task);
   taskEvents.emit('task-created', task, req.user);
   ```
   `DELETE` emits `task-deleted` after responding the same way.
4. Demo with `NOTIFICATION_DELAY_MS=2000` (cross-env script `npm run dev:slow-events`): API returns instantly, the listener's "finished" log appears ~2 s later.

## Verify
- Console order: `[API] Response sent` → `[Notification] ... created` → (delay) → `Handler finished`.
- Postman response time stays small even with the 2 s delay.
- Throwing inside the listener (temporary test) logs via `handler-error`, server keeps running.
- Capture a clean log excerpt to `docs/practical-10/console-log.txt`.

## Key Questions → NOTES.md
Why emit doesn't block the response (response was already handed to the event loop/socket before emit; listener work is deferred); what happens if notification logic sat inside the route before `res.json` (response time = DB time + notification time); why EventEmitter is fine here but not at millions/day (in-process, in-memory, no persistence/retries/backpressure, lost on crash, single instance → use a real queue like RabbitMQ/Redis/BullMQ). Also note: `emit()` itself is synchronous; "asynchronous" comes from deferring work.

## Evidence (MANUAL_TASKS)
Screenshot of the console with the timestamp ordering (required deliverable) + Postman showing fast response with 2 s delay enabled.

## Commit
`feat(p10): add EventEmitter-based task notifications`
