/**
 * Auth Hooks - Public API
 * 
 * Centralized exports for all authentication-related custom hooks
 */

// Re-export shared auth hooks from shared layer
export { useAuthState } from '@/hooks/use-auth-state';
export { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';