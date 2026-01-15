/**
 * Shared Data Access Layer (Client-Safe)
 * 
 * Only exports that are safe for both client and server environments.
 * Server-only exports (NileDB SDK, DB connections) are in ./server.ts
 */

// Configuration
export * from '@/lib/config';

// Monitoring & Health
export * from '@/lib/utils/monitoring/health';

// Error Handling (Client-safe classes and utilities)
export * from '@/lib/nile/errors';

/**
 * Note: Avoid exporting * from ./auth or ./entities here,
 * as they contain server-only logic and imports.
 * Instead, import from @/shared/queries/server or specific files.
 */