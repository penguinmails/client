import { Tenant } from "./base";
import { CompanyInfo } from "@/types/company";

/**
 * Unified user model mirroring DB schema
 * Starts with session data (id, email), enriched from DB
 */
export interface AuthUser {
  // === From users table (Session provides id/email) ===
  id: string;
  email: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  emailVerified?: Date;
  created?: Date;
  updated?: Date;
  
  // === Nested: tenant_users (ONE per user in this app) ===
  tenantMembership?: TenantMembership;
  
  // === Nested: user_preferences ===
  preferences?: UserPreferences;
  
  // === Derived / Auth Flags ===
  isStaff?: boolean;
  role?: string;

  // === Alias for backward compatibility (Deprecated) ===
  displayName?: string;
  photoURL?: string;
  claims?: {
    role: string;
    permissions: string[];
    tenantId: string;
    companyId?: string;
  };
}

/**
 * Mirrors tenant_users table
 */
export interface TenantMembership {
  tenantId: string;
  user_id: string;
  roles: string[];  // text[] from DB
  email: string;
  created?: Date;
  updated?: Date;
  
  // Nested: tenants table
  tenant?: TenantInfo;
}

/**
 * Mirrors tenants table
 */
export interface TenantInfo {
  id: string;
  name: string;
  created?: Date;
  updated?: Date;
  compute_id?: string;
  
  // Not in tenants table, but useful in context
  companies?: CompanyInfo[];
}

/**
 * Mirrors user_preferences table
 */
export interface UserPreferences {
  id?: string;
  user_id?: string;
  theme?: string;
  language?: string;
  timezone?: string;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  weeklyReports?: boolean;
  marketingEmails?: boolean;
  created?: Date;
  updated?: Date;
}

/**
 * Granular loading states for the two concerns
 */
export interface AuthLoadingState {
  session: boolean;    // NileDB session check (fast)
  enrichment: boolean; // DB data fetch (background)
}

/**
 * Auth Context Value using the unified model
 */
export interface AuthContextValue {
  user: AuthUser | null;     // Unified user model
  isAuthenticated: boolean;
  loading: boolean;          // Session loading state (boolean for legacy)
  authLoading: AuthLoadingState; // Granular loading states
  error: Error | null;
  
  // Selection Context
  userTenants: Tenant[];
  userCompanies: CompanyInfo[];
  isStaff: boolean;
  selectedTenantId: string | null;
  selectedCompanyId: string | null;
  sessionExpired: boolean;
  
  // Selection Actions
  setSelectedTenant: (id: string | null) => void;
  setSelectedCompany: (id: string | null) => void;
  
  // Refresh Actions
  refreshUserData: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshTenants: () => Promise<void>;
  refreshCompanies: () => Promise<void>;
  clearError: () => void;
  
  // Auth Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
