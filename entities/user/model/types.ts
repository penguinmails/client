import { TenantMembership } from "@/entities/tenant/model/types";
import { z } from 'zod'
import { CoreUser as User } from "@/entities/user";
/**
 * Unified user model mirroring DB schema
 * Starts with session data (id, email), enriched from DB
 */
export interface AuthUser {
  // === From users table (Session provides id/email) ===
  id: string;
  email: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  emailVerified?: Date;
  created?: Date;
  updated?: Date;
  
  // === Nested: tenant_users (ONE per user in this app) ===
  tenantMembership?: TenantMembership;
  
  // === Nested: user_preferences ===
  preferences?: UserPreferences;
  
  // === Derived / Auth Flags ===
  isStaff?: boolean;
  role?: string;

  // === Alias for backward compatibility (Deprecated) ===
  displayName?: string;
  photoURL?: string;
  claims?: {
    role: string;
    permissions: string[];
    tenantId: string;
    companyId?: string;
  };
}


/**
 * Mirrors user_preferences table
 */
export interface UserPreferences {
  id?: string;
  user_id?: string;
  theme?: string;
  language?: string;
  timezone?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  weeklyReports?: boolean;
  marketingEmails?: boolean;
  created?: Date;
  updated?: Date;
}

export interface CoreUser {
  id: string;
  tenantId: string;
  teamId?: string;
  email: string;
  displayName: string;
  claims: {
    role: string;
    tenantId: string;
    permissions: string[];
  };
  profile: {
    timezone: string;
    language: string;
  };
}

export enum CoreUserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

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
 * Admin User Type
 * Staff user with cross-tenant access privileges.
 */
export const AdminUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['staff', 'admin', 'super_admin']),
  isPenguinMailsStaff: z.boolean(),
  tenantId: z.string().uuid().optional(),
  created: z.string(),
  updated: z.string(),
})

export type AdminUser = z.infer<typeof AdminUserSchema>

/**
 * Regular User Type (as seen by admins)
 * Standard platform user with tenant-specific access, with privacy masking.
 */
export const RegularUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string(), // Masked email for privacy
  name: z.string(),
  role: z.string(),
  isPenguinMailsStaff: z.boolean(),
  tenantCount: z.number().min(0),
  companyCount: z.number().min(0),
  created: z.string(),
})

export type RegularUser = z.infer<typeof RegularUserSchema>

/**
 * Validation helpers for admin types
 */
export function validateAdminUser(data: unknown): AdminUser {
  return AdminUserSchema.parse(data)
}

export function validateRegularUser(data: unknown): RegularUser {
  return RegularUserSchema.parse(data)
}

export function isUserSettings(obj: unknown): boolean {
  const settings = obj as Record<string, unknown>;
  return !!(settings &&
    typeof settings.id === 'string' &&
    typeof settings.userId === 'string' &&
    typeof settings.timezone === 'string' &&
    settings.companyInfo &&
    typeof (settings.companyInfo as Record<string, unknown>)?.name === 'string');
}

export function isValidTheme(theme: string): boolean {
  const validThemes = ["light", "dark", "system"];
  return validThemes.includes(theme);
}

export function isValidSidebarView(view: string): boolean {
  const validViews = ["expanded", "collapsed"];
  return validViews.includes(view);
}

export function isValidDateFormat(format: string): boolean {
  const validFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];
  return validFormats.includes(format);
}

export function filterUsersByTenant(users: User[], tenantId: string): User[] {
  return users.filter(user => user.tenantId === tenantId);
}



