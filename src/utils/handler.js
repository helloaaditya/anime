import { fail, success } from './response';
import performanceMonitor from './performance.js';

const handler = (fn) => {
  return async (c, next) => {
    const startTime = Date.now();
    const route = c.req.path;

    try {
      const result = await fn(c, next);

      const duration = Date.now() - startTime;
      performanceMonitor.log(`${c.req.method} ${route}`, duration);

      // Set longer cache for homepage
      const cacheTime = route.includes('/home') ? 1800 : 300; // 30 min for home, 5 min for others

      return success(c, result, null, cacheTime);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`❌ Error in ${c.req.method} ${route} (${duration}ms):`, error.message);

      if (error.statusCode) {
        return fail(c, error.message, error.statusCode, error.details);
      }
      return fail(c, error.message, 500);
    }
  };
};
export default handler;
