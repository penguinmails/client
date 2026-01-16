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
