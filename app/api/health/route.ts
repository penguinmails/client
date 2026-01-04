import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/cache';
import { developmentLogger, productionLogger } from '@/lib/logger';

// Cache key for health status
const HEALTH_CACHE_KEY = 'system:health:status';
const HEALTH_CACHE_TTL = {
  healthy: 300, // 5 minutes
  unhealthy: 30, // 30 seconds
};

export async function GET() {
  try {
    // Try to get cached health status first
    const redisClient = getRedisClient();
    if (redisClient) {
      try {
        const cachedHealth = await redisClient.get(HEALTH_CACHE_KEY);
        if (cachedHealth) {
          const healthData = JSON.parse(cachedHealth);
          developmentLogger.debug('[Health] Returning cached health status:', healthData.status);
          
          // Use the cached health status to determine HTTP status code
          const httpStatus = healthData.status === 'healthy' ? 200 : 503;
          
          return NextResponse.json(healthData, {
            status: httpStatus,
            headers: {
              'X-Cache': 'HIT',
              'X-Cache-TTL': HEALTH_CACHE_TTL[healthData.status as keyof typeof HEALTH_CACHE_TTL]?.toString() || '30'
            }
          });
        }
      } catch (cacheError) {
        developmentLogger.warn('[Health] Cache read failed, proceeding with fresh check:', cacheError);
      }
    }

    // Check Redis cache availability
    const cacheAvailable = redisClient !== null;

    let cacheStats = null;
    if (cacheAvailable && redisClient) {
      try {
        const totalKeys = await redisClient.dbsize();
        cacheStats = { totalKeys, available: true };
      } catch (error) {
        developmentLogger.warn('Redis stats check failed:', error);
        cacheStats = { totalKeys: 0, available: false };
      }
    }

    // Check NileDB API (if available) - temporarily disabled
    const nileApiHealth = true; // Mark as healthy for now since API might not be ready
    // TODO: Re-enable when NileDB API is properly configured

    // Calculate health status based on essential services only
    const criticalServices = {
      cache: cacheAvailable,    // Redis cache
      api: nileApiHealth        // NileDB API
    };
    
    // System is healthy if all critical services are up
    // System is unhealthy if any critical service is down
    const overallStatus: 'healthy' | 'unhealthy' = 
      Object.values(criticalServices).every(service => service) ? 'healthy' : 'unhealthy';

    const healthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        databases: {
          // Database checks disabled for now - part of future refactor
          oltp: 'disabled',
          olap: 'disabled', 
          messages: 'disabled',
          queue: 'disabled'
        },
        cache: {
          redis: cacheAvailable ? 'healthy' : 'unhealthy',
          stats: cacheStats,
        },
        api: {
          niledb: nileApiHealth ? 'healthy' : 'unhealthy',
        },
      },
      environment: {
        node_env: process.env.NODE_ENV,
        has_redis_url: !!process.env.REDIS_URL,
        has_niledb_api: !!process.env.NILEDB_API_URL,
      },
    };

    // Cache the result if Redis is available
    if (redisClient) {
      try {
        const ttl = HEALTH_CACHE_TTL[overallStatus as keyof typeof HEALTH_CACHE_TTL] || 30;
        await redisClient.setex(HEALTH_CACHE_KEY, ttl, JSON.stringify(healthStatus));
        developmentLogger.debug(`[Health] Cached health status for ${ttl}s`);
      } catch (cacheError) {
        developmentLogger.warn('[Health] Cache write failed:', cacheError);
      }
    }

    return NextResponse.json(healthStatus, {
      status: overallStatus === 'healthy' ? 200 : 503,
      headers: {
        'X-Cache': 'MISS'
      }
    });

  } catch (error) {
    productionLogger.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}