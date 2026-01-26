/**
 * Auth Hooks - Public API
 * 
 * Centralized exports for all authentication-related custom hooks
 */

// Re-export auth hooks from share kernel
export { useAuthState } from '@/hooks/auth/use-auth-state';
export { useTwoFactorAuth } from '@/hooks/auth/use-two-factor-auth';
