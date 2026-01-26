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
  const { user, loading } = useAuth();
  const router = useRouter();

  const isAuthorized = React.useMemo(() => {
    if (!user) return false;
    const userRole = user.role;
    return typeof userRole === "string" && isAdminRole(userRole) && allowedRoles.includes(userRole as AdminRole);
  }, [user, allowedRoles]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (!isAuthorized) {
      router.replace(fallbackPath);
    }
  }, [user, loading, isAuthorized, fallbackPath, router]);

  // Show loading state while checking
  if (loading || (!user && !isAuthorized)) {
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
  const { user, loading } = useAuth();
  
  const isAuthorized = React.useMemo(() => {
    if (loading || !user) return false;
    
    const userRole = user.role;
    if (!userRole || !isAdminRole(userRole)) return false;
    
    return allowedRoles.includes(userRole as AdminRole);
  }, [user, loading, allowedRoles]);

  return {
    isAuthorized,
    isLoading: loading,
    userRole: user?.role,
  };
}
