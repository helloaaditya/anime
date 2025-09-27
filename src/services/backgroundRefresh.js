import { axiosInstance } from './axiosInstance.js';
import redisService from './redis.js';
import memoryCache from './cache.js';

class BackgroundRefreshService {
  constructor() {
    this.isRunning = false;
    this.refreshInterval = 30 * 60 * 1000; // 30 minutes
    this.lastRefresh = new Map();
  }

  async start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('🔄 Background refresh service started');

    // Initial refresh
    await this.refreshHomepageData();

    // Set up interval
    setInterval(async () => {
      await this.refreshHomepageData();
    }, this.refreshInterval);
  }

  async refreshHomepageData() {
    try {
      console.log('🔄 Background refreshing homepage data...');
      const startTime = Date.now();

      const result = await axiosInstance('/home');
      if (!result.success) {
        console.error('❌ Failed to fetch homepage data:', result.message);
        return;
      }

      // Lazy load extractor
      const { extractHomepage } = await import('../extractor/extractHomepage.js');
      const response = extractHomepage(result.data);

      // Update caches
      await redisService.set('home', JSON.stringify(response), {
        ex: 60 * 60 * 24, // 24 hours
      });
      memoryCache.set('home', response, 300000); // 5 minutes

      const duration = Date.now() - startTime;
      this.lastRefresh.set('home', Date.now());

      console.log(`✅ Homepage data refreshed in ${duration}ms`);
    } catch (error) {
      console.error('❌ Background refresh error:', error.message);
    }
  }

  getLastRefresh(key) {
    return this.lastRefresh.get(key);
  }

  stop() {
    this.isRunning = false;
    console.log('⏹️ Background refresh service stopped');
  }
}

// Singleton instance
const backgroundRefreshService = new BackgroundRefreshService();

export default backgroundRefreshService;
