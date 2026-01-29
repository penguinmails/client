/**
 * Session API - Business Logic
 * Handles session data transformation following FSD principles
 */

import { NextRequest } from 'next/server';
import { getUserProfile, getUserTenants } from '../queries';
import { AuthUser } from '@/types/auth';
import { productionLogger } from '@/lib/logger';

export async function getSessionData(req?: NextRequest) {
  try {
    const profile = await getUserProfile(req);
    
    if (!profile) {
      return { user: null, isAuthenticated: false };
    }

    const tenants = await getUserTenants(req);

    const authUser: AuthUser = {
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
      tenants: tenants.map((t) => ({
        id: t.id,
        name: t.name,
        created: ('created' in t && typeof t.created === 'string') ? t.created : undefined
      })),
      companies: [],
      roles: [profile.profile?.role || 'user'],
      permissions: [],
    };

    return { user: authUser, isAuthenticated: true };
  } catch (error) {
    productionLogger.error('[Session API] Error:', error);
    return { user: null, isAuthenticated: false };
  }
}
