/**
 * Auth Feature - Public API
 * 
 * Provides centralized access to authentication functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

// Types - Public type definitions
export {
  UserRole,
  AdminRole,
  isAdminRole,
  type AuthUser,
  type TenantMembership,
} from '@/types/auth';


// Hooks - Public custom hooks
export { useAuth } from '@/hooks/auth/use-auth';
export { useSession } from '@/hooks/auth/use-session';
export { useEnrichment } from '@/hooks/auth/use-enrichment';
export {
  useAuthState,
  useUserPermissions,
  useTenantContext,
} from '@/hooks/auth/use-auth-state';
export {
  useTwoFactorAuth,
  twoFactorValidation,
} from '@/hooks/auth/use-two-factor-auth';

// UI Components - Public components for external use
export {
  AuthTemplate,
  ProtectedRoute,
  PasswordInput,
  TenantCompanySelector,
  UserMenu,
} from './ui/components';

export { SessionTimeoutWarning } from '@/components/auth/SessionTimeoutWarning';

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
