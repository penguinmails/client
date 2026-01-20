// ============================================================================
// CORE BASE TYPES
// ============================================================================

// Minimal interfaces to avoid circular dependencies

// Settings-specific base entity (uses Date objects instead of strings)
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// ActionResult interface
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Company Profile (Settings-specific)
export interface CompanyProfile {
  name: string;
  industry: string;
  size: string;
  address: BillingAddress;
  vatId?: string;
}

// Minimal BillingAddress interface to avoid circular dependency
interface BillingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export type { BillingAddress };


// Settings field keys for validation
export const SETTINGS_FIELDS = {
  USER: {
    TIMEZONE: "timezone",
    COMPANY_NAME: "companyProfile.name",
    COMPANY_INDUSTRY: "companyProfile.industry",
    COMPANY_SIZE: "companyProfile.size",
    COMPANY_VAT_ID: "companyProfile.vatId",
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

// Deep partial type for nested updates
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
