/**
 * Profile API Route - NileDB Integration
 *
 * Handles user profile management using NileDB SDK with proper session context
 */

import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, updateUserProfile, getUserTenants } from "@/features/auth/queries";
import { withQueryErrorCatch, withMutationErrorCatch, manualErrorResponse } from "@/shared/utils/api";
import {
  EnhancedApiResponse
} from '@/shared/types/api';
import { AuthUser } from "@/entities/user";

// Enhanced profile type that includes tenant information
interface EnhancedProfile extends AuthUser {
  tenants: string[];
}

// Nile tenant interface to replace 'any' types
interface NileTenant {
  id: string;
  name: string;
  [key: string]: unknown;
}

// Profile API response types
interface ProfileGetResponse {
  profile: EnhancedProfile;
}

interface ProfileUpdateResponse {
  profile: EnhancedProfile;
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

      // Transform NileDBUser to EnhancedProfile
      const enhancedProfile: EnhancedProfile = {
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
        tenants: tenants.map((t: NileTenant) => t.id),
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

      // Transform NileDBUser to EnhancedProfile
      const enhancedProfile: EnhancedProfile = {
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
        tenants: tenants.map((t: NileTenant) => t.id),
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
