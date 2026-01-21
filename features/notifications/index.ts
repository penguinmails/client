/**
 * Notifications Feature - Public API
 * 
 * Provides centralized access to notification functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

// Types - Public type definitions
export type {
  Notification,
  NotificationType,
  NotificationStatus,
} from './types';

// Actions - Server-side operations
export {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from './actions';

// UI Components - Public components for external use
export {
  NotificationListItem,
  NotificationsPopover,
  NotificationsList,
} from './ui/components';
