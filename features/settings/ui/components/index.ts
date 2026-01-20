// Account components
export { default as AccountSettings } from './account/AccountSettings';

// Appearance components
export { default as AppearanceSettings } from './appearance/AppearanceSettings';

// General components
export { ComplianceSettings } from './general/ComplianceSettings';
export { default as GeneralNotificationSettings } from './general/NotificationSettings';
export { default as GeneralNavLink } from './general/nav-link';

// Notifications components
export { default as NotificationSettings } from './notifications/NotificationSettings';
export { default as NotificationsSettings } from './notifications/notifications-settings';

// Profile components
export { default as ProfileForm } from './profile/profile-form';
export { default as ProfileErrorBoundary } from './profile/ProfileErrorBoundary';
export { default as PasswordSettingsForm } from './profile/PasswordSettingsForm';
export { ProfileSettingsForm } from './profile/ProfileSettingsForm';

// Security components
export { default as SecurityRecommendations } from './security/SecurityRecommendations';
export { default as ChangePasswordForm } from './security/change-password-form';
export {
  TwoAuthProvider,
  TwoFactorAuthenticationSwitch,
  AlertSuccessTwoAuth,
  DialogTwoAuth,
  useTwoAuthContext,
} from './security/TwoFactorAuthSwitch';

// Common components - Feature-specific error boundaries only
export {
  SettingsErrorBoundary,
  SettingsErrorFallback,
} from "./common/SettingsErrorBoundary";
export { SettingsErrorState } from './common/SettingsErrorState';
export { SettingsLoadingSkeleton } from './common/SettingsLoadingSkeleton';
export { SettingsPageWrapper } from './common/SettingsPageWrapper';
export { useSettingsNotifications } from './common/SettingsSuccessNotification';

// Navigation components
export { default as NavLink } from './NavLink';

// Tracking components
export { default as TrackingPreferences } from './tracking/tracking-preferences';
