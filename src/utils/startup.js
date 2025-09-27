import performanceMonitor from './performance.js';

export const logStartupTime = () => {
  const startupTime = performanceMonitor.getUptime();
  console.log(`🚀 API started in ${startupTime}ms`);

  if (startupTime < 1000) {
    console.log('⚡ Excellent startup performance!');
  } else if (startupTime < 2000) {
    console.log('✅ Good startup performance');
  } else {
    console.log('⚠️  Startup could be optimized further');
  }
};

export const logOptimizations = () => {
  console.log(`
🎯 Performance Optimizations Applied:
  ✅ Lazy loading for controllers and routes
  ✅ Singleton Redis connection with connection pooling
  ✅ Optimized Axios instance with connection reuse
  ✅ Multi-layer caching (Memory + Redis)
  ✅ Background data refresh service
  ✅ Optimized HTML parsing with Cheerio
  ✅ HTTP caching headers (ETag, Cache-Control)
  ✅ Deferred middleware loading
  ✅ Performance monitoring and logging
  ✅ Compressed responses enabled
  ✅ Connection pooling for HTTP requests
  ✅ Preload endpoint for cache warming
`);
};
