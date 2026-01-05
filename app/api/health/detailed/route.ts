/**
 * Detailed Health Check Endpoint
 * 
 * GET /api/health/detailed - Returns comprehensive health status
 * 
 * Checks:
 * - Database (NileDB/Postgres)
 * - Redis (Upstash)
 * - Convex
 * - System resources
 */

import { NextResponse } from 'next/server';
import {
  checkDatabaseHealth,
  checkRedisHealth,
  checkConvexHealth,
  determineOverallStatus,
  getUptime,
  getSystemInfo,
} from '@/lib/health/checks';
import { logHealthCheck, logServiceAlert } from '@/lib/health/monitoring';
import { DetailedHealthCheckResponse } from '@/lib/health/types';

const VERSION = process.env.npm_package_version || '0.1.0';

export async function GET() {
  try {
    // Run all health checks in parallel
    const [database, redis, convex] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth(),
      checkConvexHealth(),
    ]);

    const services = { database, redis, convex };
    const overallStatus = determineOverallStatus(services);
    const systemInfo = getSystemInfo();

    const healthData: DetailedHealthCheckResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: getUptime(),
      version: VERSION,
      services,
      system: systemInfo,
      environment: process.env.NODE_ENV || 'development',
    };

    // Log to PostHog (non-blocking)
    logHealthCheck(healthData).catch(err => 
      console.error('Failed to log health check:', err)
    );

    // Log individual service alerts if needed
    for (const service of Object.values(services)) {
      if (service.status !== 'healthy') {
        logServiceAlert(service.name, service.status, service.error).catch(err =>
          console.error('Failed to log service alert:', err)
        );
      }
    }

    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 207 : 503;

    return NextResponse.json(healthData, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Detailed health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: getUptime(),
        version: VERSION,
        error: error instanceof Error ? error.message : 'Health check failed',
        environment: process.env.NODE_ENV || 'development',
      },
      { status: 503 }
    );
  }
}
