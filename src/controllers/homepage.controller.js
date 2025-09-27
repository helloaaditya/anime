import { axiosInstance } from '../services/axiosInstance';
import { validationError } from '../utils/errors';
import redisService from '../services/redis';
import memoryCache from '../services/cache';

const homepageController = async () => {
  // Check memory cache first (fastest)
  const memoryCached = memoryCache.get('home');
  if (memoryCached) {
    console.log('MEMORY CACHE HIT');
    return memoryCached;
  }

  // Check Redis cache
  const homePageData = await redisService.get('home');
  if (homePageData) {
    console.log('REDIS CACHE HIT');
    const parsedData = JSON.parse(homePageData);
    // Store in memory cache for lifetime (no TTL)
    memoryCache.set('home', parsedData);
    return parsedData;
  }

  console.log('CACHE MISS - Fetching fresh data');
  const result = await axiosInstance('/home');

  if (!result.success) {
    throw new validationError(result.message);
  }

  // Lazy load optimized extractor only when needed
  const { extractHomepage } = await import('../extractor/extractHomepageOptimized');
  const response = extractHomepage(result.data);

  // Cache in both Redis and memory
  await redisService.set('home', JSON.stringify(response), {
    ex: 60 * 60 * 24, // 24 hours
  });
  memoryCache.set('home', response); // Lifetime cache (no TTL)

  return response;
};

export default homepageController;
