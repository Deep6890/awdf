const NodeCache = require('node-cache');

const defaultTTL = Number(process.env.CACHE_TTL) || 60;
const checkPeriod = 120;

// Initialize NodeCache instance
const cacheInstance = new NodeCache({
  stdTTL: defaultTTL,
  checkperiod: checkPeriod
});

// Hit / Miss stats counters
const stats = {
  hits: 0,
  misses: 0
};

/**
 * Determine if caching is currently enabled via env var
 */
const isEnabled = () => {
  return process.env.CACHE_ENABLED !== 'false';
};

const cache = {
  instance: cacheInstance,

  /**
   * Retrieve an item from cache and update hit/miss statistics
   */
  get(key) {
    if (!isEnabled()) {
      return undefined;
    }
    const val = cacheInstance.get(key);
    if (val !== undefined) {
      stats.hits += 1;
      return val;
    }
    stats.misses += 1;
    return undefined;
  },

  /**
   * Set an item in cache
   */
  set(key, val, ttl) {
    if (!isEnabled()) {
      return false;
    }
    return cacheInstance.set(key, val, ttl !== undefined ? ttl : defaultTTL);
  },

  /**
   * Delete one or more keys from cache
   */
  del(keys) {
    if (!isEnabled()) {
      return 0;
    }
    return cacheInstance.del(keys);
  },

  /**
   * Clear all cached keys
   */
  flush() {
    return cacheInstance.flushAll();
  },

  /**
   * Get all cached keys
   */
  keys() {
    return isEnabled() ? cacheInstance.keys() : [];
  },

  /**
   * Return debug stats including hits, misses, keys, ttl, enabled
   */
  getDebugStats() {
    return {
      hits: stats.hits,
      misses: stats.misses,
      keys: isEnabled() ? cacheInstance.keys() : [],
      ttl: defaultTTL,
      enabled: isEnabled()
    };
  },

  /**
   * Reset hit/miss counters (useful for test suites and benchmarks)
   */
  resetStats() {
    stats.hits = 0;
    stats.misses = 0;
  }
};

module.exports = cache;
