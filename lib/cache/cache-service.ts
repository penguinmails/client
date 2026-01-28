import { getRedisClient } from './redis-client';
import { productionLogger, developmentLogger } from '@/lib/logger';

/**
 * Cache Keys - Centralized cache key definitions
 */
export const CacheKeys = {
  DASHBOARD_ANALYTICS: 'pm:dashboard:analytics',
  LEADS_LIST: 'pm:leads:list',
  SEGMENTS_LIST: 'pm:segments:list',
  CONTACT: 'pm:contact',
} as const;

/**
 * Cache TTL values in seconds
 */
export const CacheTTL = {
  DASHBOARD: 60,      // 1 minute - dashboard analytics
  LEADS: 300,         // 5 minutes - leads list
  SEGMENTS: 300,      // 5 minutes - segments list
  CONTACT: 120,       // 2 minutes - individual contact
} as const;

/**
 * Get cached data by key
 * Returns null if cache miss or Redis unavailable
 */
export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient();
    if (!redis) {
      developmentLogger.debug('[Cache] Redis not available, skipping cache read');
      return null;
    }

    const cached = await redis.get(key);
    if (!cached) {
      developmentLogger.debug(`[Cache] Miss: ${key}`);
      return null;
    }

    developmentLogger.debug(`[Cache] Hit: ${key}`);
    return JSON.parse(cached) as T;
  } catch (error) {
    productionLogger.error('[Cache] Error reading from cache:', error);
    return null;
  }
}

/**
 * Set cached data with TTL
 * Silently fails if Redis unavailable
 */
export async function setCache<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
  try {
    const redis = getRedisClient();
    if (!redis) {
      developmentLogger.debug('[Cache] Redis not available, skipping cache write');
      return;
    }

    await redis.setex(key, ttlSeconds, JSON.stringify(data));
    developmentLogger.debug(`[Cache] Set: ${key} (TTL: ${ttlSeconds}s)`);
  } catch (error) {
    productionLogger.error('[Cache] Error writing to cache:', error);
  }
}

/**
 * Invalidate cache entries matching a pattern
 * Uses Redis SCAN for production-safe pattern matching
 */
export async function invalidateCache(pattern: string): Promise<void> {
  try {
    const redis = getRedisClient();
    if (!redis) {
      developmentLogger.debug('[Cache] Redis not available, skipping invalidation');
      return;
    }

    let cursor = '0';
    let deletedCount = 0;

    do {
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;

      if (keys.length > 0) {
        await redis.del(...keys);
        deletedCount += keys.length;
      }
    } while (cursor !== '0');

    developmentLogger.debug(`[Cache] Invalidated ${deletedCount} keys matching: ${pattern}`);
  } catch (error) {
    productionLogger.error('[Cache] Error invalidating cache:', error);
  }
}

/**
 * Invalidate a single cache key
 */
export async function invalidateCacheKey(key: string): Promise<void> {
  try {
    const redis = getRedisClient();
    if (!redis) {
      return;
    }

    await redis.del(key);
    developmentLogger.debug(`[Cache] Deleted: ${key}`);
  } catch (error) {
    productionLogger.error('[Cache] Error deleting cache key:', error);
  }
}

/**
 * Build a cache key for leads list with optional filters
 */
export function buildLeadsCacheKey(options?: { listId?: string; listAlias?: string }): string {
  const suffix = options?.listAlias || options?.listId || 'all';
  return `${CacheKeys.LEADS_LIST}:${suffix}`;
}

/**
 * Build a cache key for segments list
 */
export function buildSegmentsCacheKey(): string {
  return CacheKeys.SEGMENTS_LIST;
}

/**
 * Build a cache key for a specific contact
 */
export function buildContactCacheKey(contactId: string | number): string {
  return `${CacheKeys.CONTACT}:${contactId}`;
}
