import { Redis } from '@upstash/redis';

class RedisService {
  constructor() {
    this.redis = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) {
      return this.redis;
    }

    const isRedisEnv = Boolean(
      process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    );

    if (isRedisEnv) {
      this.redis = Redis.fromEnv();
      this.isInitialized = true;
    }

    return this.redis;
  }

  async get(key) {
    const redis = await this.initialize();
    if (!redis) return null;
    return await redis.get(key);
  }

  async set(key, value, options = {}) {
    const redis = await this.initialize();
    if (!redis) return false;
    return await redis.set(key, value, options);
  }

  async del(key) {
    const redis = await this.initialize();
    if (!redis) return false;
    return await redis.del(key);
  }
}

// Singleton instance
const redisService = new RedisService();

export default redisService;
