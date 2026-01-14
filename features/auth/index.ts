/**
 * Auth Feature - Public API
 * 
 * Provides centralized access to authentication functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

// Types - Public type definitions
export type {
  AuthUser,
  UserRole,
} from '@/entities/user';

export type {
  TenantMembership,
} from '@/entities/tenant';

// Queries - Data fetching operations
export {
  getCurrentUser,
  validateSession,
  getUserProfile,
} from './queries';

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
  useAuth,
} from './ui/context/auth-context';

// Hooks - Public custom hooks
export {
  useAuthState,
  useTwoFactorAuth,
} from '@/shared/hooks';

// Operations - Public auth operations
export {
  checkSession,
} from './lib/auth-operations';
