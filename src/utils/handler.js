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

      return success(c, result, null);
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
