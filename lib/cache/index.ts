// Export all cache functions and utilities
export {
  createRedisClient,
  getRedisClient,
} from './redis-client';

export {
  CACHE_TTL,
  DOMAIN_CACHE_CONFIG,
  generateAnalyticsCacheKey,
  getAnalyticsCache,
  setAnalyticsCache,
} from './analytics-cache';