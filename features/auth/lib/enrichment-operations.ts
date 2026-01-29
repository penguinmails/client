import { AuthUser, TenantMembership } from "@/types/auth";
import { CompanyInfo } from "@/types";
import { productionLogger } from "@/lib/logger";
import { 
  fetchUserProfile, 
  fetchUserTenants, 
  fetchUserCompanies,
  UserProfileResponse,
  UserTenantsResponse,
  UserCompaniesResponse
} from "../api/user";

/**
 * Fetch all DB info to enrich the session user
 * Mirrored from DB schema
 */
export async function fetchEnrichedUser(userId: string): Promise<Partial<AuthUser>> {
  // 1. Fetch Profile (Custom table user_profiles + users)
  // 2. Fetch Tenant Membership (tenant_users join tenants)
  // 3. Fetch Companies (filtered by tenant)
  
  try {
    const [profileResponse, tenantsResponse, companiesResponse] = await Promise.all([
      fetchUserProfile(),
      fetchUserTenants(),
      fetchUserCompanies(userId),
    ]);

    // If any of these return 401, it means the user session is invalid
    // In this case, we should return basic user data without enrichment
    if (!profileResponse.ok || !tenantsResponse.ok || !companiesResponse.ok) {
      if (profileResponse.status === 401 || tenantsResponse.status === 401 || companiesResponse.status === 401) {
        productionLogger.info('[AuthOps] Authentication failed during enrichment, returning basic user data');
        return {
          role: 'user',
          claims: {
            role: 'user',
            permissions: [],
            tenantId: '',
            companyId: undefined,
          },
          preferences: {},
        };
      }
      throw new Error("Failed to fetch enrichment data");
    }

    const [profileRes, tenantsRes, companiesRes] = await Promise.all([
      profileResponse.json() as Promise<UserProfileResponse>,
      tenantsResponse.json() as Promise<UserTenantsResponse>,
      companiesResponse.json() as Promise<UserCompaniesResponse>,
    ]);

    const profileData = profileRes.data;
    const tenantsData = tenantsRes.data;
    const companiesData = companiesRes.data;

    // Note: App logic says user has ONE tenant in this context
    const primaryTenant = tenantsData.tenants?.[0];
    
 
    const role = (profileData.profile.role as string) || (profileData.profile.claims?.role as string) || "user";
    
    const tenantMembership: TenantMembership | undefined = primaryTenant ? {
      tenantId: primaryTenant.id,
      user_id: userId,
      roles: [role],  
      email: profileData.profile.email,
      tenant: {
        id: primaryTenant.id,
        name: primaryTenant.name,
        companies: (companiesData.companies || []) as CompanyInfo[],
      }
    } : undefined;

    return {
      name: profileData.profile.displayName,
      displayName: profileData.profile.displayName,
      picture: profileData.profile.photoURL,
      photoURL: profileData.profile.photoURL,
      givenName: profileData.profile.profile?.firstName as string | undefined,
      familyName: profileData.profile.profile?.lastName as string | undefined,
      isStaff: (profileData.profile.isStaff as boolean) || false,  
      role,
      claims: {
        role,
        permissions: Array.isArray(profileData.profile.permissions) ? (profileData.profile.permissions as string[]) : [],  
        tenantId: primaryTenant?.id || "",
        companyId: companiesData.companies?.[0]?.id,
      },
      preferences: (profileData.profile.preferences as Record<string, unknown>) || {},
      tenantMembership,
  
      permissions: Array.isArray(profileData.profile.permissions) ? (profileData.profile.permissions as string[]) : [],
      roles: Array.isArray(profileData.profile.roles) ? (profileData.profile.roles as string[]) : [role],
      tenants: Array.isArray(profileData.profile.tenants) ? profileData.profile.tenants as AuthUser['tenants'] : [],
      companies: Array.isArray(profileData.profile.companies) ? (profileData.profile.companies as CompanyInfo[]) : [],
    };
  } catch (error) {
    productionLogger.warn('[AuthOps] Enrichment failed, returning basic user data:', error);
    // Return basic user data instead of throwing
    return {
      role: 'user',
      claims: {
        role: 'user',
        permissions: [],
        tenantId: '',
        companyId: undefined,
      },
      preferences: {},
    };
  }
}
