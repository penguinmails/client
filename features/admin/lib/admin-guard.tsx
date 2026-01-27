"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/use-auth";
import { AdminRole, isAdminRole } from "@/types/auth";
import { Loader2 } from "lucide-react";

interface AdminGuardProps {
  children: React.ReactNode;
  allowedRoles: AdminRole[];
  fallbackPath?: string;
}

/**
 * AdminGuard - Protects admin routes based on user role
 * 
 * Checks if the current user has one of the allowed admin roles.
 * Redirects to access-denied page if unauthorized.
 */
export function AdminGuard({
  children,
  allowedRoles,
  fallbackPath = "/access-denied",
}: AdminGuardProps) {
  const { user, loading, authLoading } = useAuth();
  const router = useRouter();

  const isAuthorized = React.useMemo(() => {
    console.log('[AdminGuard] ===== CHECKING AUTHORIZATION =====');
    console.log('[AdminGuard] User:', user);
    console.log('[AdminGuard] User role:', user?.role);
    console.log('[AdminGuard] Allowed roles:', allowedRoles);
    console.log('[AdminGuard] Loading states:', authLoading);
    if (!user) {
      console.log('[AdminGuard]  No user');
      return false;
    }
    const userRole = user.role;
    if (!userRole || typeof userRole !== "string") {
    console.log('[AdminGuard]  Invalid user role');
    return false;
  }
    console.log('[AdminGuard] User role type:', typeof userRole);
    console.log('[AdminGuard] isAdminRole result:', isAdminRole(userRole));
    console.log('[AdminGuard] Includes check:', allowedRoles.includes(userRole as AdminRole));
    const result = typeof userRole === "string" && isAdminRole(userRole) && allowedRoles.includes(userRole as AdminRole);
    console.log('[AdminGuard]  Final authorization result:', result);
    return result;
  }, [user, allowedRoles, authLoading]);

  useEffect(() => {
    if (loading || authLoading.enrichment) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!isAuthorized) {
      router.replace(fallbackPath);
    }
  }, [user, loading, authLoading.enrichment, isAuthorized, fallbackPath, router]);

  // Show loading state while checking
  if (loading || authLoading.enrichment || (!user && !isAuthorized)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Only render children if authorized
  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook to check if user has admin access
 */
export function useAdminAccess(allowedRoles: AdminRole[]) {
  const { user, loading, authLoading } = useAuth();
  
  const isAuthorized = React.useMemo(() => {
    if (loading || authLoading.enrichment || !user) return false;
    
    const userRole = user.role;
    if (!userRole || !isAdminRole(userRole)) return false;
    
    return allowedRoles.includes(userRole as AdminRole);
  }, [user, loading, authLoading.enrichment, allowedRoles]);

  return {
    isAuthorized,
    isLoading: loading || authLoading.enrichment,
    userRole: user?.role,
  };
}
