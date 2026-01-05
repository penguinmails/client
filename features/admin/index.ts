/**
 * Admin Feature Public API
 * 
 * Main exports for the admin feature following FSD structure
 */

// API Layer
export { 
  fetchAdminSystemHealth, 
  fetchBasicSystemHealth,
  type AdminSystemHealthData 
} from './api';

// Model Layer
export { 
  AdminSystemHealthProvider, 
  useAdminSystemHealth,
  type AdminSystemHealthContextType 
} from './model';

// UI Layer
export { 
  AdminDashboard,
  AdminUserTable,
  SystemHealthProvider,
  useSystemHealth,
  AdminSystemHealthIndicator,
  AdminSystemHealthBadge,
  // NotificationsPopover moved to @/features/notifications/ui/components/NotificationsPopover
  HelpSection,
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  type SystemHealthStatus
} from './ui/components';