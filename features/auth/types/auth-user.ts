import { Tenant } from "@/entities/tenant";
import { CompanyInfo } from "@/entities/company";
import { AuthUser } from "@/entities/user/model/types";

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
