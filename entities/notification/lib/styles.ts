import { Info } from "lucide-react";
import { NotificationType } from "../model/types";

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
