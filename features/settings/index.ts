/**
 * Settings Feature - Public API
 * 
 * Provides centralized access to settings functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

// Types - Public type definitions
export type {
  SecuritySettings,
  SettingsNavItem,
  ProfileFormValues,
} from './types';

// Validation Schemas - Public validation schemas
export {
  profileFormSchema,
} from './types';

export {
  userPreferencesSchema,
} from './lib/validations';

// Actions - Server-side operations
export {
  getUserSettings,
  updateCompanyInfo,
} from './lib/actions';

export {
  getProfile,
  updateProfileData,
  uploadUserAvatar,
  updateFullProfile,
  getComplianceSettings,
  updateComplianceSettings,
  getNotificationSettings,
  updateNotificationSettings,
  getSimpleNotificationPreferences,
  updateSimpleNotificationPreferences,
  getSecurityRecommendations,
} from './actions';

// Hooks - Public custom hooks
export {
  useProfileForm,
  usePreferenceSync,
} from './lib/hooks';

// UI Components - Public components for external use
export {
  AccountSettings,
  AppearanceSettings,
  ComplianceSettings,
  NotificationSettings,
  SecurityRecommendations,
  TwoAuthProvider,
  TwoFactorAuthenticationSwitch,
  SettingsErrorBoundary,
  SettingsErrorFallback,
  NavLink,
  TrackingPreferences,
  ProfileForm,
  ProfileErrorBoundary,
  PasswordSettingsForm,
  ProfileSettingsForm,
  ChangePasswordForm,
  AlertSuccessTwoAuth,
  DialogTwoAuth,
  useTwoAuthContext,
  SettingsLoadingSkeleton,
  SettingsErrorState,
  useSettingsNotifications,
} from './ui';

// Error State Components - Specialized error components
export {
  NetworkErrorState,
  AuthErrorState,
  ValidationErrorState,
  ServerErrorState,
} from './ui/components/common/SettingsErrorState';

// Context - Public context providers
export {
  ClientPreferencesProvider,
  useClientPreferences,
} from './ui/context/client-preferences-context';
