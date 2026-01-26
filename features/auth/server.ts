/**
 * Auth Feature - Server API
 * 
 * Provides server-side authentication functionality.
 * This file should only be imported by Server Components or API Routes.
 */

// Queries - Data fetching operations (Server-only)
export {
  getCurrentUser,
  validateSession,
  getUserProfile,
} from './queries';
