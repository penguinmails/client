/**
 * Authentication & Session Management
 * 
 * Handles user authentication, session validation, and context management
 */

import { NextRequest } from 'next/server';
import { nile, getCachedSession } from '@/lib/nile/nile';
import { AuthenticationError } from '@/lib/nile/errors';
import { productionLogger } from '@/lib/logger';
import { 
  NileClientUser, 
  NileClientSession, 
  NileClientTenant,
  NileQueryResult,
  NileContextOptions
} from '@/features/auth/types/nile-client';

// NileDB Client Interfaces for proper typing
interface NileUsersClient {
  getSelf(): Promise<NileClientUser | Response>;
}

interface NileAuthClient {
  withContext(options: NileContextOptions, callback: () => Promise<NileClientSession>): Promise<NileClientSession>;
  getSession(): Promise<NileClientSession | Response>;
}

interface NileTenantsClient {
  withContext(options: NileContextOptions, callback: () => Promise<NileClientTenant[]>): Promise<NileClientTenant[]>;
  list(): Promise<NileClientTenant[] | Response>;
}

interface NileDBClient<T = unknown> {
  withContext(options: NileContextOptions, callback: () => Promise<NileQueryResult<T>>): Promise<NileQueryResult<T>>;
  query(sql: string, params: unknown[]): Promise<NileQueryResult<T>>;
}







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
    
    const user = await (users as NileUsersClient).getSelf();
    return user instanceof Response ? null : user as NileClientUser;
  } catch (error) {
    productionLogger.error('[Auth] Failed to get current user:', error);
    
    // Return null for anonymous/unauthenticated users instead of throwing
    // This prevents authentication errors when users are not logged in
    return null;
  }
};

/**
 * Get current session with request context
 */
export const getCurrentSession = async (req?: NextRequest): Promise<NileClientSession | null> => {
  try {
    const auth = await nile.getAuth();
    if (!auth) return null;
    
    if (req && (auth as NileAuthClient).withContext) {
      const headers: Record<string, string> = {};
      req.headers.forEach((value, key) => {
        headers[key] = value;
      });
      return await (auth as NileAuthClient).withContext({ headers }, async () => {
        return await (auth as NileAuthClient).getSession() as NileClientSession;
      });
    }
    
    return await (auth as NileAuthClient).getSession() as NileClientSession;
  } catch (error) {
    productionLogger.error('[Auth] Failed to get session:', error);
    return null;
  }
};

/**
 * Validate if current session is active
 */
export const validateSession = async (req?: NextRequest): Promise<boolean> => {
  try {
    const user = await getCurrentUser(req);
    return user !== null;
  } catch (error) {
    productionLogger.error('[Auth] Session validation failed:', error);
    return false;
  }
};

/**
 * Require authentication - throws if not authenticated
 */
export const requireAuth = async (req?: NextRequest) => {
  const user = await getCurrentUser(req);
  if (!user) {
    throw new AuthenticationError('Authentication required');
  }
  return user;
};

/**
 * Get user's tenants with request context
 */
export const getUserTenants = async (req?: NextRequest): Promise<NileClientTenant[]> => {
  try {
    const tenants = await nile.getTenants();
    if (!tenants) return [];
    
    if (req && (tenants as NileTenantsClient).withContext) {
      const headers: Record<string, string> = {};
      req.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      // Get current user to provide userId to Nile context
      const user = await getCurrentUser(req);
      const userId = user?.id;

      return await (tenants as NileTenantsClient).withContext({ headers, userId }, async () => {
        const tenantList = await (tenants as NileTenantsClient).list();
        return tenantList instanceof Response ? [] : tenantList;
      });
    }
    
    const tenantList = await (tenants as NileTenantsClient).list();
    return tenantList instanceof Response ? [] : tenantList;
  } catch (error) {
    productionLogger.error('[Auth] Failed to get user tenants:', error);
    return [];
  }
};

/**
 * Execute database query with proper context
 */
export const queryWithContext = async <T = unknown>(
  sql: string, 
  params: unknown[] = [],
  req?: NextRequest
): Promise<T[]> => {
  try {
    const db = await nile.getDB();
    if (!db) return [];
    
    if (req && (db as NileDBClient<T>).withContext) {
      const headers: Record<string, string> = {};
      req.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      // Get current user to provide userId to Nile context
      const user = await getCurrentUser(req);
      const userId = user?.id;

      return await (db as NileDBClient<T>).withContext({ headers, userId }, async () => {
        const result = await (db as NileDBClient<T>).query(sql, params);
        return result;
      }).then(result => result.rows);
    }
    
    const result = await (db as NileDBClient<T>).query(sql, params);
    return result.rows;
  } catch (error) {
    productionLogger.error('[Auth] Query failed:', error);
    throw error;
  }
};
