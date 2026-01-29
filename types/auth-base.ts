export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  MANAGER = "manager",
  USER = "user",
  GUEST = "guest",
}

export enum Permission {
  CREATE_USER = "create_user",
  UPDATE_USER = "update_user",
  DELETE_USER = "delete_user",
  VIEW_USERS = "view_users",
  CREATE_CAMPAIGN = "create_campaign",
  UPDATE_CAMPAIGN = "update_campaign",
  DELETE_CAMPAIGN = "delete_campaign",
  VIEW_CAMPAIGNS = "view_campaigns",
  CREATE_DOMAIN = "create_domain",
  UPDATE_DOMAIN = "update_domain",
  DELETE_DOMAIN = "delete_domain",
  VIEW_DOMAINS = "view_domains",
  CREATE_MAILBOX = "create_mailbox",
  UPDATE_MAILBOX = "update_mailbox",
  DELETE_MAILBOX = "delete_mailbox",
  VIEW_MAILBOXES = "view_mailboxes",
  VIEW_ANALYTICS = "view_analytics",
  EXPORT_DATA = "export_data",
  UPDATE_SETTINGS = "update_settings",
  VIEW_SETTINGS = "view_settings",
  VIEW_BILLING = "view_billing",
  UPDATE_BILLING = "update_billing",
  MANAGE_SUBSCRIPTIONS = "manage_subscriptions",
}

/**
 * Admin roles for access control
 * - SUPER_ADMIN: Full system access, internal Penguin Mails staff
 * - OWNER: Full system access, can manage other admins
 * - ADMIN: User and campaign management, settings access
 * - SUPPORT: Read-only access for customer support
 */
export enum AdminRole {
  SUPER_ADMIN = "super_admin",
  OWNER = "owner",
  ADMIN = "admin",
  SUPPORT = "support",
}

/**
 * Permission mappings for each admin role
 */
export const AdminRolePermissions: Record<AdminRole, Permission[]> = {
  [AdminRole.SUPER_ADMIN]: Object.values(Permission), // All permissions
  [AdminRole.OWNER]: Object.values(Permission), // All permissions
  [AdminRole.ADMIN]: [
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.VIEW_USERS,
    Permission.CREATE_CAMPAIGN,
    Permission.UPDATE_CAMPAIGN,
    Permission.DELETE_CAMPAIGN,
    Permission.VIEW_CAMPAIGNS,
    Permission.VIEW_DOMAINS,
    Permission.VIEW_MAILBOXES,
    Permission.VIEW_ANALYTICS,
    Permission.EXPORT_DATA,
    Permission.UPDATE_SETTINGS,
    Permission.VIEW_SETTINGS,
  ],
  [AdminRole.SUPPORT]: [
    Permission.VIEW_USERS,
    Permission.VIEW_CAMPAIGNS,
    Permission.VIEW_DOMAINS,
    Permission.VIEW_MAILBOXES,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_SETTINGS,
  ],
};

/**
 * Check if an admin role has a specific permission
 */
export function hasAdminPermission(role: AdminRole, permission: Permission): boolean {
  return AdminRolePermissions[role]?.includes(permission) ?? false;
}

/**
 * Check if a role is a valid admin role
 */
export function isAdminRole(role: string): role is AdminRole {
  return Object.values(AdminRole).includes(role as AdminRole);
}


export interface Tenant {
  id: string;
  name: string;
  created?: string; // Optional: may not be available from getUserTenants
  updated?: string;
}

export interface NileDBUser {
  id: string;
  email: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  created?: string;
  updated?: string;
  emailVerified?: boolean;
  profile?: {
    userId: string;
    role: "user" | "admin" | "super_admin";
    isPenguinMailsStaff: boolean;
    preferences: Record<string, unknown>;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  };
  tenants?: string[];
}

// Error Types

export const AuthErrorCodes = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  ACCOUNT_DISABLED: "ACCOUNT_DISABLED",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INSUFFICIENT_PERMISSIONS: "INSUFFICIENT_PERMISSIONS",
  SESSION_EXPIRED: "SESSION_EXPIRED",
} as const;

export type AuthErrorCode =
  (typeof AuthErrorCodes)[keyof typeof AuthErrorCodes];
