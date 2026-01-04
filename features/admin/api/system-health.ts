/**
 * Admin System Health API Layer
 * 
 * Handles admin-specific system health API calls and data fetching
 */

import { productionLogger } from '@/lib/logger';
import { SystemHealthStatus } from '@/shared/types';

export interface AdminSystemHealthData {
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  lastCheck?: Date;
  details?: string | {
    niledb_sdk?: string;
    tenant_isolation?: string;
  };
  services?: {
    database: string;
    auth: string;
  };
}

/**
 * Fetch comprehensive system health data for admin dashboard
 */
export async function fetchAdminSystemHealth(): Promise<AdminSystemHealthData> {
  try {
    const response = await fetch('/api/health/niledb', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const healthData = await response.json();
      
      return {
        status: healthData.data?.status || "healthy",
        lastCheck: new Date(),
        details: healthData.data?.details,
        services: healthData.data?.services
      };
    } else {
      return {
        status: "unhealthy",
        lastCheck: new Date(),
        details: `Admin health check failed with status ${response.status}`
      };
    }
  } catch (error) {
    productionLogger.error('[AdminSystemHealth] Health check failed:', error);
    return {
      status: "unhealthy",
      lastCheck: new Date(),
      details: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Fetch basic system health status (lighter weight)
 */
export async function fetchBasicSystemHealth(): Promise<SystemHealthStatus> {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const healthData = await response.json();
      return {
        status: healthData.status || "healthy",
        lastCheck: new Date(),
        details: healthData.details
      };
    } else {
      return {
        status: "unhealthy",
        lastCheck: new Date(),
        details: `Health check failed with status ${response.status}`
      };
    }
  } catch (error) {
    productionLogger.error('[SystemHealth] Basic health check failed:', error);
    return {
      status: "unhealthy",
      lastCheck: new Date(),
      details: error instanceof Error ? error.message : "Unknown error"
    };
  }
}