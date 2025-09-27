class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
    this.maxSize = 100; // Limit cache size
  }

  set(key, value, ttl = null) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    // Set the value
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccess: Date.now(),
    });

    // Only set expiration timer if ttl is provided
    if (ttl && ttl > 0) {
      const timer = setTimeout(() => {
        this.delete(key);
      }, ttl);
      this.timers.set(key, timer);
    }

    // Cleanup if cache is too large
    if (this.cache.size > this.maxSize) {
      this.cleanup();
    }
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Update access statistics
    item.accessCount++;
    item.lastAccess = Date.now();

    return item.value;
  }

  cleanup() {
    // Remove least recently used items
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);

    // Remove oldest 20% of entries
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.delete(entries[i][0]);
    }
  }

  delete(key) {
    this.cache.delete(key);
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
  }

  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.cache.clear();
    this.timers.clear();
  }

  size() {
    return this.cache.size;
  }

  // Set data for lifetime (no expiration)
  setLifetime(key, value) {
    this.set(key, value); // No TTL means lifetime
  }
}

// Singleton instance
const memoryCache = new MemoryCache();

export default memoryCache;
