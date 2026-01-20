/**
 * Settings Feature - Public API
 * 
 * Provides centralized access to settings functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

// Actions - Server-side operations
export {
  getProfile,
  updateProfileData,
  uploadUserAvatar,
  updateFullProfile,
  getUserSettings,
  updateCompanyInfo,
  getComplianceSettings,
  updateComplianceSettings,
  getNotificationSettings,
  updateNotificationSettings,
  getSimpleNotificationPreferences,
  updateSimpleNotificationPreferences,
  getSecurityRecommendations,
} from './actions';

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
} from './ui';

// Shared UI Components - Re-exported for convenience
export { SettingsLoadingSkeleton } from './ui/components/common/SettingsLoadingSkeleton';
export {
  SettingsErrorState,
  NetworkErrorState,
  AuthErrorState,
  ValidationErrorState,
  ServerErrorState,
} from './ui/components/common/SettingsErrorState';
export {
  useSettingsNotifications,
} from './ui/components/common/SettingsSuccessNotification';

// Context - Public context providers
export {
  ClientPreferencesProvider,
  useClientPreferences,
} from './ui/context/client-preferences-context';

// Hooks - Public custom hooks
export {
  useProfileForm,
  usePreferenceSync,
} from './lib/hooks';

// Validations - Public validation schemas
export {
  userPreferencesSchema,
} from './lib/validations';
