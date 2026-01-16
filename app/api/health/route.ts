
import { NextResponse } from 'next/server';
import { VERSION } from '@/lib/health/constants';
import { getUptime } from '@/lib/health/checks';
import { logHealthCheck } from '@/lib/health/monitoring';
import { HealthCheckResponse } from '@/lib/health/types';
import { productionLogger } from '@/lib/logger';

export async function GET() {
  const timestamp = new Date().toISOString();
  const uptime = getUptime();

  try {
    const healthData: HealthCheckResponse = {
      status: 'healthy',
      timestamp,
      uptime,
      version: VERSION,
    };

    // Log to PostHog (non-blocking)
    logHealthCheck(healthData).catch(err =>
      productionLogger.error('Failed to log health check:', err)
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
    productionLogger.error('Health check failed:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp,
        uptime,
        version: VERSION,
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 503 }
    );
  }
}

export function HEAD() {
  return new Response(null, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
