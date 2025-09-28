/**
 * NileDB Integration Module
 * 
 * This module provides a complete NileDB integration with configuration management,
 * health checking, and client initialization for the PenguinMails application.
 * 
 * Usage:
 *   import { getNileClient, performHealthCheck } from '@/lib/niledb';
 *   
 *   const nile = getNileClient();
 *   const health = await performHealthCheck();
 */

// Configuration
export {
  createNileConfig,
  getNileConfig,
  resetConfigInstance,
  validateEnvironmentVariables,
  getConfigForEnvironment,
  type NileConfig,
} from './config';

// Client
export {
  initializeNileClient,
  getNileClient,
  resetNileClient,
  createNileClient,
  createNileClientWithContext,
  withTenantContext,
  withoutTenantContext,
  testNileConnection,
  getClientInfo,
} from './client';

// Health & Validation
export {
  validateDatabaseConnection,
  performHealthCheck,
  testQueryPerformance,
  validateConfiguration,
  createHealthMonitor,
  type HealthCheckResult,
  type HealthCheck,
  type ConnectionValidationResult,
} from './health';

// Re-export NileDB types for convenience
export type {
  Server as NileServer,
  User as NileUser,
  Tenant as NileTenant,
  JWT as NileJWT,
  ActiveSession as NileSession,
} from '@niledatabase/server';
