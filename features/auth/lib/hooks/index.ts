/**
 * Auth Hooks - Public API
 * 
 * Centralized exports for all authentication-related custom hooks
 */

// Re-export shared auth hooks from shared layer
export { useAuthState } from '@/shared/hooks/use-auth-state';
export { useTwoFactorAuth } from '@/shared/hooks/use-two-factor-auth';