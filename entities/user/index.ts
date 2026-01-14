// Enums (Runtime values)
export { UserRole, Permission, CoreUserRole } from './model/types';

// Interfaces & Inferred Types (Type-only)
export type { 
  AuthUser, 
  UserPreferences, 
  AdminUser, 
  RegularUser,
  CoreUser
} from './model/types';

// Zod Schemas (Runtime values used for validation)
export { 
  AdminUserSchema, 
  RegularUserSchema 
} from './model/types';

// Validation Helpers (Runtime functions)
export { 
  validateAdminUser, 
  validateRegularUser,
  isUserSettings,
  isValidTheme,
  isValidSidebarView,
  isValidDateFormat
} from './model/types';
