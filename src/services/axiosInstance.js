import axios from 'axios';
import config from '../config/config.js';

// Create a singleton axios instance with connection pooling
const axiosClient = axios.create({
  baseURL: config.baseurl,
  headers: config.headers,
  timeout: 30000,
  // Connection pooling optimizations
  maxRedirects: 5,
  maxContentLength: 50 * 1024 * 1024, // 50MB
});

export const axiosInstance = async (endpoint) => {
  try {
    const response = await axiosClient.get(endpoint);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};
