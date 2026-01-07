import { Info } from "lucide-react";
import { NotificationType } from "@/types/notification";

/**
 * Theme and styling utilities
 * Part of the FSD shared layer
 */

export const notificationStyles = {
  container: 'p-4 rounded-lg border',
  success: 'bg-success/10 border-success/20 text-success dark:bg-success/20 dark:border-success/30',
  error: 'bg-destructive/10 border-destructive/20 text-destructive dark:bg-destructive/20 dark:border-destructive/30',
  warning: 'bg-warning/10 border-warning/20 text-warning dark:bg-warning/20 dark:border-warning/30',
  info: 'bg-info/10 border-info/20 text-info dark:bg-info/20 dark:border-info/30',
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
      return "bg-success/10 text-success border-success/20 hover:bg-success/20 dark:bg-success/20 dark:border-success/30 dark:hover:bg-success/30";
    case "not-interested":
      return "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20 dark:bg-destructive/20 dark:border-destructive/30 dark:hover:bg-destructive/30";
    case "maybe-later":
      return "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20 dark:bg-warning/20 dark:border-warning/30 dark:hover:bg-warning/30";
    case "replied":
      return "bg-info/10 text-info border-info/20 hover:bg-info/20 dark:bg-info/20 dark:border-info/30 dark:hover:bg-info/30";
    case "follow-up":
      return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30 dark:hover:bg-purple-500/30";
    case "hot-lead":
      return "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30 dark:hover:bg-orange-500/30";
    default:
      return "bg-muted/50 text-muted-foreground border-border hover:bg-muted dark:bg-muted/30 dark:hover:bg-muted/50";
  }
};
