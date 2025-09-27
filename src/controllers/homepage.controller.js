import { axiosInstance } from '../services/axiosInstance';
import { validationError } from '../utils/errors';
import { extractHomepage } from '../extractor/extractHomepage';
import redisService from '../services/redis';

const homepageController = async () => {
  // Check cache first
  const homePageData = await redisService.get('home');
  if (homePageData) {
    console.log('CACHE HIT');
    return JSON.parse(homePageData);
  }

  console.log('CACHE MISS');
  const result = await axiosInstance('/home');

  if (!result.success) {
    throw new validationError(result.message);
  }

  const response = extractHomepage(result.data);

  // Cache the response
  await redisService.set('home', JSON.stringify(response), {
    ex: 60 * 60 * 24, // 24 hours
  });

  return response;
};

export default homepageController;
