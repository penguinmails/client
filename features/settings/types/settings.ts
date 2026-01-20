export interface SimpleNotificationPreferences {
  newReplies: boolean;
  campaignUpdates: boolean;
  weeklyReports: boolean;
  domainAlerts: boolean;
  warmupCompletion: boolean;
  updatedAt: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  ipWhitelist: string[];
  apiKeyRotationDays: number;
}

export interface GeneralSettings {
  companyName: string;
  timezone: string;
  dateFormat: string;
  language: string;
}

export interface BillingSettings {
  plan: string;
  billingCycle: 'monthly' | 'yearly';
  autoRenew: boolean;
  invoiceEmail: string;
}