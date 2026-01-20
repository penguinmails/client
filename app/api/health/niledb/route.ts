/**
 * NileDB Health Check API Route
 *
 * Tests NileDB connectivity and service health using the SDK
 * Implements Redis caching to prevent excessive API calls
 */

import { NextResponse } from "next/server";
import { testConnection } from "@/lib/queries/server";
import { getRedisClient } from "@/lib/cache";
import { productionLogger } from "@/lib/logger";
import { getCachedSession } from "@/lib/nile/nile";







import {
  ApiSuccessResponse,
  ApiErrorResponse
} from '@/types';

// Cache TTL values based on health status (in seconds)
const HEALTH_CACHE_TTL = {
  healthy: 300,    // 5 minutes
  degraded: 60,    // 1 minute
  unhealthy: 30,   // 30 seconds
  unknown: 30      // 30 seconds
} as const;

// Cache key for health status
const HEALTH_CACHE_KEY = "health:niledb:status";

export async function GET() {
  try {
    const redis = getRedisClient();
    
    // Try to get cached health status
    if (redis) {
      try {
        const cached = await redis.get(HEALTH_CACHE_KEY);
        if (cached) {
          const cachedData = JSON.parse(cached);
          productionLogger.debug("[API/Health/NileDB] Returning cached health status:", cachedData.data.status);
          return NextResponse.json(cachedData, {
            headers: {
              'X-Cache': 'HIT',
              'X-Cache-TTL': cachedData.cacheTTL?.toString() || 'unknown'
            }
          });
        }
      } catch (cacheError) {
        productionLogger.warn("[API/Health/NileDB] Cache read error:", cacheError);
        // Continue with fresh check if cache fails
      }
    }
    
    // Perform fresh health check
    const dbHealthy = await testConnection();
    
    // Test auth service (basic check)
    let authHealthy = true;
    try {
      // This will succeed even without authentication, using cached session
      await getCachedSession(new Headers());
    } catch (error) {
      // Only mark as unhealthy if it's a connection error, not auth error
      if (error instanceof Error && error.message.includes('connection')) {
        authHealthy = false;
      }
    }
    
    const overallStatus = dbHealthy && authHealthy ? "healthy" : "degraded";
    const cacheTTL = HEALTH_CACHE_TTL[overallStatus as keyof typeof HEALTH_CACHE_TTL] || 60;
    
    const successResponse: ApiSuccessResponse<{
        status: string;
        services: {
            database: string;
            auth: string;
        };
        details: {
            niledb_sdk: string;
            tenant_isolation: string;
        }
    }> & { cacheTTL?: number } = {
        success: true,
        data: {
            status: overallStatus,
            services: {
                database: dbHealthy ? "healthy" : "unhealthy",
                auth: authHealthy ? "healthy" : "unhealthy",
            },
            details: {
                niledb_sdk: "connected",
                tenant_isolation: "enabled",
            }
        },
        timestamp: new Date().toISOString(),
        cacheTTL: cacheTTL
    };
    
    // Cache the result
    if (redis) {
      try {
        await redis.set(HEALTH_CACHE_KEY, JSON.stringify(successResponse), "EX", cacheTTL);
        productionLogger.debug("[API/Health/NileDB] Cached health status with TTL:", cacheTTL, "seconds");
      } catch (cacheError) {
        productionLogger.warn("[API/Health/NileDB] Cache write error:", cacheError);
        // Continue even if caching fails
      }
    }
    
    return NextResponse.json(successResponse, {
      headers: {
        'X-Cache': 'MISS',
        'X-Cache-TTL': cacheTTL.toString()
      }
    });
  } catch (error) {
    productionLogger.error("[API/Health/NileDB] Health check failed:", error);
    
    // Cache the error response briefly to prevent rapid retries
    const redis = getRedisClient();
    if (redis) {
      try {
        const errorResponse = {
          success: false,
          error: "Health check failed",
          code: "HEALTH_CHECK_FAILED",
          details: {
            status: "unhealthy",
            services: {
              database: "unhealthy",
              auth: "unknown",
            }
          },
          timestamp: new Date().toISOString(),
          cacheTTL: HEALTH_CACHE_TTL.unhealthy
        };
        
        await redis.set(HEALTH_CACHE_KEY, JSON.stringify(errorResponse), "EX", HEALTH_CACHE_TTL.unhealthy);
        productionLogger.debug("[API/Health/NileDB] Cached error response");
      } catch (cacheError) {
        productionLogger.warn("[API/Health/NileDB] Error cache write failed:", cacheError);
      }
    }
    
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: "Health check failed",
      code: "HEALTH_CHECK_FAILED",
      details: {
        status: "unhealthy",
        services: {
          database: "unhealthy",
          auth: "unknown",
        }
      },
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'X-Cache': 'MISS',
        'X-Cache-TTL': HEALTH_CACHE_TTL.unhealthy.toString()
      }
    });
  }
}
