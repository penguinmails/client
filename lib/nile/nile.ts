/**
 * NileDB SDK Instance and Core Functions
 * 
 * Central access point for NileDB SDK with proper configuration
 */

import { productionLogger, developmentLogger } from '@/lib/logger';

// Direct import of nile instance
let nileInstance: Record<string, unknown> | null = null;
let instancePromise: Promise<Record<string, unknown> | null> | null = null;

import { 
  NileClientSession, 
  NileClientUser, 
  NileClientTenant, 
  NileQueryResult
} from '@/features/auth/types/nile-client';

// NileDB Client Interfaces for proper typing
interface NileUsersClient {
  getSelf(): Promise<NileClientUser | Response>;
}

interface NileAuthClient {
  getSession(): Promise<NileClientSession | Response>;
}

interface NileTenantsClient {
  list(): Promise<NileClientTenant[] | Response>;
}

interface NileDBClient {
  query(sql: string, params: unknown[]): Promise<NileQueryResult<unknown>>;
}

// Session caching to avoid redundant calls
const sessionCache = new Map<string, { user: NileClientSession | null; timestamp: number; ttl: number }>();
const SESSION_CACHE_TTL = 3 * 60 * 1000; // 3 minutes cache

// Get the nile instance
const getNileInstance = async (): Promise<Record<string, unknown> | null> => {
  if (nileInstance) {
    return nileInstance;
  }
  
  if (!instancePromise) {
    instancePromise = (async () => {
      try {
        // Dynamic import to avoid circular dependencies
        const { nile } = await import('@/app/api/[...nile]/nile');
        nileInstance = nile as unknown as Record<string, unknown>;
        return nileInstance;
      } catch (error) {
        productionLogger.error('[NileDB] Failed to initialize nile instance:', error);
        return null;
      }
    })();
  }
  
  return await instancePromise;
};

// Get cached session to avoid redundant calls
export const getCachedSession = async (headers: Headers): Promise<NileClientSession | null> => {
  const cacheKey = headers.get('authorization') || 'anonymous';
  const cached = sessionCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    developmentLogger.debug('[NileDB] Using cached session');
    return cached.user;
  }
  
  // Fetch fresh session
  const auth = await nile.getAuth();
  if (!auth) return null;
  
  try {
    const session = await (auth as NileAuthClient).getSession();
    
    // Cache the session
    const cachedSession = session instanceof Response ? null : session as NileClientSession;
    sessionCache.set(cacheKey, {
      user: cachedSession,
      timestamp: Date.now(),
      ttl: SESSION_CACHE_TTL
    });
    
    developmentLogger.debug('[NileDB] Fresh session fetched and cached');
    return session instanceof Response ? null : session;
  } catch (error) {
    productionLogger.error('[NileDB] Failed to get session:', error);
    return null;
  }
};

// Clear expired cache entries periodically
const clearExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of sessionCache.entries()) {
    if (now - value.timestamp >= value.ttl) {
      sessionCache.delete(key);
      developmentLogger.debug('[NileDB] Cleared expired session cache');
    }
  }
};

// Clear cache every 2 minutes
setInterval(clearExpiredCache, 2 * 60 * 1000);

// Export the configured nile instance as a simple object
export const nile = {
  async getUsers() {
    const instance = await getNileInstance();
    return instance?.users || null;
  },
  
  async getAuth() {
    const instance = await getNileInstance();
    return instance?.auth || null;
  },
  
  async getTenants() {
    const instance = await getNileInstance();
    return instance?.tenants || null;
  },
  
  async getDB() {
    const instance = await getNileInstance();
    return instance?.db || null;
  }
};



/**
 * Core NileDB functions for server-side usage
 */

import { NextRequest } from 'next/server';

// ... (other imports)

// Get current authenticated user
export const getCurrentUser = async (req?: NextRequest) => {
  const users = await nile.getUsers();
  if (!users) return null;

  try {
    if (req) {
      const headers: Record<string, string> = {};
      req.headers.forEach((value: string, key: string) => { headers[key] = value; });
      return await (users as any).withContext({ headers }, async () => {
        const user = await (users as NileUsersClient).getSelf();
        return user instanceof Response ? null : user as NileClientUser;
      });
    }
    const user = await (users as NileUsersClient).getSelf();
    return user instanceof Response ? null : user as NileClientUser;
  } catch (error) {
    productionLogger.error('[NileDB] getCurrentUser failed:', error);
    return null;
  }
};

// Get current session
export const getCurrentSession = async (req?: NextRequest) => {
  const auth = await nile.getAuth();
  if (!auth) return null;
  
  try {
    if (req) {
      const headers: Record<string, string> = {};
      req.headers.forEach((value: string, key: string) => { headers[key] = value; });
      return await (auth as any).withContext({ headers }, async () => {
        const session = await (auth as NileAuthClient).getSession();
        return session instanceof Response ? null : session as NileClientSession;
      });
    }
    const session = await (auth as NileAuthClient).getSession();
    return session instanceof Response ? null : session as NileClientSession;
  } catch (error) {
    productionLogger.error('[NileDB] getCurrentSession failed:', error);
    return null;
  }
};

// Get user's tenants
export const getUserTenants = async (req?: NextRequest) => {
  const tenants = await nile.getTenants();
  if (!tenants) return [];
  
  try {
    if (req) {
      const headers: Record<string, string> = {};
      req.headers.forEach((value: string, key: string) => { headers[key] = value; });
      
      // Get session for userId
      const session = await getCachedSession(req.headers);
      const userId = session?.user?.id;

      return await (tenants as any).withContext({ headers, userId }, async () => {
        const tenantList = await (tenants as NileTenantsClient).list();
        return tenantList instanceof Response ? [] : tenantList as NileClientTenant[];
      });
    }
    const tenantList = await (tenants as NileTenantsClient).list();
    return tenantList instanceof Response ? [] : tenantList as NileClientTenant[];
  } catch (error) {
    productionLogger.error('[NileDB] getUserTenants failed:', error);
    return [];
  }
};

// Test database connectivity
export const testConnection = async (): Promise<boolean> => {
  try {
    const db = await nile.getDB();
    if (!db) return false;
    
    await (db as NileDBClient).query('SELECT 1', []); // Database connectivity test
    return true;
  } catch (error) {
    productionLogger.error('[NileDB] Connection test failed:', error);
    return false;
  }
};

// Execute query with tenant context
export const query = async <T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> => {
  try {
    const db = await nile.getDB();
    if (!db) return [];
    
    const result = await (db as NileDBClient).query(sql, params);
    return result.rows as T[];
  } catch (error) {
    productionLogger.error('[NileDB] Query failed:', error);
    return [];
  }
};
