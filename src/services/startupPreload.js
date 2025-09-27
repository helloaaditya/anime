import { axiosInstance } from './axiosInstance.js';
import redisService from './redis.js';
import memoryCache from './cache.js';

class StartupPreloadService {
  constructor() {
    this.isPreloaded = false;
    this.preloadPromise = null;
  }

  async preloadCriticalData() {
    if (this.isPreloaded) return;

    console.log('🚀 Starting critical data preload...');
    const startTime = Date.now();

    try {
      // Preload homepage data
      await this.preloadHomepageData();

      const duration = Date.now() - startTime;
      console.log(`✅ Critical data preloaded in ${duration}ms`);
      this.isPreloaded = true;
    } catch (error) {
      console.error('❌ Startup preload failed:', error.message);
      // Don't block server startup if preload fails
    }
  }

  async preloadHomepageData() {
    try {
      console.log('🔄 Preloading homepage data...');

      // Check if we already have cached data
      const redisData = await redisService.get('home');
      if (redisData) {
        console.log('📦 Found existing Redis cache, loading into memory...');
        const parsedData = JSON.parse(redisData);
        memoryCache.set('home', parsedData); // Lifetime cache (no TTL)
        return;
      }

      // Fetch fresh data
      const result = await axiosInstance('/home');
      if (!result.success) {
        throw new Error(result.message);
      }

      // Extract and cache data
      const { extractHomepage } = await import('../extractor/extractHomepageOptimized.js');
      const response = extractHomepage(result.data);

      // Cache in both Redis and memory
      await redisService.set('home', JSON.stringify(response), {
        ex: 60 * 60 * 24, // 24 hours
      });
      memoryCache.set('home', response); // Lifetime cache (no TTL)

      console.log('✅ Homepage data preloaded and cached');
    } catch (error) {
      console.error('❌ Homepage preload failed:', error.message);
      throw error;
    }
  }

  // Method to check if preload is complete
  isReady() {
    return this.isPreloaded;
  }

  // Method to get preload status
  getStatus() {
    return {
      isPreloaded: this.isPreloaded,
      memoryCacheSize: memoryCache.size(),
    };
  }
}

// Singleton instance
const startupPreloadService = new StartupPreloadService();

export default startupPreloadService;
