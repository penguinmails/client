import { AuthUser, TenantMembership } from "../types/auth-user";
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
    
    const tenantMembership: TenantMembership | undefined = primaryTenant ? {
      tenantId: primaryTenant.id,
      user_id: userId,
      roles: profileData.profile.claims?.role ? [profileData.profile.claims.role] : [],
      email: profileData.profile.email,
      tenant: {
        id: primaryTenant.id,
        name: primaryTenant.name,
        companies: (companiesData.companies || []) as CompanyInfo[],
      }
    } : undefined;

    const role = profileData.profile.claims?.role || "user";

    return {
      name: profileData.profile.displayName,
      displayName: profileData.profile.displayName,
      picture: profileData.profile.photoURL,
      photoURL: profileData.profile.photoURL,
      givenName: profileData.profile.profile?.firstName,
      familyName: profileData.profile.profile?.lastName,
      isStaff: !!profileData.profile.claims?.role && (profileData.profile.claims.role === "admin" || profileData.profile.claims.role === "super_admin"),
      role,
      claims: {
        role,
        permissions: [],
        tenantId: primaryTenant?.id || "",
        companyId: companiesData.companies?.[0]?.id,
      },
      preferences: profileData.profile.profile as Record<string, unknown>,
      tenantMembership,
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
