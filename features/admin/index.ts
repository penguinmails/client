/**
 * Admin Feature - Public API
 * 
 * Provides centralized access to admin functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

// Types - Public type definitions
export type { 
  AdminSystemHealthData,
} from './api';

export type {
  AdminSystemHealthContextType,
} from './model';

export type {
  SystemHealthStatus 
} from './ui/components';

// API - Data fetching operations
export { 
  fetchAdminSystemHealth, 
  fetchBasicSystemHealth,
} from './api';

// Context - Public context providers
export { 
  AdminSystemHealthProvider, 
  useAdminSystemHealth,
} from './model';

// UI Components - Public components for external use
export { 
  AdminDashboard,
  AdminUserTable,
  SystemHealthProvider,
  useSystemHealth,
  AdminSystemHealthIndicator,
  AdminSystemHealthBadge,
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
} from './ui/components';
