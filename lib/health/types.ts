/**
 * Health Check Types
 * 
 * Type definitions for the health monitoring system.
 */

export type ServiceStatus = 'healthy' | 'degraded' | 'unhealthy';

export interface ServiceCheck {
  name: string;
  status: ServiceStatus;
  responseTime?: number;
  error?: string;
  timestamp: string;
}

export interface HealthCheckResponse {
  status: ServiceStatus;
  timestamp: string;
  uptime: number;
  version: string;
  services?: {
    database: ServiceCheck;
    redis: ServiceCheck;
  };
}

export interface DetailedHealthCheckResponse extends HealthCheckResponse {
  system: {
    nodeVersion: string;
    platform: string;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
  };
  environment: string;
}
