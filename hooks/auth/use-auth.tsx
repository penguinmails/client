"use client";

import { useMemo, useCallback } from "react";
import { useSession } from "./use-session";
import { useEnrichment } from "./use-enrichment";
import { AuthUser, AuthLoadingState, AuthContextValue } from "@/types/auth";

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
        } as AuthUser;
    }
    
    return null;
  }, [sessionAuth.session, enrichment.enrichedUser]);

  // Build loading state
  const authLoading: AuthLoadingState = useMemo(
    () => ({
      session: sessionAuth.isLoading,
      enrichment: enrichment.isLoadingEnrichment,
    }),
    [sessionAuth.isLoading, enrichment.isLoadingEnrichment]
  );

  // Combine errors (session error takes precedence)
  const error = sessionAuth.error || enrichment.enrichmentError;

  // Refresh all user data
  const refreshUser = useCallback(async () => {
    await sessionAuth.recoverSession(); // verify session
    await enrichment.refreshEnrichment();
  }, [sessionAuth, enrichment]);

  return useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!sessionAuth.session,
      loading: sessionAuth.isLoading, // Legacy simple loading
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
    }),
    [
      user,
      sessionAuth.session,
      sessionAuth.isLoading,
      authLoading,
      error,
      enrichment.userTenants,
      enrichment.userCompanies,
      enrichment.isStaff,
      enrichment.selectedTenantId,
      enrichment.selectedCompanyId,
      enrichment.setSelectedTenant,
      enrichment.setSelectedCompany,
      sessionAuth.retryCount,
      sessionAuth.login,
      sessionAuth.signup,
      sessionAuth.logout,
      refreshUser,
    ]
  );
};
