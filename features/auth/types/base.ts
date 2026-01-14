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
