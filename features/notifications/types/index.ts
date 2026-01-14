import { NotificationFilters, NotificationSort } from "@/entities/notification/model/types";
import { ValidationResult } from "@/shared/lib/validation";

// Notification States and Status
export type NotificationStatus = "unread" | "read" | "dismissed" | "archived";

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  totalCount: number;
  lastReadAt?: Date;
}

// Notification Context Types
export interface NotificationContext {
  userId: string;
  filters: NotificationFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  sorting: NotificationSort;
}

export function validateNotificationPreferences(_prefs: unknown): ValidationResult {
  return { isValid: true, errors: [] };
}
