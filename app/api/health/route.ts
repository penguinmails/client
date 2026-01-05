/**
 * Basic Health Check Endpoint
 * 
 * GET /api/health - Returns basic health status
 * HEAD /api/health - Returns 200 if system is healthy
 * 
 * This is a lightweight endpoint for external monitoring services.
 * For detailed health information, use /api/health/detailed
 */

import { NextResponse } from 'next/server';
import { getUptime } from '@/lib/health/checks';
import { logHealthCheck } from '@/lib/health/monitoring';
import { HealthCheckResponse } from '@/lib/health/types';

const VERSION = process.env.npm_package_version || '0.1.0';

export async function GET() {
  try {
    const healthData: HealthCheckResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: getUptime(),
      version: VERSION,
    };

    // Log to PostHog (non-blocking)
    logHealthCheck(healthData).catch(err => 
      console.error('Failed to log health check:', err)
    );

    return NextResponse.json(healthData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: getUptime(),
        version: VERSION,
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 503 }
    );
  }
}

export async function HEAD() {
  try {
    return new Response(null, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new Response(null, { status: 503 });
  }
}
