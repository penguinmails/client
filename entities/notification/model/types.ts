// Core Notification Types
export type Notification = {
  // Id can be either string or number for backward compatibility
  id: string | number;
  type: NotificationType;
  title: string;
  message: string;
  // Time can be either Date or string for backward compatibility
  time: Date | string;
  isRead: boolean;

  // New optional fields for enhanced functionality
  variant?: NotificationVariant;
  description?: string;
  dismissed?: boolean;
  actions?: NotificationAction[];
  metadata?: Record<string, unknown>;
  userId?: string;
  createdAt?: Date;
  expiresAt?: Date;
};

export enum NotificationType {
  // Core business notifications
  REPLY = "reply",
  CAMPAIGN = "campaign",
  WARNING = "warning",
  SUCCESS = "success",
  INFO = "info",

  // Alert types
  EMAIL_BOUNCE = "email_bounce",
  DOMAIN_ISSUE = "domain_issue",
  SECURITY_ALERT = "security_alert",
  SYSTEM_MAINTENANCE = "system_maintenance",

  // Campaign related
  CAMPAIGN_STARTED = "campaign_started",
  CAMPAIGN_COMPLETED = "campaign_completed",
  CAMPAIGN_FAILED = "campaign_failed",

  // User interaction
  LEAD_RESPONDED = "lead_responded",
  TASK_COMPLETED = "task_completed",
  QUOTA_EXCEEDED = "quota_exceeded",
}

export enum NotificationVariant {
  DEFAULT = "default",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
  INFO = "info",
}

export interface NotificationAction {
  label: string;
  action: string;
  variant?: "primary" | "secondary" | "outline";
  onClick?: () => void;
}

// Notification Template Types
export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  variant: NotificationVariant;
  titleTemplate: string;
  messageTemplate: string;
  descriptionTemplate?: string;
  defaultActions?: NotificationAction[];
  category: NotificationCategory;
}

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

export enum NotificationCategory {
  SYSTEM = "system",
  CAMPAIGN = "campaign",
  CONVERSATION = "conversation",
  ANALYTICS = "analytics",
  ACCOUNT = "account",
  SECURITY = "security",
}

// Legacy compatibility types (for migration)
export interface LegacyNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

/**
 * Filter shape defined in the Entity so that API services 
 * and Widgets can use it without importing the whole Feature.
 */
export interface NotificationFilters {
  type?: NotificationType;
  variant?: NotificationVariant;
  status?: "unread" | "read" | "dismissed" | "archived";
  dateRange?: {
    start: Date;
    end: Date;
  };
  source?: string;
}

export type NotificationSort = {
  field: "createdAt" | "type" | "variant" | "isRead";
  direction: "asc" | "desc";
};

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


