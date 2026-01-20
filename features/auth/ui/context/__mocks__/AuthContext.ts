// Mock for AuthContext
import { useAuth as useAuthOriginal } from '@features/auth/hooks/use-auth';


// Mock implementation
export const useAuth = () => ({
  user: null,
  nileUser: null,
  userTenants: [],
  userCompanies: [],
  isStaff: false,
  loading: false,
  error: null,
  selectedTenantId: null,
  selectedCompanyId: null,
  setSelectedTenant: jest.fn(),
  setSelectedCompany: jest.fn(),
  refreshProfile: jest.fn(),
  refreshTenants: jest.fn(),
  refreshCompanies: jest.fn(),
  clearError: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  signup: jest.fn(),
  updateUser: jest.fn(),
  refreshUserData: jest.fn(),
  systemHealth: { status: "unknown" },
  checkSystemHealth: jest.fn(),
});

export { useAuthOriginal };
