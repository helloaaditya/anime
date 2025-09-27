import app from './src/app.js';
import Bun from 'bun';
import { logStartupTime, logOptimizations } from './src/utils/startup.js';

// Optimize server configuration for faster startup
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
