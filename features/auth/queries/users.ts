/**
 * User Profile Management
 * 
 * Handles user profile data, preferences, and profile operations
 */

import { NextRequest } from 'next/server';
import { NileDBUser } from '@features/auth/types';
import { getCurrentUser, queryWithContext } from './session';
import { ResourceNotFoundError } from '@/lib/nile/errors';
import { productionLogger } from '@/lib/logger';

/**
 * Get enhanced user profile combining NileDB user data with custom profile
 */
export const getUserProfile = async (req?: NextRequest): Promise<NileDBUser | null> => {
  try {
    const user = await getCurrentUser(req);
    if (!user) return null;

    // Get additional profile data from custom table
    const profileQuery = `
      SELECT 
        role,
        is_penguinmails_staff,
        preferences,
        last_login_at,
        created,
        updated
      FROM user_profiles 
      WHERE user_id = $1
    `;
    
    const profileRows = await queryWithContext<{
      role: string;
      is_penguinmails_staff: boolean;
      preferences: Record<string, unknown>;
      last_login_at: Date | null;
      created: Date;
      updated: Date;
    }>(profileQuery, [user.id], req);
    
    const profile = profileRows[0];

    // Combine NileDB user data with custom profile
    const enhancedUser: NileDBUser = {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      givenName: user.givenName && typeof user.givenName === 'string' ? user.givenName : undefined,
      familyName: user.familyName && typeof user.familyName === 'string' ? user.familyName : undefined,
      picture: user.picture && typeof user.picture === 'string' ? user.picture : undefined,
      created: user.created && typeof user.created === 'string' ? user.created : undefined,
      updated: user.updated && typeof user.updated === 'string' ? user.updated : undefined,
      emailVerified: typeof user.emailVerified === 'boolean' ? user.emailVerified : undefined,
      profile: profile ? {
        userId: user.id,
        role: (profile.role as "user" | "admin" | "super_admin") || 'user',
        isPenguinMailsStaff: profile.is_penguinmails_staff || false,
        preferences: profile.preferences || {},
        lastLoginAt: profile.last_login_at || undefined,
        createdAt: profile.created || new Date(),
        updatedAt: profile.updated || new Date(),
      } : {
        userId: user.id,
        role: 'user' as const,
        isPenguinMailsStaff: false,
        preferences: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      tenants: [], // Will be populated by caller
    };

    return enhancedUser;
  } catch (error) {
    productionLogger.error('[Users] Failed to get user profile:', error);
    return null;
  }
};

/**
 * Update user profile data
 */
export const updateUserProfile = async (
  updates: Partial<NileDBUser['profile']>,
  req?: NextRequest
): Promise<NileDBUser | null> => {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      throw new ResourceNotFoundError('User not found');
    }

    // Update custom profile data
    const updateQuery = `
      INSERT INTO user_profiles (
        user_id, role, is_penguinmails_staff, preferences, updated
      ) VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET
        role = COALESCE($2, user_profiles.role),
        is_penguinmails_staff = COALESCE($3, user_profiles.is_penguinmails_staff),
        preferences = COALESCE($4, user_profiles.preferences),
        updated = NOW()
    `;

    await queryWithContext(updateQuery, [
      user.id,
      updates?.role || null,
      updates?.isPenguinMailsStaff || null,
      updates?.preferences ? JSON.stringify(updates.preferences) : null,
    ], req);

    // Return updated profile
    return await getUserProfile(req);
  } catch (error) {
    productionLogger.error('[Users] Failed to update user profile:', error);
    throw error;
  }
};

/**
 * Get user by ID (for admin operations)
 */
export const getUserById = async (
  userId: string,
  req?: NextRequest
): Promise<NileDBUser | null> => {
  try {
    const currentUser = await getCurrentUser(req);
    if (!currentUser) return null;

    // For now, only allow users to access their own profile
    // TODO: Add admin role checking
    if (currentUser.id !== userId) {
      return null;
    }

    return await getUserProfile(req);
  } catch (error) {
    productionLogger.error('[Users] Failed to get user by ID:', error);
    return null;
  }
};

/**
 * Initialize user profile on first login
 */
export const initializeUserProfile = async (
  userId: string,
  req?: NextRequest
): Promise<void> => {
  try {
    const insertQuery = `
      INSERT INTO user_profiles (
        user_id, role, is_penguinmails_staff, preferences, created, updated
      ) VALUES ($1, 'user', false, '{}', NOW(), NOW())
      ON CONFLICT (user_id) DO NOTHING
    `;

    await queryWithContext(insertQuery, [userId], req);
  } catch (error) {
    productionLogger.error('[Users] Failed to initialize user profile:', error);
    // Don't throw - this is not critical
  }
};