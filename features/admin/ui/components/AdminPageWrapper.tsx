"use client";

import { AdminGuard } from "@/features/admin/lib/admin-guard";
import { AdminRole } from "@/features/auth/types/base";
import { SessionTimeoutWarning } from "@/features/auth/ui/components/SessionTimeoutWarning";

interface AdminPageWrapperProps {
  children: React.ReactNode;
}

/**
 * AdminPageWrapper - Wraps admin pages with authentication guard and session timeout
 * 
 * All admin roles (Owner, Admin, Support) can access admin pages.
 * Each page can further restrict based on specific permissions.
 */
export function AdminPageWrapper({ children }: AdminPageWrapperProps) {
  return (
    <AdminGuard 
      allowedRoles={[AdminRole.OWNER, AdminRole.ADMIN, AdminRole.SUPPORT]}
      fallbackPath="/access-denied"
    >
      <SessionTimeoutWarning enabled />
      {children}
    </AdminGuard>
  );
}
