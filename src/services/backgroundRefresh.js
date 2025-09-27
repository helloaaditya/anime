import { axiosInstance } from './axiosInstance.js';
import redisService from './redis.js';
import memoryCache from './cache.js';

class BackgroundRefreshService {
  constructor() {
    this.isRunning = false;
    this.refreshInterval = 15 * 60 * 1000; // 15 minutes (more frequent)
    this.lastRefresh = new Map();
    this.refreshTimer = null;
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  async start() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('🔄 Background refresh service started');

    // Initial refresh
    await this.refreshHomepageData();

    // Set up interval with error handling
    this.scheduleNextRefresh();
  }

  scheduleNextRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    this.refreshTimer = setTimeout(async () => {
      try {
        await this.refreshHomepageData();
        this.retryCount = 0; // Reset retry count on success
      } catch (error) {
        console.error('❌ Background refresh failed:', error.message);
        this.retryCount++;

        if (this.retryCount < this.maxRetries) {
          console.log(`🔄 Retrying background refresh (${this.retryCount}/${this.maxRetries})`);
          // Retry with exponential backoff
          const retryDelay = Math.min(60000 * Math.pow(2, this.retryCount), 300000); // Max 5 minutes
          setTimeout(() => this.scheduleNextRefresh(), retryDelay);
          return;
        } else {
          console.error('❌ Max retries reached for background refresh');
          this.retryCount = 0;
        }
      }

      // Schedule next refresh
      this.scheduleNextRefresh();
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
      memoryCache.set('home', response); // Lifetime cache (no TTL)

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
