import { AuthUser } from "../types/auth-user";

export interface UserProfileResponse {
  data: {
    profile: {
      email: string;
      displayName: string;
      photoURL?: string;
      profile?: {
        firstName?: string;
        lastName?: string;
        [key: string]: unknown;
      };
      claims?: {
        role?: string;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
  };
}

export interface UserTenantsResponse {
  data: {
    tenants: Array<{
      id: string;
      name: string;
      [key: string]: unknown;
    }>;
  };
}

export interface UserCompaniesResponse {
  data: {
    companies: Array<{
      id: string;
      name: string;
      tenantId: string;
      role: string;
      email?: string;
      settings?: Record<string, unknown>;
      created?: string | Date;
      updated?: string | Date;
      [key: string]: unknown;
    }>;
  };
}

/**
 * Fetches the current user's profile.
 */
export async function fetchUserProfile(): Promise<Response> {
  return fetch("/api/profile");
}

/**
 * Fetches the tenants associated with the current user.
 */
export async function fetchUserTenants(): Promise<Response> {
  return fetch("/api/user/tenants");
}

/**
 * Fetches the companies for a specific user.
 */
export async function fetchUserCompanies(userId: string): Promise<Response> {
  return fetch(`/api/users/${userId}/companies`);
}
