# Practical 10 — Asynchronous Processing with EventEmitter (Notes & Viva)

## 1. What Was Built
1. **Core Event Architecture:**
   - Implemented `events/events.js` exporting a singleton `TaskEvents` extending Node.js built-in `EventEmitter`.
   - Built `events/listeners.js` registering listeners for `task-created` and `task-deleted`.
   - Wired listener initialization into `server.js` at application bootstrap.
2. **Non-Blocking Asynchronous Processing:**
   - In `taskController.js`, organized the execution flow to respond to the client immediately (`res.status(201).json(newTask)`), and only then invoke `taskEvents.emit('task-created', newTask, req.user)`.
   - Used `setImmediate()` and `setTimeout` inside event listeners so heavy notification work is scheduled on subsequent event loop ticks, ensuring the HTTP response socket is never blocked.
3. **Supplementary & Resiliency Features:**
   - Implemented `task-deleted` event handling logging deletion metadata and triggering cleanup.
   - Wrapped listener bodies in try/catch blocks that emit a custom `handler-error` event.
   - Registered a dedicated `handler-error` listener and a default `'error'` listener on the emitter instance so errors never bubble up as unhandled exceptions or crash the Node.js process.
4. **Demonstration & Benchmarking:**
   - Added `"dev:slow-events": "cross-env NOTIFICATION_DELAY_MS=2000 node server.js"`.
   - Verified that with a 2000 ms simulated delay, the client response latency remains ultrafast (**6.23 ms**), with the notification handler completing asynchronously in the background ~2 seconds later.
   - Captured execution evidence in `docs/practical-10/console-log.txt`.

---

## 2. Key Questions (Assignment & PDF Requirements)

### Q1: Why does `emit()` not block the HTTP response in this implementation?
1. **Response Already Handled:** The controller calls `res.status(201).json(task)` *before* calling `taskEvents.emit(...)`. Express immediately formats the payload and flushes the HTTP headers and body to the TCP network socket.
2. **Work Deferral:** `emit()` itself is technically synchronous (it invokes registered listener callbacks immediately in registration order). However, inside our listeners, we wrap the heavy processing logic in `setImmediate()` or Promise timers (`setTimeout`). This yields control back to Node's libuv event loop immediately, ensuring the client's connection completes without waiting for notification delivery.

### Q2: What would happen if notification logic were executed synchronously inside the route before `res.json`?
If notification logic (e.g., sending an email, SMS, or pushing to a third-party webhook) sat directly in the request handler before `res.json()`:
- **Total Request Latency:** $\text{Response Time} = \text{Database Query Time} + \text{Notification Execution Time}$.
- If the notification service takes 2,000 ms or experiences network throttling, the user sits staring at a loading spinner for over 2 seconds just to create a simple task. If the third-party notification service times out or fails, the task creation itself might incorrectly fail from the user's perspective.

### Q3: Why is Node's built-in `EventEmitter` suitable for this lab, but NOT for millions of events per day in production?
| Dimension | Node.js `EventEmitter` (In-Process) | Production Message Queue (RabbitMQ, Redis Streams, BullMQ, Kafka) |
|---|---|---|
| **Storage & Persistence** | In-memory RAM only. If the server crashes or restarts, all queued events are **permanently lost**. | Durable disk storage and write-ahead logs guarantee zero message loss. |
| **Horizontal Scaling** | Isolated to a single process. Events cannot be consumed by other server instances or background worker pods. | Shared distributed broker; workers across dozens of machines can consume tasks in parallel. |
| **Retries & DLQ** | No built-in retry mechanisms, exponential backoff, or Dead Letter Queues (DLQ). | Configurable automatic retries, exponential backoff, and DLQ inspection for failed jobs. |
| **Backpressure** | If events are produced faster than listeners can process them, Node's memory heap grows unbounded until the process crashes with Out-Of-Memory (OOM). | Advanced rate limiting, concurrency throttles, and backpressure flow control. |

---

## 3. Reflection & Errors Encountered

1. **Anti-pattern Avoidance: Synchronous Busy-Waiting vs. Timers:**
   - *Problem:* In mock demos, developers sometimes write `const start = Date.now(); while (Date.now() - start < 2000) {}` to simulate a slow notification.
   - *Danger:* A synchronous `while` loop completely blocks Node's single thread! No other HTTP requests, DB queries, or timer callbacks can execute during those 2 seconds.
   - *Fix:* Used `await new Promise((resolve) => setTimeout(resolve, delayMs))` wrapped inside `setImmediate()`, ensuring the CPU remains available to handle concurrent incoming traffic.
2. **Resiliency with Event Emitter `'error'` Event:**
   - *Problem:* In Node.js, if an `EventEmitter` instance emits an event named `'error'` and no listener is registered for `'error'`, Node treats it as an uncaught exception and **abruptly terminates the entire server process**.
   - *Fix:* Explicitly registered `taskEvents.on('error', (err) => console.error(...))` and custom `taskEvents.on('handler-error', ...)` so failed notifications log cleanly without crashing the API.

---

## 4. 5 Likely Viva Questions & Concise Answers

### 1. Is `EventEmitter.prototype.emit()` asynchronous or synchronous by default?
`emit()` is **synchronous**. When you call `emitter.emit('event')`, Node synchronously executes all listener functions attached to that event one by one in the order they were registered. To make listener work asynchronous, the listener body must explicitly defer work (using `setImmediate`, `process.nextTick`, `setTimeout`, or `async/await`).

### 2. What is the difference between `setImmediate()` and `process.nextTick()`?
`process.nextTick()` runs immediately after the current operation finishes, before the event loop continues to any other phase (microtask queue). `setImmediate()` schedules callbacks to run in the "Check" phase of the event loop, after I/O events have been processed, allowing pending network I/O to be handled first.

### 3. What is the significance of the `events/listeners.js` import in `server.js`?
`events/listeners.js` registers the event handlers onto the shared `TaskEvents` singleton. It is imported in `server.js` (the application entry point) so listeners attach once at server boot. We do not import it in `app.js` to prevent duplicate event listener registrations during automated integration tests.

### 4. What is the purpose of passing `req.user` in the `task-created` payload?
Passing `req.user` supplies the authenticated author's metadata (`id` and `email`) to the background notification worker without requiring a secondary database lookup for the user.

### 5. What are the console logs produced during a task creation when `NOTIFICATION_DELAY_MS=2000`?
1. `[API] Response sent at <timestamp>` (HTTP response dispatched to client immediately)
2. `[Notification] Task "<title>" created at <timestamp> by <email>` (Listener execution starts)
3. `[Notification] Handler finished at <timestamp + 2s>` (Listener completes after non-blocking delay)
