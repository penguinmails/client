/**
 * Server-Side Data Access Layer
 * 
 * Exports that rely on server-only modules (NileDB SDK, Node.js APIs)
 */

// Core NileDB SDK/DB access
export { nile, testConnection, query } from '@/lib/nile/nile';

// Re-export specific functions to avoid conflicts
export { 
  getCurrentUser as getNileCurrentUser, 
  getCurrentSession as getNileCurrentSession, 
  getUserTenants as getNileUserTenants 
} from '@/lib/nile/nile';

// Authentication & Session Management
export * from '@/features/auth/queries';

// Business Entity Management
// Business Entity Management - Moved to features
// export * from './entities';

// Analytics Database Connections
export * from '@/lib/db-client/analytics';
