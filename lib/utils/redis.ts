// ============================================================================
// REDIS CONFIGURATION - Analytics caching infrastructure
// ============================================================================
"use server";
import { AnalyticsFilters } from "@/types/analytics/core";
import Redis from "ioredis";

/**
 * Create a Redis client using environment variables.
 * Automatically connects to local Redis in development or to a cloud provider in production.
 */
function createRedisClient(): Redis | null {
  const redisUrl =
    process.env.REDIS_URL ||
    (process.env.NODE_ENV === "development" ? "redis://localhost:6379" : "");

  if (!redisUrl) {
    console.warn("Redis not configured. Set REDIS_URL environment variable.");
    return null;
  }

  try {
    const client = new Redis(redisUrl);
    console.log("Redis client configured successfully");
    return client;
  } catch (error) {
    console.error("Failed to create Redis client:", error);
    return null;
  }
}

/**
 * Analytics cache manager with domain-specific key structure.
 * Implements intelligent caching strategies for analytics data.
 */
export class AnalyticsCache {
  private redis: Redis | null;

  constructor() {
    this.redis = createRedisClient();
  }

  /**
   * Generate structured cache key for analytics data.
   * Format: analytics:{domain}:{operation}:{entityIds}:{filters}:{timestamp}
   */
  generateCacheKey(
    domain: string,
    operation: string,
    entityIds: string[] = [],
    filters: AnalyticsFilters,
    timeWindow: number = 300
  ): string {
    const entityPart = entityIds.length > 0 ? entityIds.sort().join(",") : "all";
    const filterPart =
      Object.keys(filters).length > 0
        ? btoa(JSON.stringify(filters)).replace(/[^a-zA-Z0-9]/g, "")
        : "nofilters";

    const timestamp =
      Math.floor(Date.now() / (timeWindow * 1000)) * timeWindow;

    return `analytics:${domain}:${operation}:${entityPart}:${filterPart}:${timestamp}`;
  }

  async get<T>(cacheKey: string): Promise<T | null> {
    if (!this.redis) return null;

    try {
      const cached = await this.redis.get(cacheKey);
      return cached ? (JSON.parse(cached) as T) : null;
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  }

  async set(
    cacheKey: string,
    data: unknown,
    ttlSeconds: number = 300
  ): Promise<boolean> {
    if (!this.redis) return false;

    try {
      await this.redis.set(cacheKey, JSON.stringify(data), "EX", ttlSeconds);
      return true;
    } catch (error) {
      console.error("Redis set error:", error);
      return false;
    }
  }

  async delete(cacheKey: string): Promise<boolean> {
    if (!this.redis) return false;

    try {
      await this.redis.del(cacheKey);
      return true;
    } catch (error) {
      console.error("Redis delete error:", error);
      return false;
    }
  }

  async deleteByPattern(pattern: string): Promise<number> {
    if (!this.redis) return 0;

    try {
      const keys = await this.scanKeys(pattern);
      if (keys.length === 0) return 0;

      await this.redis.del(...keys);
      return keys.length;
    } catch (error) {
      console.error("Redis delete by pattern error:", error);
      return 0;
    }
  }

  private async scanKeys(pattern: string): Promise<string[]> {
    if (!this.redis) return [];

    const keys: string[] = [];
    let cursor = "0";

    do {
      try {
        const [nextCursor, foundKeys] = await this.redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = nextCursor;
        keys.push(...foundKeys);
      } catch (error) {
        console.error("Redis scan error:", error);
        break;
      }
    } while (cursor !== "0");

    return keys;
  }

  async invalidateDomain(domain: string): Promise<number> {
    const pattern = `analytics:${domain}:*`;
    return await this.deleteByPattern(pattern);
  }

  async invalidateEntities(domain: string, entityIds: string[]): Promise<number> {
    const entityPart = entityIds.sort().join(",");
    const pattern = `analytics:${domain}:*:${entityPart}:*`;
    return await this.deleteByPattern(pattern);
  }

  async invalidateAll(): Promise<number> {
    const pattern = "analytics:*";
    return await this.deleteByPattern(pattern);
  }

  async getStats(): Promise<{
    isAvailable: boolean;
    totalKeys: number;
    analyticsKeys: number;
  }> {
    if (!this.redis) {
      return { isAvailable: false, totalKeys: 0, analyticsKeys: 0 };
    }

    try {
      const totalKeys = await this.redis.dbsize();
      const analyticsKeys = await this.scanKeys("analytics:*");

      return {
        isAvailable: true,
        totalKeys,
        analyticsKeys: analyticsKeys.length,
      };
    } catch (error) {
      console.error("Redis stats error:", error);
      return { isAvailable: false, totalKeys: 0, analyticsKeys: 0 };
    }
  }

  isAvailable(): boolean {
    return this.redis !== null;
  }
}

/**
 * Cache TTL constants for different types of analytics data.
 */
export const CACHE_TTL = {
  REAL_TIME: 60,
  RECENT: 300,
  HOURLY: 900,
  DAILY: 3600,
  HISTORICAL: 86400,
} as const;

/**
 * Domain-specific cache configurations.
 */
export const DOMAIN_CACHE_CONFIG = {
  campaigns: {
    performance: CACHE_TTL.RECENT,
    timeSeries: CACHE_TTL.HOURLY,
    comparative: CACHE_TTL.DAILY,
  },
  domains: {
    health: CACHE_TTL.RECENT,
    reputation: CACHE_TTL.HOURLY,
    authentication: CACHE_TTL.DAILY,
  },
  mailboxes: {
    performance: CACHE_TTL.RECENT,
    warmup: CACHE_TTL.RECENT,
    health: CACHE_TTL.HOURLY,
  },
  leads: {
    engagement: CACHE_TTL.RECENT,
    conversion: CACHE_TTL.HOURLY,
    segmentation: CACHE_TTL.DAILY,
  },
  templates: {
    performance: CACHE_TTL.HOURLY,
    usage: CACHE_TTL.DAILY,
    effectiveness: CACHE_TTL.DAILY,
  },
  billing: {
    usage: CACHE_TTL.RECENT,
    costs: CACHE_TTL.HOURLY,
    limits: CACHE_TTL.DAILY,
  },
} as const;

export const analyticsCache = new AnalyticsCache();
export const redis = createRedisClient();
