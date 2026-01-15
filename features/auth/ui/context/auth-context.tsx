"use client";

/**
 * Auth Context - Composition Layer
 *
 * This module composes SessionProvider + UserEnrichmentProvider for backward
 * compatibility. It re-exports a unified `useAuth` hook that combines both contexts.
 *
 * For new code, prefer using:
 * - `useSession()` for session-level auth (fast, minimal data)
 * - `useEnrichment()` for enriched user data (profile, roles, tenant)
 */

import React, { useMemo, useCallback } from "react";
import {
  SessionProvider as AppSessionProvider, // Alias to avoid conflict with NileDB SessionProvider if used, though here we might explicitly use ours.
  useSession,
} from "./session-context";
import {
  UserEnrichmentProvider,
  useEnrichment,
} from "./enrichment-context";
import { AuthUser, AuthLoadingState, AuthContextValue } from "../../types/auth-user";
import { SessionProvider as NileSessionProvider } from "@niledatabase/react";

// ============================================================================
// Composition Provider
// ============================================================================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <NileSessionProvider>
      <AppSessionProvider>
        <UserEnrichmentProvider>
          {children}
        </UserEnrichmentProvider>
      </AppSessionProvider>
    </NileSessionProvider>
  );
};

// ============================================================================
// Unified useAuth Hook (Backward Compatible)
// ============================================================================

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
            // other fields undefined
        };
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
    // check session first? session check is fast.
    await sessionAuth.recoverSession(); // verify session
    await enrichment.refreshEnrichment();
  }, [sessionAuth, enrichment]);

  return useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!sessionAuth.session, // or !sessionAuth.isLoading && !!sessionAuth.session
      loading: sessionAuth.isLoading, // Legacy simple loading legacy
      authLoading,
      error,
      userTenants: enrichment.userTenants,
      userCompanies: enrichment.userCompanies,
      isStaff: enrichment.isStaff,
      selectedTenantId: enrichment.selectedTenantId,
      selectedCompanyId: enrichment.selectedCompanyId,
      sessionExpired: sessionAuth.retryCount > 3, // rough estimate or expose explicit expired state
      setSelectedTenant: enrichment.setSelectedTenant,
      setSelectedCompany: enrichment.setSelectedCompany,
      refreshUserData: refreshUser,
      refreshProfile: refreshUser,
      refreshTenants: refreshUser,
      refreshCompanies: refreshUser,
      clearError: () => { /* No explicit clear error in session context exposed yet? sessionAuth.recoverSession() usually resets. */ }, 
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

// ============================================================================
// Re-exports for convenience
// ============================================================================

export { useSession } from "./session-context";
export { useEnrichment } from "./enrichment-context";
