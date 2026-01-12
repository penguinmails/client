/**
 * Shared Authentication Utilities
 *
 * Common authentication functions used across features
 */

import { NextRequest } from 'next/server';
import { nile, getCachedSession } from '@/lib/nile/nile';
import { productionLogger } from '@/lib/logger';
import {
  NileClientUser
} from '@/features/auth/types/nile-client';

/**
 * Get current authenticated user with request context
 */
export const getCurrentUser = async (req?: NextRequest): Promise<NileClientUser | null> => {
  try {
    // Use cached session if request is available for better performance
    if (req) {
      const session = await getCachedSession(req.headers);
      if (session?.user) {
        return session.user as NileClientUser;
      }
      return null;
    }

    // Fallback for requests without context
    const users = await nile.getUsers();
    if (!users) return null;

    const user = await (users as { getSelf(): Promise<NileClientUser | Response> }).getSelf();
    return user instanceof Response ? null : user as NileClientUser;
  } catch (error) {
    productionLogger.error('[Auth] Failed to get current user:', error);

    // Return null for anonymous/unauthenticated users instead of throwing
    // This prevents authentication errors when users are not logged in
    return null;
  }
};
