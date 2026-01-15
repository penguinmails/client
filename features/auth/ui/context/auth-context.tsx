"use client";

/**
 * Auth Context - Composition Layer
 *
 * This module composes BaseAuthProvider + UserEnrichmentProvider for backward
 * compatibility. It re-exports a unified `useAuth` hook that combines both contexts.
 *
 * For new code, prefer using:
 * - `useBaseAuth()` for session-level auth (fast, minimal data)
 * - `useEnrichment()` for enriched user data (profile, roles, tenant)
 */

import React, { useMemo, useCallback } from "react";
import {
  BaseAuthProvider,
  useBaseAuth,
} from "./base-auth-context";
import {
  UserEnrichmentProvider,
  useEnrichment,
} from "./enrichment-context";
import { AuthUser, AuthLoadingState, AuthContextValue } from "../../types";
import { SessionProvider } from "@niledatabase/react";

// ============================================================================
// Composition Provider (simplified - no GlobalFetchInterceptor)
// ============================================================================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SessionProvider>
      <BaseAuthProvider>
        <UserEnrichmentProvider>
          {children}
        </UserEnrichmentProvider>
      </BaseAuthProvider>
    </SessionProvider>
  );
};

// ============================================================================
// Unified useAuth Hook (Backward Compatible)
// ============================================================================

/**
 * Unified auth hook that combines BaseAuth + Enrichment contexts.
 *
 * For performance-critical code or components that only need session info,
 * prefer using `useBaseAuth()` directly.
 */
export const useAuth = (): AuthContextValue => {
  const baseAuth = useBaseAuth();
  const enrichment = useEnrichment();

  // Build unified user object
  const user: AuthUser | null = useMemo(() => {
    if (!baseAuth.user) return null;

    // Merge base + enriched
    return {
      id: baseAuth.user.id,
      email: baseAuth.user.email,
      emailVerified: baseAuth.user.emailVerified ?? undefined,
      // Enriched fields
      name: enrichment.enrichedUser?.name,
      displayName: enrichment.enrichedUser?.displayName,
      givenName: enrichment.enrichedUser?.givenName,
      familyName: enrichment.enrichedUser?.familyName,
      picture: enrichment.enrichedUser?.picture,
      photoURL: enrichment.enrichedUser?.photoURL,
      isStaff: enrichment.enrichedUser?.isStaff,
      role: enrichment.enrichedUser?.role,
      claims: enrichment.enrichedUser?.claims,
      tenantMembership: enrichment.enrichedUser?.tenantMembership,
      preferences: enrichment.enrichedUser?.preferences,
    };
  }, [baseAuth.user, enrichment.enrichedUser]);

  // Build loading state
  const authLoading: AuthLoadingState = useMemo(
    () => ({
      session: baseAuth.isLoading,
      enrichment: enrichment.isLoadingEnrichment,
    }),
    [baseAuth.isLoading, enrichment.isLoadingEnrichment]
  );

  // Combine errors (base auth error takes precedence)
  const error = baseAuth.error || enrichment.enrichmentError;

  // Refresh all user data
  const refreshUser = useCallback(async () => {
    await enrichment.refreshEnrichment();
  }, [enrichment]);

  return useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: baseAuth.isAuthenticated,
      loading: baseAuth.isLoading,
      authLoading,
      error,
      userTenants: enrichment.userTenants,
      userCompanies: enrichment.userCompanies,
      isStaff: enrichment.isStaff,
      selectedTenantId: enrichment.selectedTenantId,
      selectedCompanyId: enrichment.selectedCompanyId,
      sessionExpired: false, // TODO: Implement session expiry detection
      setSelectedTenant: enrichment.setSelectedTenant,
      setSelectedCompany: enrichment.setSelectedCompany,
      refreshUserData: refreshUser,
      refreshProfile: refreshUser,
      refreshTenants: refreshUser,
      refreshCompanies: refreshUser,
      clearError: baseAuth.clearError,
      login: baseAuth.login,
      signup: baseAuth.signup,
      logout: baseAuth.logout,
      refreshUser,
    }),
    [
      user,
      baseAuth.isAuthenticated,
      baseAuth.isLoading,
      authLoading,
      error,
      enrichment.userTenants,
      enrichment.userCompanies,
      enrichment.isStaff,
      enrichment.selectedTenantId,
      enrichment.selectedCompanyId,
      enrichment.setSelectedTenant,
      enrichment.setSelectedCompany,
      baseAuth.clearError,
      baseAuth.login,
      baseAuth.signup,
      baseAuth.logout,
      refreshUser,
    ]
  );
};

// ============================================================================
// Re-exports for convenience
// ============================================================================

export { useBaseAuth } from "./base-auth-context";
export { useEnrichment } from "./enrichment-context";
