/**
 * Shared Auth Hook
 * 
 * Provides authentication context across the application.
 * This hook is in the shared layer because it's used by multiple features.
 */

import { useMemo, useCallback } from "react";
import { useSession } from "@/features/auth/hooks/use-session";
import { useEnrichment } from "@/features/auth/hooks/use-enrichment";
import { AuthUser, AuthLoadingState, AuthContextValue } from "@/features/auth/types/auth-user";

/**
 * Unified auth hook that combines Session + Enrichment contexts.
 * 
 * For performance-critical code or components that only need session info,
 * prefer using `useSession()` directly.
 */
export const useAuth = (): AuthContextValue => {
  const sessionAuth = useSession();
  const enrichment = useEnrichment();

  // Build unified user object
  const user: AuthUser | null = useMemo(() => {
    // If we have enrichment, that's the full user.
    if (enrichment.enrichedUser) return enrichment.enrichedUser;
    
    // If only session is present, we can try to return session-only object partial
    if (sessionAuth.session) {
        return {
            id: sessionAuth.session.id,
            email: sessionAuth.session.email,
            emailVerified: sessionAuth.session.emailVerified ? new Date(sessionAuth.session.emailVerified) : undefined,
            // Fallbacks for mandatory arrays
            tenants: [],
            companies: [],
            roles: [],
            permissions: [],
        };
    }
    
    return null;
  }, [sessionAuth.session, enrichment.enrichedUser]);

  // Build loading state
  const authLoading: AuthLoadingState = useMemo(() => ({
    session: sessionAuth.isLoading,
    enrichment: enrichment.isLoadingEnrichment,
  }), [sessionAuth.isLoading, enrichment.isLoadingEnrichment]);

  // Build error
  const error = useMemo(() => {
    if (sessionAuth.error) return sessionAuth.error;
    if (enrichment.enrichmentError) return enrichment.enrichmentError;
    return null;
  }, [sessionAuth.error, enrichment.enrichmentError]);

  // Build refresh function
  const refreshUser = useCallback(async () => {
    // Refresh both session and enrichment
    await sessionAuth.recoverSession();
    await enrichment.refreshEnrichment();
  }, [sessionAuth, enrichment]);

  return useMemo(() => ({
    user,
    isAuthenticated: !!user,
    loading: sessionAuth.isLoading || enrichment.isLoadingEnrichment,
    authLoading,
    error,
    userTenants: enrichment.userTenants,
    userCompanies: enrichment.userCompanies,
    isStaff: enrichment.isStaff,
    selectedTenantId: enrichment.selectedTenantId,
    selectedCompanyId: enrichment.selectedCompanyId,
    sessionExpired: sessionAuth.retryCount > 3,
    setSelectedTenant: enrichment.setSelectedTenant,
    setSelectedCompany: enrichment.setSelectedCompany,
    refreshUserData: refreshUser,
    refreshProfile: refreshUser,
    refreshTenants: refreshUser,
    refreshCompanies: refreshUser,
    clearError: () => { /* No explicit clear error exposed yet */ }, 
    login: sessionAuth.login,
    signup: sessionAuth.signup,
    logout: sessionAuth.logout,
    refreshUser,
  }), [
    user,
    sessionAuth,
    enrichment,
    authLoading,
    error,
    refreshUser,
  ]);
};
