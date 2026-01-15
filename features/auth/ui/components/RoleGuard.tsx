"use client";

import React from "react";
import { useEnrichment } from "../context/enrichment-context";
import { UserRole } from "../../types/base"; // Importing UserRole enum
import { AlertCircle } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[]; // Accept UserRole enum or string[]
  fallback?: React.ReactNode;
}

export const RoleGuard = ({
  children,
  allowedRoles,
  fallback
}: RoleGuardProps) => {
  const { enrichedUser, isLoadingEnrichment } = useEnrichment();
  
  if (isLoadingEnrichment) {
    // Or return null/spinner
    return <div className="animate-pulse h-4 w-24 bg-gray-200 rounded"></div>;
  }
  
  if (!enrichedUser) {
    return null; // Should not happen if wrapped in ProtectedRoute, but safe guard
  }
  
  // Check if user has any of the allowed roles
  // enrichedUser.role is "user" | "admin" etc.
  const hasAccess = allowedRoles.some(role => role === enrichedUser.role);
  
  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;
    
    // Default fallback
    return (
      <div className="flex items-center gap-2 p-4 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
        <AlertCircle className="h-4 w-4" />
        <span>You do not have permission to view this content.</span>
      </div>
    );
  }
  
  return <>{children}</>;
};
