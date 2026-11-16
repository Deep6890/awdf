const taskEvents = require('./events');

// Listener for 'task-created' event
taskEvents.on('task-created', async (task, user) => {
  setImmediate(async () => {
    try {
      const userEmail = user?.email || (user?.id ? `User(${user.id})` : 'Anonymous');
      console.log(
        `[Notification] Task "${task.title}" created at ${new Date().toISOString()} by ${userEmail}`
      );

      const delayMs = Number(process.env.NOTIFICATION_DELAY_MS) || 0;
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      console.log(`[Notification] Handler finished at ${new Date().toISOString()}`);
    } catch (err) {
      taskEvents.emit('handler-error', err, task?._id);
    }
  });
});

// Listener for 'task-deleted' event (P10 Supplementary)
taskEvents.on('task-deleted', async (task, user) => {
  setImmediate(async () => {
    try {
      const userEmail = user?.email || (user?.id ? `User(${user.id})` : 'Anonymous');
      console.log(
        `[Notification] Task "${task.title}" deleted at ${new Date().toISOString()} by ${userEmail}`
      );

      const delayMs = Number(process.env.NOTIFICATION_DELAY_MS) || 0;
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      console.log(`[Notification] Handler finished at ${new Date().toISOString()}`);
    } catch (err) {
      taskEvents.emit('handler-error', err, task?._id);
    }
  });
});

// Listener for custom handler errors (P10 Supplementary)
taskEvents.on('handler-error', (err, taskId) => {
  console.error(
    `[Notification Error] Error in handler for task ${taskId}:`,
    err.message || err
  );
});

// Reserved 'error' event listener to prevent uncaught process crashes
taskEvents.on('error', (err) => {
  console.error('[TaskEvents Error] Unhandled event error caught:', err.message || err);
});

module.exports = taskEvents;
