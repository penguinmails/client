/**
 * Auth Feature - Public API
 * 
 * Provides centralized access to authentication functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

// Types - Public type definitions
export type {
  AuthUser,
  TenantMembership,
  UserRole,
} from './types';

// Queries - Data fetching operations
export {
  getCurrentUser,
  validateSession,
  getUserProfile,
} from './queries';

// Hooks - Public custom hooks
export { useAuth } from './hooks/use-auth';
export { useSession } from './hooks/use-session';
export { useEnrichment } from './hooks/use-enrichment';
export {
  useAuthState,
  useUserPermissions,
  useTenantContext,
} from './hooks/use-auth-state';
export {
  useTwoFactorAuth,
  twoFactorValidation,
} from './hooks/use-two-factor-auth';

// UI Components - Public components for external use
export {
  AuthTemplate,
  ProtectedRoute,
  PasswordInput,
  TenantCompanySelector,
  UserMenu,
} from './ui/components';

// Context - Public context providers
export {
  AuthProvider,
} from './ui/context/auth-provider';

// Operations - Public auth operations
export {
  checkSession,
} from './lib/session-operations';

// Metrics - Auth-specific metrics and analytics
export {
  authMetrics,
} from './lib/metrics';
