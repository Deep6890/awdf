// In-memory store for rate limiting: key -> timestamp (epoch ms)
const requestStore = new Map();
const WINDOW_MS = 60 * 1000; // 60 seconds

function aiRateLimit(req, res, next) {
  const userId = req.user?.id || 'anonymous';
  const rawTitle = req.body?.title || '';
  const normalizedTitle = rawTitle.toLowerCase().trim();

  const key = `${userId}:${normalizedTitle}`;
  const now = Date.now();
  const lastRequestTime = requestStore.get(key);

  if (lastRequestTime && now - lastRequestTime < WINDOW_MS) {
    const elapsedSeconds = Math.ceil((now - lastRequestTime) / 1000);
    const retryAfterSeconds = Math.max(1, 60 - elapsedSeconds);

    return res.status(429).json({
      error: 'Please wait before requesting another suggestion',
      retryAfterSeconds
    });
  }

  requestStore.set(key, now);

  // Periodic cleanup of expired entries
  if (requestStore.size > 1000) {
    for (const [k, time] of requestStore.entries()) {
      if (now - time > WINDOW_MS) {
        requestStore.delete(k);
      }
    }
  }

  next();
}

// Reset helper for test suites
aiRateLimit.reset = () => {
  requestStore.clear();
};

module.exports = aiRateLimit;
