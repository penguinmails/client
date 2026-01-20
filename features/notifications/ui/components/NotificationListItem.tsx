import { notificationStyles } from "@/lib/theme/ui";
import { Notification } from "@/types/notification";
import { Clock, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

function NotificationListItem({
  notification,
}: {
  notification: Notification;
}) {
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return { icon: 'CheckCircle', color: notificationStyles.success };
      case 'error':
        return { icon: 'XCircle', color: notificationStyles.error };
      case 'warning':
        return { icon: 'AlertTriangle', color: notificationStyles.warning };
      case 'info':
      default:
        return { icon: 'Info', color: notificationStyles.info };
    }
  };
  
  const { icon: iconName, color } = getNotificationStyle(notification.type);
  const markAsRead = (_id: string | number) => {
    // Logic to mark notification as read
  };
  return (
    <div
      key={notification.id}
      className={`p-4 hover:bg-gray-50 dark:hover:bg-muted/50 transition-colors cursor-pointer ${
        !notification.isRead ? "bg-blue-50 dark:bg-blue-950/30" : ""
      }`}
      onClick={() => markAsRead(notification.id)}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-lg ${color} flex-shrink-0`}>
          {iconName === 'CheckCircle' && <CheckCircle className="size-4" />}
          {iconName === 'XCircle' && <XCircle className="size-4" />}
          {iconName === 'AlertTriangle' && <AlertTriangle className="size-4" />}
          {iconName === 'Info' && <Info className="size-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4
              className={`text-sm font-medium text-gray-900 dark:text-foreground ${
                !notification.isRead ? "font-semibold" : ""
              }`}
            >
              {notification.title}
            </h4>
            {!notification.isRead && (
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>
              {typeof notification.time === "string"
                ? notification.time
                : notification.time.toLocaleString()}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
export default NotificationListItem;
