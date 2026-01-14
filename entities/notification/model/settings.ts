import { NotificationType } from "./types";

// Notification Settings Types
export interface NotificationSettings {
  enabled: boolean;
  channels: NotificationChannel[];
  frequency: NotificationFrequency;
  quietHours: {
    start: string; // HH:mm format
    end: string; // HH:mm format
    timezone: string;
  };
  preferences: NotificationPreferences;
}

export interface NotificationChannel {
  type: "email" | "in_app" | "push" | "sms";
  enabled: boolean;
  recipient?: string;
}

export enum NotificationFrequency {
  IMMEDIATE = "immediate",
  DAILY = "daily",
  WEEKLY = "weekly",
  NEVER = "never",
}

export interface NotificationPreferences {
  excludeTypes: NotificationType[];
  excludeSources: string[]; // e.g., specific campaign IDs
  showDescription: boolean;
  showActions: boolean;
  maxRetentionDays: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  groupSimilar: boolean;
}
