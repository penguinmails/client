/**
 * Mock Auth Data Generator
 * 
 * Generates mock data for companies, roles, and permissions based on user profile.
 * This is a temporary solution until real data fetching functions are implemented.
 * 
 * TODO: Replace with real data fetching once getUserCompanies, getUserRoles, getUserPermissions are implemented
 */

import { Permission } from "@/types/auth";
import { CompanyInfo } from "@/types/company";

/**
 * Generate mock data for companies, roles, and permissions based on user profile
 * 
 * @param userId - User ID
 * @param userRole - User's role (super_admin, admin, manager, user, guest)
 * @param tenantId - Tenant ID (optional)
 * @returns Mock data for companies, roles, and permissions
 */
export function generateMockAuthData(
  userId: string,
  userRole: string,
  tenantId: string | undefined
): {
  companies: CompanyInfo[];
  roles: string[];
  permissions: string[];
} {
  // Mock companies - create a default company for the user's tenant
  const companies: CompanyInfo[] = tenantId
    ? [
        {
          id: `company-${userId.slice(0, 8)}`,
          tenantId,
          name: "My Company",
          email: undefined,
          role: userRole === "admin" || userRole === "super_admin" ? "owner" : "member",
          permissions: {},
        },
      ]
    : [];

  // Mock roles - use the user's profile role
  const roles: string[] = userRole ? [userRole] : ["user"];

  // Mock permissions based on role
  const permissions: string[] = [];
  
  switch (userRole) {
    case "super_admin":
      permissions.push(...Object.values(Permission));
      break;
    case "admin":
      permissions.push(
        Permission.VIEW_USERS,
        Permission.CREATE_USER,
        Permission.UPDATE_USER,
        Permission.VIEW_CAMPAIGNS,
        Permission.CREATE_CAMPAIGN,
        Permission.UPDATE_CAMPAIGN,
        Permission.VIEW_DOMAINS,
        Permission.CREATE_DOMAIN,
        Permission.UPDATE_DOMAIN,
        Permission.VIEW_MAILBOXES,
        Permission.CREATE_MAILBOX,
        Permission.VIEW_ANALYTICS,
        Permission.EXPORT_DATA,
        Permission.VIEW_SETTINGS,
        Permission.UPDATE_SETTINGS,
        Permission.VIEW_BILLING,
        Permission.UPDATE_BILLING
      );
      break;
    case "manager":
      permissions.push(
        Permission.VIEW_CAMPAIGNS,
        Permission.CREATE_CAMPAIGN,
        Permission.UPDATE_CAMPAIGN,
        Permission.VIEW_DOMAINS,
        Permission.VIEW_MAILBOXES,
        Permission.VIEW_ANALYTICS,
        Permission.EXPORT_DATA,
        Permission.VIEW_SETTINGS
      );
      break;
    case "user":
    default:
      permissions.push(
        Permission.VIEW_CAMPAIGNS,
        Permission.CREATE_CAMPAIGN,
        Permission.VIEW_DOMAINS,
        Permission.VIEW_MAILBOXES,
        Permission.VIEW_ANALYTICS
      );
      break;
  }

  return { companies, roles, permissions };
}

