/**
 * Profile API Route - NileDB Integration
 *
 * Handles user profile management using NileDB SDK with proper session context
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, updateUserProfile, getUserTenants } from "@/features/auth/queries";
import { generateMockAuthData } from "@/features/auth/lib/mock-auth-data";
import { withQueryErrorCatch, withMutationErrorCatch, manualErrorResponse } from "@/lib/utils/api";
import {
  EnhancedApiResponse
} from '@/types';
import { AuthUser } from "@/types/auth";

// Enhanced profile type - using AuthUser directly instead of extending
// Nile tenant interface to replace 'any' types
interface NileTenant {
  id: string;
  name: string;
  [key: string]: unknown;
}

// Profile API response types
interface ProfileGetResponse {
  profile: AuthUser;
}

interface ProfileUpdateResponse {
  profile: AuthUser;
  message: string;
}

export async function GET(req: NextRequest): Promise<NextResponse<EnhancedApiResponse<ProfileGetResponse>>> {
  // Handle authentication error case first
  const profile = await getUserProfile(req);
  if (!profile) {
    return manualErrorResponse("Authentication required", {
      code: "AUTHENTICATION_REQUIRED",
      status: 401
    });
  }

  return withQueryErrorCatch(
    async () => {
      // Get user's tenants and add to profile
      const tenants = await getUserTenants(req);
      const userRole = profile.profile?.role || 'user';
      const tenantId = tenants[0]?.id;

      // Generate mock data for companies, roles, and permissions
      // TODO: Replace with real data fetching once getUserCompanies, getUserRoles, getUserPermissions are implemented
      const mockAuthData = generateMockAuthData(profile.id, userRole, tenantId);

      // Transform NileDBUser to AuthUser
      const enhancedProfile: AuthUser = {
        id: profile.id,
        email: profile.email,
        name: profile.name || profile.email.split('@')[0],
        displayName: profile.name || profile.email.split('@')[0],
        picture: profile.picture,
        photoURL: profile.picture,
        givenName: profile.givenName,
        familyName: profile.familyName,
        role: profile.profile?.role || 'user',
        isStaff: profile.profile?.isPenguinMailsStaff,
        claims: {
          role: profile.profile?.role || 'user',
          permissions: [],
          tenantId: tenants[0]?.id || '',
        },
        preferences: {
          timezone: (profile.profile?.preferences?.timezone as string) || 'UTC',
          language: (profile.profile?.preferences?.language as string) || 'en',
          ...profile.profile?.preferences,
        },
        // Populate required AuthUser arrays
        tenants: tenants.map((t: NileTenant) => ({
            id: t.id, 
            name: t.name, 
            // Use tenant's created date if available from getUserTenants
            created: ('created' in t && typeof t.created === 'string') ? t.created : undefined
        })),
        // Mock data for companies, roles, and permissions
        // TODO: Replace with real data fetching once getUserCompanies, getUserRoles, getUserPermissions are implemented
        companies: mockAuthData.companies,
        roles: mockAuthData.roles,
        permissions: mockAuthData.permissions,
      };

      return { profile: enhancedProfile };
    },
    {
      controllerName: 'Profile',
      operation: 'get_profile',
      req,
      // Auto-generates: "Profile retrieved successfully"
    }
  );
}

export async function PUT(req: NextRequest): Promise<NextResponse<EnhancedApiResponse<ProfileUpdateResponse>>> {
  // Handle update failure case first
  const updates = await req.json();
  const updatedProfile = await updateUserProfile(updates, req);

  if (!updatedProfile) {
    return manualErrorResponse("Failed to update profile", {
      code: "UPDATE_FAILED",
      status: 400
    });
  }

  return withMutationErrorCatch(
    async () => {
      // Get updated tenants
      const tenants = await getUserTenants(req);
      const userRole = updatedProfile.profile?.role || 'user';
      const tenantId = tenants[0]?.id;

      // Generate mock data for companies, roles, and permissions
      // TODO: Replace with real data fetching once getUserCompanies, getUserRoles, getUserPermissions are implemented
      const mockAuthData = generateMockAuthData(updatedProfile.id, userRole, tenantId);

      // Transform NileDBUser to AuthUser
      const enhancedProfile: AuthUser = {
        id: updatedProfile.id,
        email: updatedProfile.email,
        name: updatedProfile.name || updatedProfile.email.split('@')[0],
        displayName: updatedProfile.name || updatedProfile.email.split('@')[0],
        picture: updatedProfile.picture,
        photoURL: updatedProfile.picture,
        givenName: updatedProfile.givenName,
        familyName: updatedProfile.familyName,
        role: updatedProfile.profile?.role || 'user',
        isStaff: updatedProfile.profile?.isPenguinMailsStaff,
        claims: {
          role: updatedProfile.profile?.role || 'user',
          permissions: [],
          tenantId: tenants[0]?.id || '',
        },
        preferences: {
          timezone: (updatedProfile.profile?.preferences?.timezone as string) || 'UTC',
          language: (updatedProfile.profile?.preferences?.language as string) || 'en',
          ...updatedProfile.profile?.preferences,
        },
        // Populate required AuthUser arrays
        tenants: tenants.map((t: NileTenant) => ({
            id: t.id, 
            name: t.name, 
            // Use tenant's created date if available from getUserTenants
            created: ('created' in t && typeof t.created === 'string') ? t.created : undefined
        })),
        // Mock data for companies, roles, and permissions
        // TODO: Replace with real data fetching once getUserCompanies, getUserRoles, getUserPermissions are implemented
        companies: mockAuthData.companies,
        roles: mockAuthData.roles,
        permissions: mockAuthData.permissions,
      };

      return {
        profile: enhancedProfile,
        message: "Profile updated successfully"
      };
    },
    {
      controllerName: 'Profile',
      operation: 'update_profile',
      req,
      // Auto-generates: "Profile updated successfully"
    }
  );
}
