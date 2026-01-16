import { useAuth } from '@features/auth/hooks/use-auth';
import { useSystemHealth } from "@/hooks";
import { UserRole } from '@features/auth/types';
import { developmentLogger } from '@/lib/logger';
import { useCallback, useState } from 'react';

// Types for enhanced auth functionality

type ErrorType = 'authentication' | 'validation' | 'network' | 'unknown';

export interface StaffAccess {
  isStaff: boolean;
  canAccessAdmin: boolean;
  canManageUsers: boolean;
  systemHealth: {
    status: "healthy" | "degraded" | "unhealthy" | "unknown";
    lastCheck?: Date;
  };
  checkSystemHealth: () => Promise<void>;
  getMonitoringData: () => Promise<Record<string, unknown>>;
  loading: boolean;
}

export interface TenantAccess {
  currentTenant: string | null;
  switchTenant: (tenantId: string) => void;
  availableTenants: Array<{ id: string; name: string }>;
  hasAccess: boolean;
  role?: string;
  error?: string;
}

export interface CompanyAccess {
  currentCompany: string | null;
  switchCompany: (companyId: string) => void;
  availableCompanies: Array<{ id: string; name: string }>;
  hasAccess: boolean;
  role?: string;
  error?: string;
}

export interface ErrorRecovery {
  hasError: boolean;
  errorMessage?: string;
  retry: () => void;
  clearError: () => void;
  error?: string;
  canRecover: boolean;
  recoverFromError: () => Promise<void>;
  recovering: boolean;
  reportError: (error: Error, type: string) => void;
  errorType?: string;
}

/**
 * Hook to access staff-only features and system health
 */
export function useStaffAccess(): StaffAccess {
  const { user, authLoading } = useAuth();
  const { systemHealth, checkSystemHealth } = useSystemHealth();
  
  const isStaff = user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
  
  return {
    isStaff,
    canAccessAdmin: isStaff,
    canManageUsers: isStaff || user?.role === UserRole.MANAGER,
    systemHealth,
    checkSystemHealth,
    getMonitoringData: async () => {
      // Logic for fetching monitoring data - only for staff
      if (!isStaff) return {};
      return { status: 'operational', uptime: '99.9%' };
    },
    loading: authLoading.session || authLoading.enrichment
  };
}

/**
 * Hook to check and manage tenant access
 */
export function useTenantAccess(tenantId?: string): TenantAccess {
  const { userTenants, selectedTenantId, authLoading } = useAuth();
  const targetTenantId = tenantId || selectedTenantId;
  
  const tenant = userTenants.find(t => t.id === targetTenantId);
  const hasAccess = !!tenant;
  
  return {
    currentTenant: targetTenantId,
    switchTenant: (tenantId: string) => {
      developmentLogger.debug('Switching to tenant:', tenantId);
      // Implementation for switching tenant context
    },
    availableTenants: userTenants.map(t => ({ id: t.id, name: t.name })),
    hasAccess,
    role: undefined, // Currently tenant-level role is handled via authUser.claims
    error: !hasAccess && !authLoading.session ? 'Access denied' : undefined
  };
}

/**
 * Hook to check and manage company access
 */
export function useCompanyAccess(companyId?: string, tenantId?: string): CompanyAccess {
  const { userCompanies, selectedCompanyId, selectedTenantId, authLoading } = useAuth();
  const targetCompanyId = companyId || selectedCompanyId;
  const targetTenantId = tenantId || selectedTenantId;
  
  const company = userCompanies.find(c => c.id === targetCompanyId && c.tenantId === targetTenantId);
  const hasAccess = !!company;
  
  return {
    currentCompany: targetCompanyId,
    switchCompany: (companyId: string) => {
      developmentLogger.debug('Switching to company:', companyId);
      // Implementation for switching company context
    },
    availableCompanies: userCompanies
      .filter(c => c.tenantId === targetTenantId)
      .map(c => ({ id: c.id, name: c.name })),
    hasAccess,
    role: company?.role,
    error: !hasAccess && !authLoading.session ? 'Access denied' : undefined
  };
}

/**
 * Hook for error reporting and recovery in the auth flow
 */
export function useErrorRecovery(): ErrorRecovery {
  const { error: authError, clearError, refreshUserData } = useAuth();
  const [localError, setLocalError] = useState<Error | null>(null);
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [recovering, setRecovering] = useState(false);

  const currentError = localError || authError;

  const reportError = useCallback((error: Error, type: string) => {
    setLocalError(error);
    setErrorType(type as ErrorType);
    developmentLogger.error(`[AuthError] ${type}:`, error);
  }, []);

  const clearErrorHandler = useCallback(() => {
    setLocalError(null);
    setErrorType(null);
    clearError();
  }, [clearError]);

  const recoverFromError = useCallback(async () => {
    setRecovering(true);
    try {
      clearErrorHandler();
      await refreshUserData();
    } finally {
      setRecovering(false);
    }
  }, [refreshUserData, clearErrorHandler]);

  const retry = useCallback(() => {
    clearErrorHandler();
    refreshUserData();
  }, [refreshUserData, clearErrorHandler]);

  return {
    hasError: !!currentError,
    errorMessage: currentError?.message,
    retry,
    clearError: clearErrorHandler,
    error: currentError?.message,
    canRecover: !!currentError && !recovering,
    recoverFromError,
    recovering,
    reportError,
    errorType: errorType || undefined,
  };
}
