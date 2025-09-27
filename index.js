import initializeApp from './src/app.js';
import Bun from 'bun';
import { logStartupTime, logOptimizations } from './src/utils/startup.js';

// Initialize app with preloaded data
const startServer = async () => {
  console.log('🚀 Initializing HiAnime API...');

  // Wait for app initialization and preload to complete
  const app = await initializeApp();

  // Start server after preload is complete
  const server = Bun.serve({
    port: 3030,
    fetch: app.fetch,
    idleTimeout: 30,
    // Optimize for performance
    maxRequestBodySize: 50 * 1024 * 1024, // 50MB
    // Enable compression
    compression: true,
  });

  // Log startup performance
  logOptimizations();
  logStartupTime();

  console.log(`🎉 HiAnime API running on http://localhost:${server.port}`);
  console.log('⚡ All critical data preloaded - first request will be instant!');
};

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
