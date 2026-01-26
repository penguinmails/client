"use client";
/**
 * Shared Auth State Hook
 * 
 * Provides basic auth state without depending on specific auth feature implementations
 */

import { useState, useCallback, useEffect } from 'react';
import { BaseUser, AuthUser, TenantInfo, CompanyInfo } from '@/types';
import { productionLogger } from '@/lib/logger';

interface AuthState {
  user: BaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface UseAuthStateReturn extends AuthState {
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: BaseUser | null) => void;
}

/**
 * Shared hook for basic auth state management
 * This provides a minimal auth interface that can be used across features
 */
export function useAuthState(): UseAuthStateReturn {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null
  });

  const refreshAuth = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Check current session
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const sessionData = await response.json();
        if (sessionData.user) {
          setAuthState({
            user: sessionData.user,
            isAuthenticated: true,
            loading: false,
            error: null
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null
          });
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      productionLogger.error('[AuthState] Failed to refresh auth:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication check failed'
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  const setUser = useCallback((user: BaseUser | null) => {
    setAuthState(prev => ({
      ...prev,
      user,
      isAuthenticated: !!user
    }));
  }, []);

  // Initial auth check
  useEffect(() => {
    const checkAuth = async () => {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        // Check current session
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const sessionData = await response.json();
          if (sessionData.user) {
            setAuthState({
              user: sessionData.user,
              isAuthenticated: true,
              loading: false,
              error: null
            });
          } else {
            setAuthState({
              user: null,
              isAuthenticated: false,
              loading: false,
              error: null
            });
          }
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        productionLogger.error('[AuthState] Failed to refresh auth:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication check failed'
        });
      }
    };

    checkAuth();
  }, []);

  return {
    ...authState,
    refreshAuth,
    clearError,
    setUser
  };
}

/**
 * Hook for checking user roles and permissions
 */
export function useUserPermissions(user: AuthUser | null) {
  return {
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isManager: user?.role === 'manager',
    isStaff: user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager',
    canAccessAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    canManageUsers: user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager'
  };
}

/**
 * Hook for tenant/company context
 */
export function useTenantContext() {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);

  const switchTenant = useCallback((tenantId: string) => {
    setSelectedTenantId(tenantId);
    setSelectedCompanyId(null); // Reset company when switching tenant
  }, []);

  const switchCompany = useCallback((companyId: string) => {
    setSelectedCompanyId(companyId);
  }, []);

  return {
    selectedTenantId,
    selectedCompanyId,
    tenants,
    companies,
    setTenants,
    setCompanies,
    switchTenant,
    switchCompany
  };
}
