"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { AdminRole, isAdminRole } from "@/features/auth/types/base";
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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (loading) return;

    // No user = not authenticated
    if (!user) {
      router.replace("/login");
      return;
    }

    // Check if user has admin role
    const userRole = user.role;
    
    if (!userRole || !isAdminRole(userRole)) {
      router.replace(fallbackPath);
      return;
    }

    // Check if user's role is in allowed roles
    if (!allowedRoles.includes(userRole as AdminRole)) {
      router.replace(fallbackPath);
      return;
    }

    setIsAuthorized(true);
    setIsChecking(false);
  }, [user, loading, allowedRoles, fallbackPath, router]);

  // Show loading state while checking
  if (loading || isChecking) {
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
