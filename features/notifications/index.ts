/**
 * Notifications Feature - Public API
 * 
 * Provides centralized access to notification functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

// Actions - Server-side operations
export {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from './actions';

// Types - Public type definitions
export type {
  NotificationStatus,
} from './types';

// UI Components - Public components for external use
export {
  NotificationListItem,
  NotificationsPopover,
  NotificationsList,
} from './ui/components';
