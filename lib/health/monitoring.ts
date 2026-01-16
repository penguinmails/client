/**
 * Health Monitoring with PostHog
 * 
 * Integrates health checks with PostHog for monitoring and alerting.
 */

import { PostHog } from 'posthog-node';
import { ServiceStatus, HealthCheckResponse } from './types';
import { developmentLogger, productionLogger } from '@/lib/logger';

import { DOWNTIME_THRESHOLD_MS } from './constants';

export function PostHogClient() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

  if (!key) {
    developmentLogger.warn('PostHog key missing, logging disabled');
    // Return a dummy object or handle gracefully.
    // For now, posthog-node might throw if key is empty, so we check.
  }

  return new PostHog(
    key || 'phc_dummy_key', 
    { host }
  );
}

// Allow external shutdown if managed externally
export async function shutdownPostHog(client: PostHog) {
  await client.shutdown();
}

/**
 * Log health check result to PostHog
 */
export async function logHealthCheck(
  healthData: HealthCheckResponse, 
  existingClient?: PostHog
): Promise<void> {
  // Use existing client or create new one (and mark for shutdown)
  const posthog = existingClient || PostHogClient();
  const shouldShutdown = !existingClient;

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

    if (shouldShutdown) {
      await shutdownPostHog(posthog);
    }
  } catch (error) {
    productionLogger.error('Failed to log health check to PostHog:', error);
    // Don't throw - health check should succeed even if logging fails
    // Be safe and try to shutdown even on error if we own the client
    if (shouldShutdown) {
      try { await shutdownPostHog(posthog); } catch {}
    }
  }
}

/**
 * Log service degradation or failure
 */
export async function logServiceAlert(
  serviceName: string,
  status: ServiceStatus,
  error?: string,
  existingClient?: PostHog
): Promise<void> {
  const posthog = existingClient || PostHogClient();
  const shouldShutdown = !existingClient;

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

    if (shouldShutdown) {
      await shutdownPostHog(posthog);
    }
  } catch (error) {
    productionLogger.error('Failed to log service alert to PostHog:', error);
    if (shouldShutdown) {
      try { await shutdownPostHog(posthog); } catch {}
    }
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
  return downtime > DOWNTIME_THRESHOLD_MS;
}
