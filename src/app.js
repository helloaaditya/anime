import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { config } from 'dotenv';
import { swaggerUI } from '@hono/swagger-ui';

import hiAnimeRoutes from './routes/routes.js';

import { AppError } from './utils/errors.js';
import { fail } from './utils/response.js';
import { logger } from 'hono/logger';

const app = new Hono();

config();

const origins = process.env.ORIGIN ? process.env.ORIGIN.split(',') : '*';

// third party middlewares
app.use(
  '*',
  cors({
    origin: origins,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: '*',
  })
);

// Apply the rate limiting middleware to all requests (lazy loaded)
app.use('*', async (c, next) => {
  // Only apply rate limiting to API routes
  if (c.req.path.startsWith('/api/')) {
    const { rateLimiter } = await import('hono-rate-limiter');
    return rateLimiter({
      windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60000,
      limit: process.env.RATE_LIMIT_LIMIT || 100,
      standardHeaders: 'draft-6',
      keyGenerator: () => '<unique_key>',
    })(c, next);
  }
  return next();
});

// middlewares

// routes

app.use('/api/v1/*', logger());

app.get('/', (c) => {
  c.status(200);
  return c.text('welcome to anime API 🎉 start by hitting /api/v1 for documentation');
});
app.get('/ping', (c) => {
  return c.text('pong');
});

app.get('/health', async (c) => {
  const { default: performanceMonitor } = await import('./utils/performance.js');
  const { default: memoryCache } = await import('./services/cache.js');

  return c.json({
    status: 'healthy',
    uptime: performanceMonitor.getUptime(),
    cache: {
      size: memoryCache.size(),
    },
    timestamp: new Date().toISOString(),
  });
});
app.route('/api/v1', hiAnimeRoutes);

app.get('/doc', async (c) => {
  const { default: hianimeApiDocs } = await import('./utils/swaggerUi.js');
  return c.json(hianimeApiDocs);
});

// Use the middleware to serve Swagger UI at /ui
app.get('/ui', swaggerUI({ url: '/doc' }));
app.onError((err, c) => {
  if (err instanceof AppError) {
    return fail(c, err.message, err.statusCode, err.details);
  }
  console.error('unexpacted Error :' + err.message);

  return fail(c);
});

export default app;
