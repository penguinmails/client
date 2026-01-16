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
  determineOverallStatus,
  getUptime,
  getSystemInfo,
} from '@/lib/health/checks';
import { logHealthCheck, logServiceAlert } from '@/lib/health/monitoring';
import { DetailedHealthCheckResponse } from '@/lib/health/types';

import { VERSION } from '@/lib/health/constants';
import { PostHogClient, shutdownPostHog } from '@/lib/health/monitoring';

export async function GET() {
  const timestamp = new Date().toISOString();
  const uptime = getUptime();
  
  try {
    // Run all health checks in parallel
    const [database, redis] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth(),
    ]);

    const services = { database, redis };
    const overallStatus = determineOverallStatus(services);
    const systemInfo = getSystemInfo();

    const healthData: DetailedHealthCheckResponse = {
      status: overallStatus,
      timestamp,
      uptime,
      version: VERSION,
      services,
      system: systemInfo,
      environment: process.env.NODE_ENV || 'development',
    };

    // Instantiate PostHog once for this request
    const posthog = PostHogClient();

    try {
      // Log to PostHog (non-blocking but shared client)
      await logHealthCheck(healthData, posthog);

      // Log individual service alerts if needed
      for (const service of Object.values(services)) {
        if (service.status !== 'healthy') {
          await logServiceAlert(service.name, service.status, service.error, posthog);
        }
      }
    } catch (err) {
      console.error('Logging failed:', err);
    } finally {
      // Ensure we shut down the client
      await shutdownPostHog(posthog);
    }

    const statusToCode: Record<string, number> = {
      healthy: 200,
      degraded: 207,
      unhealthy: 503,
    };
    const statusCode = statusToCode[overallStatus] || 503;

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
        timestamp,
        uptime,
        version: VERSION,
        error: error instanceof Error ? error.message : 'Health check failed',
        environment: process.env.NODE_ENV || 'development',
      },
      { status: 503 }
    );
  }
}
