"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignIn, useSignUp } from "@niledatabase/react";
import { useSystemHealth } from "@/shared/hooks";
import { productionLogger, developmentLogger } from "@/lib/logger";
import { toast } from "sonner";

import {
  AuthUser,
  AuthLoadingState,
  AuthContextValue
} from "../../types";
import {
  checkSession,
  fetchUserEnrichment,
  performLogout
} from "../../lib/auth-operations";
import { DatabaseErrorPage } from "../components/db-error-page";

const AuthContext = createContext<AuthContextValue | null>(null);

const DB_MAX_RETRIES = 3;
const RETRY_DELAY = 3000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { systemHealth } = useSystemHealth();
  const isHealthy = systemHealth.status === "healthy";

  // NileDB React Hooks
  const signInHook = useSignIn() as unknown as { (credentials: { provider: string; email: string; password: string }): Promise<void> };
  const signUpHook = useSignUp({ callbackUrl: "/email-confirmation" }) as unknown as { (info: { email: string; password: string; name: string }): Promise<void> };

  // Core State
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<AuthLoadingState>({
    session: true,
    enrichment: false
  });
  const [error, setError] = useState<Error | null>(null);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [sessionExpired, _setSessionExpired] = useState(false);

  // Internal State
  const retryCountRef = useRef(0);
  const enrichmentPromiseRef = useRef<Promise<void> | null>(null);

  /**
   * Auth Actions - Basic functions first
   */
  const logout = useCallback(async () => {
    setUser(null);
    setSelectedTenantId(null);
    setSelectedCompanyId(null);
    await performLogout();
    router.push("/"); // Redirect to home/login page
  }, [router]);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    setLoading(prev => ({ ...prev, session: true }));
    try {
      await signUpHook({ email, password, name });
      toast.success("Account created successfully!");
      router.push("/auth/verify-email");
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Signup failed"));
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, session: false }));
    }
  }, [signUpHook, router]);

  /**
   * Enrich user data from DB with retry logic
   */
  const enrichUser = useCallback(async (userId: string) => {
    if (enrichmentPromiseRef.current) return enrichmentPromiseRef.current;

    const performEnrichment = async () => {
      // Check health only if we failed previously
      if (!isHealthy && retryCountRef.current > 0) {
        developmentLogger.warn("[AuthContext] DB unhealthy, skipping retry for now");
        return;
      }

      setLoading(prev => ({ ...prev, enrichment: true }));

      try {
        const enrichedData = await fetchUserEnrichment(userId);
        setUser(prev => prev ? { ...prev, ...enrichedData } : null);

        // Auto-select tenant if available
        if (enrichedData.tenantMembership?.tenantId) {
          setSelectedTenantId(enrichedData.tenantMembership.tenantId);
        }

        setError(null);
        retryCountRef.current = 0;
      } catch (err) {
        productionLogger.error("[AuthContext] Enrichment failed:", err);

        // Check if this is an authentication error that should trigger logout
        if (err instanceof Error && (err.message.includes('Failed to fetch enrichment data') || err.message.includes('Authentication required'))) {
          productionLogger.info('[AuthContext] Authentication error detected during enrichment, triggering logout');
          // Use a simple timeout to avoid dependency issues
          setTimeout(() => {
            logout();
          }, 0);
          return;
        }

        if (retryCountRef.current < DB_MAX_RETRIES) {
          retryCountRef.current += 1;
          developmentLogger.info(`[AuthContext] Retrying enrichment (${retryCountRef.current}/${DB_MAX_RETRIES})...`);

          setTimeout(() => {
            enrichmentPromiseRef.current = null;
            enrichUser(userId);
          }, RETRY_DELAY);
        } else {
          // Max retries reached, set error but don't block the UI
          productionLogger.warn('[AuthContext] Max enrichment retries reached, continuing with basic user data');
          setError(err instanceof Error ? err : new Error("Failed to load user profile"));
        }
      } finally {
        setLoading(prev => ({ ...prev, enrichment: false }));
        enrichmentPromiseRef.current = null;
      }
    };

    enrichmentPromiseRef.current = performEnrichment();
    return enrichmentPromiseRef.current;
  }, [isHealthy, logout]);

  /**
   * Handle authentication errors globally
   */
  const handleAuthError = useCallback((error: { status?: number; code?: string; message?: string }) => {
    // Check if this is an authentication error
    if (error?.status === 401 || error?.code === 'AUTH_REQUIRED' || error?.message?.includes('Authentication required')) {
      productionLogger.info('[AuthContext] Authentication error detected, logging out user');
      logout();
      return true; // Error was handled
    }
    return false; // Error was not handled
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(prev => ({ ...prev, session: true }));
    try {
      await signInHook({ provider: "credentials", email, password });

      const session = await checkSession();
      if (session) {
        setUser({ id: session.id, email: session.email });
        enrichUser(session.id);
        const next = searchParams.get("next") || "/dashboard";
        router.push(next);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Login failed"));
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, session: false }));
    }
  }, [signInHook, router, searchParams, enrichUser]);

  /**
   * Initial Session Load
   */
  useEffect(() => {
    const init = async () => {
      try {
        const session = await checkSession();

        if (session) {
          setUser({
            id: session.id,
            email: session.email,
            emailVerified: session.emailVerified || undefined
          });
          setLoading({ session: false, enrichment: true });
          enrichUser(session.id);
        } else {
          setLoading({ session: false, enrichment: false });
        }
      } catch (error) {
        productionLogger.error('[AuthContext] Session check failed:', error);
        setLoading({ session: false, enrichment: false });
        // Don't redirect here, let the UI components handle it
      }
    };
    init();
  }, [enrichUser, logout]);

  /**
   * Global fetch interceptor for handling 401 errors
   */
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Check for authentication errors via headers or status
        const isAuthError = response.status === 401 || response.headers.get('X-Auth-Error') === 'true';
        
        if (isAuthError) {
          productionLogger.info('[AuthContext] Authentication error detected, triggering logout');
          handleAuthError({ status: 401, message: 'Authentication required' });
        }
        
        return response;
      } catch (error) {
        // Re-throw non-auth errors
        throw error;
      }
    };

    // Cleanup: restore original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, [handleAuthError]);

  // Compatibility Methods
  const refreshUser = useCallback(async () => {
    if (user?.id) await enrichUser(user.id);
  }, [user?.id, enrichUser]);

  const refreshUserData = refreshUser;
  const refreshProfile = refreshUser;
  const refreshTenants = refreshUser;
  const refreshCompanies = refreshUser;

  const clearError = useCallback(() => setError(null), []);

  const userTenants = useMemo(() => user?.tenantMembership?.tenant ? [{
    id: user.tenantMembership.tenantId,
    name: user.tenantMembership.tenant.name,
    created: ""
  }] : [], [user]);
  const userCompanies = useMemo(() => user?.tenantMembership?.tenant?.companies || [], [user]);
  const isStaff = !!user?.isStaff;

  const contextValue = useMemo<AuthContextValue>(() => ({
    user,
    isAuthenticated: !!user,
    loading: loading.session,
    authLoading: loading,
    error,
    userTenants,
    userCompanies,
    isStaff,
    selectedTenantId,
    selectedCompanyId,
    sessionExpired,
    setSelectedTenant: setSelectedTenantId,
    setSelectedCompany: setSelectedCompanyId,
    refreshUserData,
    refreshProfile,
    refreshTenants,
    refreshCompanies,
    clearError,
    login,
    signup,
    logout,
    refreshUser
  }), [
    user, loading, error, userTenants, userCompanies, isStaff,
    selectedTenantId, selectedCompanyId, sessionExpired, refreshUserData, refreshProfile,
    refreshTenants, refreshCompanies, clearError, login, signup, logout, refreshUser
  ]);

  // If enrichment failed and we've exhausted retries, but we ARE authenticated
  if (user && error && !loading.enrichment && retryCountRef.current >= DB_MAX_RETRIES) {
    return (
      <DatabaseErrorPage
        onRetry={() => {
          retryCountRef.current = 0;
          enrichUser(user.id);
        }}
        error={error}
      />
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
