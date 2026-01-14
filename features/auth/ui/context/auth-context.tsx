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

import React, { useMemo, useEffect, useCallback, useRef } from "react";
import {
  BaseAuthProvider,
  useBaseAuth,
} from "./base-auth-context";
import {
  UserEnrichmentProvider,
  useEnrichment,
  EnrichedUser,
} from "./enrichment-context";
import { AuthUser, AuthLoadingState, AuthContextValue, Tenant } from "../../types";
import { CompanyInfo } from "@/types/company";
import { developmentLogger } from "@/lib/logger";
import { SessionProvider } from "@niledatabase/react";

// ============================================================================
// Composition Provider
// ============================================================================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SessionProvider>
      <BaseAuthProvider>
        <UserEnrichmentProvider>
          <GlobalFetchInterceptor>{children}</GlobalFetchInterceptor>
        </UserEnrichmentProvider>
      </BaseAuthProvider>
    </SessionProvider>
  );
};

// ============================================================================
// Global 401 Interceptor (moved from old auth-context)
// ============================================================================

const GlobalFetchInterceptor: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { logout, user, setSessionExpired } = useBaseAuth();
  
  // Use a ref to always have the latest user state in the interceptor closure.
  // We update it during render to ensure zero stale window.
  const userRef = useRef(user);
  userRef.current = user;

  const handleAuthError = useCallback(
    (error: { status?: number; code?: string; message?: string }) => {
      // Don't trigger logout if session is still in 'pending' state
      if (userRef.current?.id === "pending") {
        developmentLogger.info(`[AuthInterceptor] 401 ignored (user.id is "pending")`);
        return false;
      }

      const isAuthError = 
        error?.status === 401 ||
        error?.code === "AUTH_REQUIRED" ||
        error?.message?.includes("Authentication required");

      if (isAuthError) {
        developmentLogger.warn(`[AuthInterceptor] 401 caught, triggering logout. User state:`, userRef.current);
        setSessionExpired(true);
        logout();
        return true;
      }
      return false;
    },
    [logout, setSessionExpired]
  );

  // Keep handleAuthError in a ref too for the same reason
  const handleAuthErrorRef = useRef(handleAuthError);
  useEffect(() => {
    handleAuthErrorRef.current = handleAuthError;
  }, [handleAuthError]);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const response = await originalFetch(input, init);

        const url = typeof input === "string" ? input : input.toString();
        const isAuthCallback =
          url.includes("/api/auth/callback/") || url.includes("/api/auth/csrf");

        if (isAuthCallback) {
          return response;
        }

        const isAuthError =
          response.status === 401 ||
          response.headers.get("X-Auth-Error") === "true";

        if (isAuthError) {
          handleAuthErrorRef.current({ status: 401, message: "Authentication required" });
        }

        return response;
      } catch (error) {
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []); // Only wrap once on mount

  return <>{children}</>;
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
      sessionExpired: baseAuth.sessionExpired,
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

