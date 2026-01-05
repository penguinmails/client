/**
 * Health Check Service Functions
 * 
 * Functions to verify the health of different system services.
 */

import { ServiceCheck, ServiceStatus } from './types';
import { Redis } from '@upstash/redis';
import { testNileConnection } from '@/lib/niledb/client';

const startTime = Date.now();

/**
 * Get application uptime in seconds
 */
export function getUptime(): number {
  return Math.floor((Date.now() - startTime) / 1000);
}

/**
 * Check NileDB (Postgres) connection health
 */
export async function checkDatabaseHealth(): Promise<ServiceCheck> {
  const start = Date.now();
  
  // Use the shared NileDB client wrapper which handles connection pooling
  // and configuration automatically
  const result = await testNileConnection();

  if (result.success) {
    return {
      name: 'database',
      status: 'healthy',
      responseTime: Date.now() - start,
      timestamp: new Date().toISOString(),
    };
  } else {
    return {
      name: 'database',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: result.error || 'Database connection failed',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Check Upstash Redis connection health
 */
export async function checkRedisHealth(): Promise<ServiceCheck> {
  const start = Date.now();
  
  try {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      return {
        name: 'redis',
        status: 'degraded',
        error: 'Redis configuration missing',
        timestamp: new Date().toISOString(),
      };
    }

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    await redis.ping();

    return {
      name: 'redis',
      status: 'healthy',
      responseTime: Date.now() - start,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: 'redis',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Redis connection failed',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Check Convex service health
 */
export async function checkConvexHealth(): Promise<ServiceCheck> {
  const start = Date.now();
  
  try {
    if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
      return {
        name: 'convex',
        status: 'degraded',
        error: 'Convex configuration missing',
        timestamp: new Date().toISOString(),
      };
    }

    // Simple HTTP check to Convex endpoint
    const response = await fetch(process.env.NEXT_PUBLIC_CONVEX_URL, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });

    const status: ServiceStatus = response.ok ? 'healthy' : 'degraded';

    return {
      name: 'convex',
      status,
      responseTime: Date.now() - start,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      name: 'convex',
      status: 'unhealthy',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Convex connection failed',
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Determine overall system status based on service checks
 */
export function determineOverallStatus(services: {
  database: ServiceCheck;
  redis: ServiceCheck;
  convex: ServiceCheck;
}): ServiceStatus {
  const statuses = [services.database.status, services.redis.status, services.convex.status];

  // If any critical service (database) is unhealthy, system is unhealthy
  if (services.database.status === 'unhealthy') {
    return 'unhealthy';
  }

  // If any service is unhealthy, system is degraded
  if (statuses.includes('unhealthy')) {
    return 'degraded';
  }

  // If any service is degraded, system is degraded
  if (statuses.includes('degraded')) {
    return 'degraded';
  }

  return 'healthy';
}

/**
 * Get system information
 */
export function getSystemInfo() {
  const memUsage = process.memoryUsage();
  
  return {
    nodeVersion: process.version,
    platform: process.platform,
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      total: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
    },
  };
}
