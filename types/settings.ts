import { z } from "zod";

// ============================================================================
// CORE SERVER-SIDE TYPES
// ============================================================================

// Import BaseEntity from common types but extend for settings-specific needs
import type { BaseEntity as CommonBaseEntity } from "./common";

// Settings-specific base entity (extends common but uses Date objects instead of strings)
export interface BaseEntity extends Omit<CommonBaseEntity, "createdAt" | "updatedAt"> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Company Information
export interface CompanyInfo {
  name: string;
  industry: string;
  size: string;
  address: BillingAddress;
  vatId?: string;
}

// Billing Address
export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// User Settings (Server-side persistent data)
export interface UserSettings extends BaseEntity {
  userId: string;
  timezone: string;
  companyInfo: CompanyInfo;
}

// Notification Preferences
export interface NotificationPreferences extends BaseEntity {
  userId: string;
  newReplies: boolean;
  campaignUpdates: boolean;
  weeklyReports: boolean;
  domainAlerts: boolean;
  warmupCompletion: boolean;
}

// Subscription Plan (Flexible for compatibility)
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  contacts?: number;
  storage?: number;
  features?: string[];
  isMonthly?: boolean;
  // Legacy fields for backward compatibility
  description?: string;
  maxEmailAccounts?: number;
  maxCampaigns?: number;
  maxEmailsPerMonth?: number;
}

// Payment Method (Flexible for compatibility)
export interface PaymentMethod {
  type?: "visa" | "mastercard" | "amex" | "discover";
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  brand?: string;
  // Legacy fields for backward compatibility
  lastFour?: string;
  expiry?: string;
}

// Usage Metrics
export interface UsageMetrics {
  emailsSent: number;
  contactsReached: number;
  storageUsed: number;
  resetDate: string;
  emailAccountsUsed?: number;
  campaignsUsed?: number;
  emailsPerMonthUsed?: number;
}

// Billing Information
export interface BillingInfo extends BaseEntity {
  userId: string;
  currentPlan: SubscriptionPlan;
  paymentMethod: PaymentMethod;
  billingAddress: BillingAddress;
  usage: UsageMetrics;
  renewalDate: string;
  billingHistory: BillingHistoryItem[];
}

// Legacy BillingData type (for backward compatibility)
export interface BillingData {
  renewalDate: string;
  emailAccountsUsed: number;
  campaignsUsed: number;
  emailsPerMonthUsed: number;
  planDetails: {
    id: string;
    name: string;
    isMonthly: boolean;
    price: number;
    description: string;
    maxEmailAccounts: number;
    maxCampaigns: number;
    maxEmailsPerMonth: number;
  };
  paymentMethod: {
    lastFour: string;
    expiry: string;
    brand: string;
  };
  billingHistory: Array<{
    date: string;
    description: string;
    amount: string;
    method: string;
  }>;
}

// Billing History Item (Flexible for compatibility)
export interface BillingHistoryItem {
  id?: string;
  date: string;
  description: string;
  amount: string;
  method: string;
  status?: "paid" | "pending" | "failed";
}

// Team Member
export interface TeamMember extends BaseEntity {
  name: string;
  email: string;
  role: "Admin" | "Outreach Manager" | "Analyst" | "Member";
  status: "active" | "inactive" | "pending";
  lastActive: Date;
  permissions: string[];
  avatar?: string;
}

// ============================================================================
// CLIENT-SIDE PREFERENCES (localStorage)
// ============================================================================

// Client Preferences
export interface ClientPreferences {
  theme: "light" | "dark" | "system";
  sidebarView: "expanded" | "collapsed";
  language: string;
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
}

// Client Storage Keys
export const CLIENT_STORAGE_KEYS = {
  THEME: "penguinmails_theme",
  SIDEBAR_VIEW: "penguinmails_sidebar_view",
  LANGUAGE: "penguinmails_language",
  DATE_FORMAT: "penguinmails_date_format",
} as const;

// Stored Client Preferences (partial for localStorage)
export interface StoredClientPreferences {
  theme?: ClientPreferences["theme"];
  sidebarView?: ClientPreferences["sidebarView"];
  language?: string;
  dateFormat?: ClientPreferences["dateFormat"];
}

// ============================================================================
// SERVER ACTION RESPONSE TYPES
// ============================================================================

// Import and re-export ActionResult from common types
import type { ActionResult as CommonActionResult } from "./common";
export type ActionResult<T> = CommonActionResult<T>;

// Server Action Response Types
export type UserSettingsResponse = ActionResult<UserSettings>;
export type NotificationPreferencesResponse = ActionResult<NotificationPreferences>;
export type BillingInfoResponse = ActionResult<BillingInfo>;
export type TeamMembersResponse = ActionResult<TeamMember[]>;
export type TeamMemberResponse = ActionResult<TeamMember>;
export type DeleteTeamMemberResponse = ActionResult<void>;
export type SecuritySettingsResponse = ActionResult<SecuritySettingsEntity>;
export type TrackingSettingsResponse = ActionResult<TrackingSettings>;
export type ComplianceSettingsResponse = ActionResult<ComplianceSettings>;
export type AppearanceSettingsResponse = ActionResult<AppearanceSettingsEntity>;

// ============================================================================
// FORM VALIDATION SCHEMAS
// ============================================================================

// Notification Schema
export const notificationSchema = z.object({
  newReplies: z.boolean(),
  campaignUpdates: z.boolean(),
  weeklyReports: z.boolean(),
  domainAlerts: z.boolean(),
  warmupCompletion: z.boolean(),
});

export type NotificationFormValues = z.infer<typeof notificationSchema>;

// User Settings Schema
export const userSettingsSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
  companyInfo: z.object({
    name: z.string().min(1, "Company name is required"),
    industry: z.string().min(1, "Industry is required"),
    size: z.string().min(1, "Company size is required"),
    address: z.object({
      street: z.string().min(1, "Street address is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      zipCode: z.string().min(1, "ZIP code is required"),
      country: z.string().min(1, "Country is required"),
    }),
    vatId: z.string().optional(),
  }),
});

export type UserSettingsFormValues = z.infer<typeof userSettingsSchema>;

// Billing Schema
export const billingAddressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),
});

export const paymentMethodSchema = z.object({
  type: z.enum(["visa", "mastercard", "amex", "discover"]),
  last4: z.string().length(4, "Last 4 digits required"),
  expiryMonth: z.number().min(1).max(12),
  expiryYear: z.number().min(new Date().getFullYear()),
});

export const billingInfoSchema = z.object({
  billingAddress: billingAddressSchema,
  paymentMethod: paymentMethodSchema,
});

export type BillingInfoFormValues = z.infer<typeof billingInfoSchema>;

// Team Member Schema
export const teamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  role: z.enum(["Admin", "Outreach Manager", "Analyst", "Member"]),
  permissions: z.array(z.string()).default([]),
});

export type TeamMemberFormValues = z.infer<typeof teamMemberSchema>;

// Client Preferences Schema
export const clientPreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  sidebarView: z.enum(["expanded", "collapsed"]),
  language: z.string().min(1, "Language is required"),
  dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]),
});

export type ClientPreferencesFormValues = z.infer<typeof clientPreferencesSchema>;

// ============================================================================
// SECURITY TYPES
// ============================================================================

// Security Configuration Types
export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordFormValues = z.infer<typeof passwordSchema>;

export interface PasswordStrength {
  level: "weak" | "medium" | "strong" | "very-strong";
  text: string;
  color: string;
  percentage: number;
}

// Two-Factor Authentication Types
export const twoFactorSchema = z.object({
  enabled: z.boolean(),
  method: z.enum(["sms", "app"]).optional(),
  secret: z.string().optional(),
  backupCodes: z.array(z.string()).optional(),
});

export type TwoFactorFormValues = z.infer<typeof twoFactorSchema>;

// Security Settings (Full entity)
export interface SecuritySettingsEntity extends BaseEntity {
  userId: string;
  passwordStrengthIndicator: boolean;
  sessionTimeout: number;
  loginAlerts: boolean;
  twoFactor: TwoFactorFormValues;
  accountBackupCodes: string[];
}

// Security Settings (Legacy - for mock compatibility)
export interface SecuritySettings {
  passwordStrengthIndicator?: boolean;
  sessionTimeout: number;
  loginAlerts: boolean;
  twoFactor: TwoFactorFormValues;
  accountBackupCodes: string[];
}

// Security Events
export interface SecurityEvent extends BaseEntity {
  userId: string;
  type: "login" | "password_change" | "two_factor_disabled" | "account_locked";
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
}

// Security Recommendations
export interface SecurityRecommendation {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  resolved: boolean;
  actionUrl?: string;
}

// ============================================================================
// TRACKING AND COMPLIANCE TYPES
// ============================================================================

// Tracking Preference Types
export const trackingSchema = z.object({
  openTracking: z.boolean(),
  clickTracking: z.boolean(),
  customDomain: z.string().optional(),
});

export type TrackingFormValues = z.infer<typeof trackingSchema>;

// Tracking Settings
export interface TrackingSettings extends BaseEntity {
  userId: string;
  openTracking: boolean;
  clickTracking: boolean;
  customDomain?: string;
  unsubscribeLink: boolean;
  complianceFooter: string;
}

// Compliance Settings
export interface ComplianceSettings extends BaseEntity {
  userId: string;
  gdprCompliant: boolean;
  canSpamCompliant: boolean;
  unsubscribeRequired: boolean;
  companyAddress: BillingAddress;
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;
}

// ============================================================================
// APPEARANCE AND UI TYPES
// ============================================================================

// User Preference Types (Extended)
export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  dateFormat: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
  emailFrequency: "immediate" | "daily" | "weekly" | "never";
  dashboardLayout: "compact" | "comfortable";
  chartColors: "default" | "accessibility" | "custom";
}

// Appearance Settings (Full entity)
export interface AppearanceSettingsEntity extends BaseEntity {
  userId: string;
  theme: UserPreferences["theme"];
  primaryColor?: string;
  sidebarCollapsed: boolean;
  itemsPerPage: number;
  compactMode: boolean;
}

// Appearance Settings (Legacy - for mock compatibility)
export interface AppearanceSettings {
  theme: UserPreferences["theme"];
  primaryColor?: string;
  sidebarCollapsed: boolean;
  itemsPerPage: number;
  compactMode?: boolean;
}

// ============================================================================
// CONSOLIDATED SETTINGS TYPES
// ============================================================================

// General Settings (Profile + Preferences)
export interface GeneralSettings {
  profile: {
    name: string;
    email: string;
    company?: string;
  };
  preferences: UserPreferences;
  appearance: AppearanceSettings;
}

// Billing and Plan Settings
export interface BillingAndPlanSettings {
  currentPlan: SubscriptionPlan;
  usage: {
    emailAccounts: number;
    campaigns: number;
    emailsPerMonth: number;
  };
  billingInfo: {
    paymentMethod: PaymentMethod;
    billingHistory: BillingHistoryItem[];
    renewalDate: string;
    billingAddress?: BillingAddress;
  };
}

// All Settings Combined
export interface AllSettings {
  user: UserSettings;
  notifications: NotificationPreferences;
  billing: BillingInfo;
  security: SecuritySettingsEntity;
  tracking: TrackingSettings;
  compliance: ComplianceSettings;
  appearance: AppearanceSettingsEntity;
  client: ClientPreferences;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

// Form Props Types
export interface NotificationToggleProps {
  show: boolean;
  onToggle: () => void;
}

export interface PasswordToggleProps {
  show: boolean;
  onToggle: () => void;
}

export interface PasswordStrengthIndicatorProps {
  password: string;
}

// Legacy Notification Settings Props (for backward compatibility)
export interface NotificationSettingsProps {
  email: {
    campaignCompletions: boolean;
    newReplies: boolean;
    weeklyReports: boolean;
    systemAnnouncements: boolean;
  };
  inApp: {
    realTimeCampaignAlerts: boolean;
    emailAccountAlerts: boolean;
  };
}

// Modern Settings Component Props
export interface NotificationSettingsComponentProps {
  preferences: NotificationPreferences;
  onUpdate: (preferences: Partial<NotificationPreferences>) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export interface BillingSettingsProps {
  billing: BillingInfo;
  onUpdate: (billing: Partial<BillingInfo>) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export interface TeamSettingsProps {
  members: TeamMember[];
  onAddMember: (member: Omit<TeamMember, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onUpdateMember: (id: string, updates: Partial<TeamMember>) => Promise<void>;
  onRemoveMember: (id: string) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export interface UserSettingsProps {
  settings: UserSettings;
  onUpdate: (settings: Partial<UserSettings>) => Promise<void>;
  loading?: boolean;
  error?: string;
}

// ============================================================================
// NAVIGATION AND UI TYPES
// ============================================================================

// Settings Page Types
export type SettingsTab =
  | "profile"
  | "security"
  | "billing"
  | "notifications"
  | "team"
  | "appearance"
  | "tracking"
  | "compliance";

// Settings Navigation
export interface SettingsNavItem {
  id: SettingsTab;
  label: string;
  icon?: string;
  href: string;
  description?: string;
}

// ============================================================================
// VALIDATION AND ERROR TYPES
// ============================================================================

// Legacy Settings Validation Types (for backward compatibility)
export interface SettingsValidationError {
  field: string;
  message: string;
  code?: string;
}

// API Error Types
export interface SettingsApiError {
  message: string;
  code: string;
  field?: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

// Type guard for ActionResult success
export function isActionSuccess<T>(result: ActionResult<T>): result is { success: true; data: T } {
  return result.success === true;
}

// Type guard for ActionResult error
export function isActionError<T>(result: ActionResult<T>): result is { success: false; error: string; code?: string } {
  return result.success === false;
}

// Type guard for UserSettings
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function isUserSettings(obj: any): obj is UserSettings {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.userId === "string" &&
    typeof obj.timezone === "string" &&
    obj.companyInfo &&
    typeof obj.companyInfo === "object" &&
    obj.createdAt instanceof Date &&
    obj.updatedAt instanceof Date
  );
}

// Type guard for NotificationPreferences
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function isNotificationPreferences(obj: any): obj is NotificationPreferences {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.userId === "string" &&
    typeof obj.newReplies === "boolean" &&
    typeof obj.campaignUpdates === "boolean" &&
    typeof obj.weeklyReports === "boolean" &&
    typeof obj.domainAlerts === "boolean" &&
    typeof obj.warmupCompletion === "boolean"
  );
}

// Type guard for BillingInfo
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function isBillingInfo(obj: any): obj is BillingInfo {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.userId === "string" &&
    obj.currentPlan &&
    obj.paymentMethod &&
    obj.billingAddress &&
    obj.usage &&
    typeof obj.renewalDate === "string"
  );
}

// Type guard for TeamMember
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function isTeamMember(obj: any): obj is TeamMember {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.email === "string" &&
    typeof obj.role === "string" &&
    ["active", "inactive", "pending"].includes(obj.status) &&
    obj.lastActive instanceof Date &&
    Array.isArray(obj.permissions)
  );
}

// Type guard for ClientPreferences
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function isClientPreferences(obj: any): obj is ClientPreferences {
  return (
    obj &&
    typeof obj === "object" &&
    ["light", "dark", "system"].includes(obj.theme) &&
    ["expanded", "collapsed"].includes(obj.sidebarView) &&
    typeof obj.language === "string" &&
    ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].includes(obj.dateFormat)
  );
}

// Type guard for CompanyInfo
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function isCompanyInfo(obj: any): obj is CompanyInfo {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.name === "string" &&
    typeof obj.industry === "string" &&
    typeof obj.size === "string" &&
    obj.address &&
    typeof obj.address === "object"
  );
}

// Type guard for BillingAddress
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function isBillingAddress(obj: any): obj is BillingAddress {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.street === "string" &&
    typeof obj.city === "string" &&
    typeof obj.state === "string" &&
    typeof obj.zipCode === "string" &&
    typeof obj.country === "string"
  );
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

// Validate timezone string
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate URL format
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Validate enum values
export function isValidTheme(theme: string): theme is ClientPreferences["theme"] {
  return ["light", "dark", "system"].includes(theme);
}

export function isValidSidebarView(view: string): view is ClientPreferences["sidebarView"] {
  return ["expanded", "collapsed"].includes(view);
}

export function isValidDateFormat(format: string): format is ClientPreferences["dateFormat"] {
  return ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"].includes(format);
}

export function isValidTeamMemberRole(role: string): role is TeamMember["role"] {
  return ["Admin", "Outreach Manager", "Analyst", "Member"].includes(role);
}

export function isValidTeamMemberStatus(status: string): status is TeamMember["status"] {
  return ["active", "inactive", "pending"].includes(status);
}

// Validate settings data
export function validateUserSettings(settings: Partial<UserSettings>): SettingsValidationResult {
  const errors: FieldValidationError[] = [];

  if (settings.timezone && !isValidTimezone(settings.timezone)) {
    errors.push({
      field: SETTINGS_FIELDS.USER.TIMEZONE,
      message: "Invalid timezone",
      code: "INVALID_TIMEZONE",
    });
  }

  if (settings.companyInfo) {
    if (!settings.companyInfo.name || settings.companyInfo.name.trim().length === 0) {
      errors.push({
        field: SETTINGS_FIELDS.USER.COMPANY_NAME,
        message: "Company name is required",
        code: "REQUIRED_FIELD",
      });
    }

    if (!settings.companyInfo.industry || settings.companyInfo.industry.trim().length === 0) {
      errors.push({
        field: SETTINGS_FIELDS.USER.COMPANY_INDUSTRY,
        message: "Industry is required",
        code: "REQUIRED_FIELD",
      });
    }

    if (!settings.companyInfo.size || settings.companyInfo.size.trim().length === 0) {
      errors.push({
        field: SETTINGS_FIELDS.USER.COMPANY_SIZE,
        message: "Company size is required",
        code: "REQUIRED_FIELD",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateNotificationPreferences(prefs: Partial<NotificationPreferences>): SettingsValidationResult {
  const errors: FieldValidationError[] = [];

  // Notification preferences are all boolean, so basic type checking is sufficient
  const booleanFields = [
    { key: "newReplies", field: SETTINGS_FIELDS.NOTIFICATIONS.NEW_REPLIES },
    { key: "campaignUpdates", field: SETTINGS_FIELDS.NOTIFICATIONS.CAMPAIGN_UPDATES },
    { key: "weeklyReports", field: SETTINGS_FIELDS.NOTIFICATIONS.WEEKLY_REPORTS },
    { key: "domainAlerts", field: SETTINGS_FIELDS.NOTIFICATIONS.DOMAIN_ALERTS },
    { key: "warmupCompletion", field: SETTINGS_FIELDS.NOTIFICATIONS.WARMUP_COMPLETION },
  ];

  for (const { key, field } of booleanFields) {
    const value = (prefs as Record<string, unknown>)[key];
    if (value !== undefined && typeof value !== "boolean") {
      errors.push({
        field,
        message: `${key} must be a boolean`,
        code: "INVALID_FORMAT",
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateClientPreferences(prefs: Partial<ClientPreferences>): SettingsValidationResult {
  const errors: FieldValidationError[] = [];

  if (prefs.theme && !isValidTheme(prefs.theme)) {
    errors.push({
      field: SETTINGS_FIELDS.CLIENT.THEME,
      message: "Invalid theme value",
      code: "INVALID_ENUM_VALUE",
    });
  }

  if (prefs.sidebarView && !isValidSidebarView(prefs.sidebarView)) {
    errors.push({
      field: SETTINGS_FIELDS.CLIENT.SIDEBAR_VIEW,
      message: "Invalid sidebar view value",
      code: "INVALID_ENUM_VALUE",
    });
  }

  if (prefs.dateFormat && !isValidDateFormat(prefs.dateFormat)) {
    errors.push({
      field: SETTINGS_FIELDS.CLIENT.DATE_FORMAT,
      message: "Invalid date format value",
      code: "INVALID_ENUM_VALUE",
    });
  }

  if (prefs.language !== undefined && (!prefs.language || prefs.language.trim().length === 0)) {
    errors.push({
      field: SETTINGS_FIELDS.CLIENT.LANGUAGE,
      message: "Language is required",
      code: "REQUIRED_FIELD",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateTeamMember(member: Partial<TeamMember>): SettingsValidationResult {
  const errors: FieldValidationError[] = [];

  if (member.name !== undefined && (!member.name || member.name.trim().length === 0)) {
    errors.push({
      field: "name",
      message: "Name is required",
      code: "REQUIRED_FIELD",
    });
  }

  if (member.email && !isValidEmail(member.email)) {
    errors.push({
      field: "email",
      message: "Invalid email format",
      code: "INVALID_EMAIL",
    });
  }

  if (member.role && !isValidTeamMemberRole(member.role)) {
    errors.push({
      field: "role",
      message: "Invalid role value",
      code: "INVALID_ENUM_VALUE",
    });
  }

  if (member.status && !isValidTeamMemberStatus(member.status)) {
    errors.push({
      field: "status",
      message: "Invalid status value",
      code: "INVALID_ENUM_VALUE",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Deep partial type for nested updates
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Partial update types for server actions
export type UserSettingsUpdate = Partial<Omit<UserSettings, "id" | "userId" | "createdAt" | "updatedAt">>;
export type NotificationPreferencesUpdate = Partial<Omit<NotificationPreferences, "id" | "userId" | "createdAt" | "updatedAt">>;
export type BillingInfoUpdate = Partial<Omit<BillingInfo, "id" | "userId" | "createdAt" | "updatedAt">>;
export type TeamMemberUpdate = Partial<Omit<TeamMember, "id" | "createdAt" | "updatedAt">>;

// Create types for new entities
export type CreateUserSettings = Omit<UserSettings, "id" | "createdAt" | "updatedAt">;
export type CreateNotificationPreferences = Omit<NotificationPreferences, "id" | "createdAt" | "updatedAt">;
export type CreateBillingInfo = Omit<BillingInfo, "id" | "createdAt" | "updatedAt">;
export type CreateTeamMember = Omit<TeamMember, "id" | "createdAt" | "updatedAt">;

// Settings field keys for validation
export const SETTINGS_FIELDS = {
  USER: {
    TIMEZONE: "timezone",
    COMPANY_NAME: "companyInfo.name",
    COMPANY_INDUSTRY: "companyInfo.industry",
    COMPANY_SIZE: "companyInfo.size",
    COMPANY_VAT_ID: "companyInfo.vatId",
  },
  NOTIFICATIONS: {
    NEW_REPLIES: "newReplies",
    CAMPAIGN_UPDATES: "campaignUpdates",
    WEEKLY_REPORTS: "weeklyReports",
    DOMAIN_ALERTS: "domainAlerts",
    WARMUP_COMPLETION: "warmupCompletion",
  },
  CLIENT: {
    THEME: "theme",
    SIDEBAR_VIEW: "sidebarView",
    LANGUAGE: "language",
    DATE_FORMAT: "dateFormat",
  },
} as const;

// Settings validation error codes
export const SETTINGS_ERROR_CODES = {
  REQUIRED_FIELD: "REQUIRED_FIELD",
  INVALID_FORMAT: "INVALID_FORMAT",
  INVALID_ENUM_VALUE: "INVALID_ENUM_VALUE",
  INVALID_EMAIL: "INVALID_EMAIL",
  INVALID_URL: "INVALID_URL",
  INVALID_DATE: "INVALID_DATE",
  INVALID_TIMEZONE: "INVALID_TIMEZONE",
  DUPLICATE_VALUE: "DUPLICATE_VALUE",
  PERMISSION_DENIED: "PERMISSION_DENIED",
} as const;

// Settings validation result with field-specific errors
export interface FieldValidationError {
  field: string;
  message: string;
  code: keyof typeof SETTINGS_ERROR_CODES;
}

export interface SettingsValidationResult {
  isValid: boolean;
  errors: FieldValidationError[];
  warnings?: FieldValidationError[];
}

// ============================================================================
// SERVER ACTION FUNCTION TYPES
// ============================================================================

// Settings Actions Function Types
export type GetUserSettingsAction = (userId: string) => Promise<UserSettingsResponse>;
export type UpdateUserSettingsAction = (userId: string, settings: UserSettingsUpdate) => Promise<UserSettingsResponse>;

// Notification Actions Function Types
export type GetNotificationPreferencesAction = (userId: string) => Promise<NotificationPreferencesResponse>;
export type UpdateNotificationPreferencesAction = (userId: string, prefs: NotificationPreferencesUpdate) => Promise<NotificationPreferencesResponse>;

// Billing Actions Function Types
export type GetBillingInfoAction = (userId: string) => Promise<BillingInfoResponse>;
export type UpdateBillingInfoAction = (userId: string, billing: BillingInfoUpdate) => Promise<BillingInfoResponse>;

// Team Actions Function Types
export type GetTeamMembersAction = (userId: string) => Promise<TeamMembersResponse>;
export type AddTeamMemberAction = (userId: string, member: CreateTeamMember) => Promise<TeamMemberResponse>;
export type UpdateTeamMemberAction = (userId: string, memberId: string, updates: TeamMemberUpdate) => Promise<TeamMemberResponse>;
export type RemoveTeamMemberAction = (userId: string, memberId: string) => Promise<DeleteTeamMemberResponse>;

// Security Actions Function Types
export type GetSecuritySettingsAction = (userId: string) => Promise<SecuritySettingsResponse>;
export type UpdateSecuritySettingsAction = (userId: string, settings: Partial<SecuritySettings>) => Promise<SecuritySettingsResponse>;

// Tracking Actions Function Types
export type GetTrackingSettingsAction = (userId: string) => Promise<TrackingSettingsResponse>;
export type UpdateTrackingSettingsAction = (userId: string, settings: Partial<TrackingSettings>) => Promise<TrackingSettingsResponse>;

// Compliance Actions Function Types
export type GetComplianceSettingsAction = (userId: string) => Promise<ComplianceSettingsResponse>;
export type UpdateComplianceSettingsAction = (userId: string, settings: Partial<ComplianceSettings>) => Promise<ComplianceSettingsResponse>;

// Appearance Actions Function Types
export type GetAppearanceSettingsAction = (userId: string) => Promise<AppearanceSettingsResponse>;
export type UpdateAppearanceSettingsAction = (userId: string, settings: Partial<AppearanceSettings>) => Promise<AppearanceSettingsResponse>;

// Settings loading states
export interface SettingsLoadingState {
  user: boolean;
  notifications: boolean;
  billing: boolean;
  team: boolean;
  security: boolean;
  tracking: boolean;
  compliance: boolean;
  appearance: boolean;
}

// Settings error states
export interface SettingsErrorState {
  user: string | null;
  notifications: string | null;
  billing: string | null;
  team: string | null;
  security: string | null;
  tracking: string | null;
  compliance: string | null;
  appearance: string | null;
}

// ============================================================================
// HOOK TYPES FOR SETTINGS MANAGEMENT
// ============================================================================

// Hook return type for settings data management
export interface UseSettingsReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  update: (updates: Partial<T>) => Promise<void>;
}

// Hook return type for settings list management (like team members)
export interface UseSettingsListReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  add: (item: Omit<T, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  update: (id: string, updates: Partial<T>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

// Settings context type
export interface SettingsContextType {
  user: UseSettingsReturn<UserSettings>;
  notifications: UseSettingsReturn<NotificationPreferences>;
  billing: UseSettingsReturn<BillingInfo>;
  team: UseSettingsListReturn<TeamMember>;
  security: UseSettingsReturn<SecuritySettingsEntity>;
  tracking: UseSettingsReturn<TrackingSettings>;
  compliance: UseSettingsReturn<ComplianceSettings>;
  appearance: UseSettingsReturn<AppearanceSettingsEntity>;
  client: {
    preferences: ClientPreferences;
    updatePreferences: (prefs: Partial<ClientPreferences>) => void;
  };
}
