import { useAuth } from "@/hooks/auth/use-auth";

/**
 * Hook to get current user ID
 */
export function useUserId() {
  return useAuth().user?.id;
}

/**
 * Hook to get current tenant ID
 */
export function useTenantId() {
  return useAuth().user?.tenantMembership?.tenantId;
}

/**
 * Hook to get current user roles
 */
export function useUserRoles() {
  return useAuth().user?.tenantMembership?.roles ?? [];
}

/**
 * Check if user has a specific role
 */
export function useHasRole(role: string) {
  return useUserRoles().includes(role);
}

/**
 * Hook to get tenant's companies
 */
export function useTenantCompanies() {
  return useAuth().user?.tenantMembership?.tenant?.companies ?? [];
}
