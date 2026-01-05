/**
 * Settings Hooks - Public API
 * 
 * Centralized exports for all settings-related custom hooks
 */

export { useProfileForm } from './use-profile-form';
export { usePreferenceSync } from './use-preference-sync';

// Re-export types that are part of the public API
export type { UIProfileError } from './use-profile-form';