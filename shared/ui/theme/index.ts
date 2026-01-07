import { Info } from "lucide-react";
import { NotificationType } from "@/types/notification";

/**
 * Theme and styling utilities
 * Part of the FSD shared layer
 */

export const notificationStyles = {
  container: 'p-4 rounded-lg border',
  success: 'bg-success/10 border-success/20 text-success-text',
  error: 'bg-destructive/10 border-destructive/20 text-destructive-text',
  warning: 'bg-warning/10 border-warning/20 text-warning-text',
  info: 'bg-info/10 border-info/20 text-info-text',
  title: 'font-semibold text-sm',
  message: 'text-sm mt-1',
  icon: 'w-5 h-5 mr-2'
};

export const getNotificationStyles = (type: NotificationType) => {
  switch (type) {
    case NotificationType.INFO:
      return {
        icon: Info,
        color: "text-gray-600 dark:text-muted-foreground bg-gray-100 dark:bg-muted",
      };
    default:
      return {
        icon: Info,
        color: "bg-gray-100 dark:bg-muted text-gray-800 dark:text-foreground",
      };
  }
};

/**
 * Tag color utility for inbox conversations
 * Uses semantic tokens for consistent theming
 */
export const getTagColor = (tag: string) => {
  switch (tag) {
    case "interested":
      return "bg-success/10 text-success-text border-success/20 hover:bg-success/20";
    case "not-interested":
      return "bg-destructive/10 text-destructive-text border-destructive/20 hover:bg-destructive/20";
    case "maybe-later":
      return "bg-warning/10 text-warning-text border-warning/20 hover:bg-warning/20";
    case "replied":
      return "bg-info/10 text-info-text border-info/20 hover:bg-info/20";
    case "follow-up":
      return "bg-highlight/10 text-highlight-text border-highlight/20 hover:bg-highlight/20";
    case "hot-lead":
      return "bg-attention/10 text-attention-text border-attention/20 hover:bg-attention/20";
    default:
      return "bg-muted/50 text-muted-foreground border-border hover:bg-muted";
  }
};
