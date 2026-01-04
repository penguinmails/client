import { Info } from "lucide-react";
import { NotificationType } from "@/types/notification";

/**
 * Theme and styling utilities
 * Part of the FSD shared layer
 */

export const notificationStyles = {
  container: 'p-4 rounded-lg border',
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
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
 */
export const getTagColor = (tag: string) => {
  switch (tag) {
    case "interested":
      return "bg-green-50 text-green-700 border-green-200 hover:bg-green-100";
    case "not-interested":
      return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
    case "maybe-later":
      return "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100";
    case "replied":
      return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
    case "follow-up":
      return "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100";
    case "hot-lead":
      return "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100";
    default:
      return "bg-gray-50 dark:bg-muted/30 text-gray-700 dark:text-foreground border-gray-200 dark:border-border hover:bg-gray-100 dark:hover:bg-muted";
  }
};
