/**
 * Health Monitoring with PostHog
 * 
 * Integrates health checks with PostHog for monitoring and alerting.
 */

import { PostHogClient, shutdownPostHog } from '@/lib/posthog-server';
import { ServiceStatus, HealthCheckResponse } from './types';

/**
 * Log health check result to PostHog
 */
export async function logHealthCheck(healthData: HealthCheckResponse): Promise<void> {
  const posthog = PostHogClient();

  try {
    // Capture health check event
    posthog.capture({
      distinctId: 'system',
      event: 'health_check',
      properties: {
        status: healthData.status,
        uptime: healthData.uptime,
        version: healthData.version,
        timestamp: healthData.timestamp,
        services: healthData.services ? {
          database: healthData.services.database.status,
          redis: healthData.services.redis.status,
          convex: healthData.services.convex.status,
        } : undefined,
      },
    });

    // If status is not healthy, capture as a separate alert event
    if (healthData.status !== 'healthy') {
      posthog.capture({
        distinctId: 'system',
        event: 'system_health_alert',
        properties: {
          severity: healthData.status === 'unhealthy' ? 'critical' : 'warning',
          status: healthData.status,
          timestamp: healthData.timestamp,
          services: healthData.services,
        },
      });
    }

    await shutdownPostHog(posthog);
  } catch (error) {
    console.error('Failed to log health check to PostHog:', error);
    // Don't throw - health check should succeed even if logging fails
  }
}

/**
 * Log service degradation or failure
 */
export async function logServiceAlert(
  serviceName: string,
  status: ServiceStatus,
  error?: string
): Promise<void> {
  const posthog = PostHogClient();

  try {
    posthog.capture({
      distinctId: 'system',
      event: 'service_health_alert',
      properties: {
        service: serviceName,
        status,
        error,
        timestamp: new Date().toISOString(),
        severity: status === 'unhealthy' ? 'critical' : 'warning',
      },
    });

    await shutdownPostHog(posthog);
  } catch (error) {
    console.error('Failed to log service alert to PostHog:', error);
  }
}

/**
 * Check if system has been down for more than 1 minute
 * This should be called by an external monitoring service
 */
export function shouldTriggerDowntimeAlert(
  lastHealthyTimestamp: string,
  currentTimestamp: string
): boolean {
  const lastHealthy = new Date(lastHealthyTimestamp).getTime();
  const now = new Date(currentTimestamp).getTime();
  const downtime = now - lastHealthy;
  
  // 1 minute = 60000 milliseconds
  return downtime > 60000;
}
