// Mock settings validation functions for testing
export interface NotificationPreferences {
  id?: string;
  userId?: string;
  newReplies?: boolean;
  campaignUpdates?: boolean;
  weeklyReports?: boolean;
  domainAlerts?: boolean;
  warmupCompletion?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClientPreferences {
  theme?: string;
  sidebarView?: string;
  language?: string;
  dateFormat?: string;
}

export interface TeamMember {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ActionResult<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface CompanyInfo {
  name: string;
  industry: string;
  size: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  vatId?: string;
}

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Type guard functions
export function isActionSuccess<T>(result: ActionResult<T>): result is ActionResult<T> & { success: true; data: T } {
  return result.success === true;
}

export function isActionError<T>(result: ActionResult<T>): result is ActionResult<T> & { success: false; error: string } {
  return result.success === false;
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

export function isNotificationPreferences(obj: unknown): boolean {
  const prefs = obj as Record<string, unknown>;
  // All properties should be boolean if they exist
  for (const [key, value] of Object.entries(prefs)) {
    if (key !== 'id' && key !== 'userId' && key !== 'createdAt' && key !== 'updatedAt') {
      if (value !== undefined && typeof value !== 'boolean') {
        return false;
      }
    }
  }
  return true;
}

export function isClientPreferences(obj: unknown): boolean {
  const prefs = obj as Record<string, unknown>;
  const validThemes = ["light", "dark", "system"];
  const validSidebarViews = ["expanded", "collapsed"];
  const validDateFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];
  
  return !!(prefs &&
    (prefs.theme === undefined || (typeof prefs.theme === 'string' && validThemes.includes(prefs.theme))) &&
    (prefs.sidebarView === undefined || (typeof prefs.sidebarView === 'string' && validSidebarViews.includes(prefs.sidebarView))) &&
    (prefs.language === undefined || typeof prefs.language === 'string') &&
    (prefs.dateFormat === undefined || (typeof prefs.dateFormat === 'string' && validDateFormats.includes(prefs.dateFormat))));
}

export function isCompanyInfo(obj: unknown): boolean {
  const info = obj as Record<string, unknown>;
  return !!(info &&
    typeof info.name === 'string' &&
    typeof info.industry === 'string' &&
    typeof info.size === 'string' &&
    info.address &&
    typeof (info.address as Record<string, unknown>)?.street === 'string');
}

export function isBillingAddress(obj: unknown): boolean {
  const addr = obj as Record<string, unknown>;
  return !!(addr &&
    typeof addr.street === 'string' &&
    typeof addr.city === 'string' &&
    typeof addr.state === 'string' &&
    typeof addr.zipCode === 'string' &&
    typeof addr.country === 'string');
}

export function validateUserSettings(_settings: unknown): ValidationResult {
  return { isValid: true, errors: [] };
}

export function validateNotificationPreferences(_prefs: unknown): ValidationResult {
  return { isValid: true, errors: [] };
}

export function validateClientPreferences(_prefs: unknown): ValidationResult {
  return { isValid: true, errors: [] };
}

export function validateTeamMember(_member: unknown): ValidationResult {
  return { isValid: true, errors: [] };
}

export function isValidTimezone(timezone: string): boolean {
  const validTimezones = ["America/New_York", "Europe/London", "UTC"];
  return validTimezones.includes(timezone);
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
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

export function isValidTeamMemberRole(role: string): boolean {
  const validRoles = ["Admin", "Member"];
  return validRoles.includes(role);
}

export function isValidTeamMemberStatus(status: string): boolean {
  const validStatuses = ["active", "inactive", "pending"];
  return validStatuses.includes(status);
}