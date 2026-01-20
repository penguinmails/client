// Dashboard
export { AdminDashboard } from './dashboard/AdminDashboard';

// Users
export { AdminUserTable } from './users/AdminUserTable';
export { AdminUserFilters } from './users/AdminUserFilters';

// System
export { SystemHealthProvider, useSystemHealth } from './system/SystemHealthContext';
export { AdminSystemHealthIndicator, AdminSystemHealthBadge } from './system/AdminSystemHealthIndicator';
export type { SystemHealthStatus } from './system/SystemHealthContext';

// Layout
// NotificationsPopover moved to @/features/notifications/ui/components/NotificationsPopover

// Forms
export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from './forms/Form';
