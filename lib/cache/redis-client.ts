import Redis from "ioredis";
import { developmentLogger, productionLogger } from "@/lib/logger";

let redisClient: Redis | null = null;

/**
 * Get a singleton Redis client instance.
 * Creates the client on first call and reuses it for subsequent calls.
 */
export function getRedisClient(): Redis | null {
  developmentLogger.debug('🔍 Redis client status check - current client:', redisClient ? redisClient.status : 'null');

  if (redisClient && redisClient.status === 'ready') {
    developmentLogger.debug('✅ Returning existing ready Redis client');
    return redisClient;
  }

  // Clean up existing client if it's in a bad state
  if (redisClient && redisClient.status !== 'ready') {
    developmentLogger.debug('🧹 Cleaning up Redis client with status:', redisClient.status);
    redisClient.disconnect();
    redisClient = null;
  }

  const redisUrl =
    process.env.REDIS_URL ||
    (process.env.NODE_ENV === "development" ? "redis://localhost:6379" : "");

  // Redact password from Redis URL for logging
  const redactedRedisUrl = redisUrl.replace(/:([^:@]+)@/, ':***@');
  developmentLogger.debug('🔗 Redis URL:', redactedRedisUrl);

  if (!redisUrl) {
    developmentLogger.warn("⚠️ Redis not configured. Set REDIS_URL environment variable.");
    return null;
  }

  try {
    developmentLogger.debug('🔨 Creating new Redis client...');
    redisClient = new Redis(redisUrl);
    developmentLogger.debug("✅ Redis client configured successfully, status:", redisClient.status);

    // Handle connection events
    redisClient.on('connect', () => {
      developmentLogger.debug('🔌 Redis client connecting...');
    });

    redisClient.on('ready', () => {
      developmentLogger.debug('🎉 Redis client connected and ready');
    });

    redisClient.on('error', (error) => {
      productionLogger.error('❌ Redis client error:', error);
      productionLogger.error('❌ Redis client status:', redisClient?.status);
      // Reset client on error so it can be recreated
      redisClient = null;
    });

    redisClient.on('close', () => {
      developmentLogger.debug('🔌 Redis client connection closed');
    });

    return redisClient;
  } catch (error) {
    productionLogger.error("❌ Failed to create Redis client:", error);
    return null;
  }
}

/**
 * Create a new Redis client instance (not recommended for most use cases).
 * Use getRedisClient() instead for connection reuse.
 */
export function createRedisClient(): Redis | null {
  const redisUrl =
    process.env.REDIS_URL ||
    (process.env.NODE_ENV === "development" ? "redis://localhost:6380" : "");

  if (!redisUrl) {
    developmentLogger.warn("Redis not configured. Set REDIS_URL environment variable.");
    return null;
  }

  try {
    const client = new Redis(redisUrl);
    developmentLogger.debug("New Redis client created successfully");
    return client;
  } catch (error) {
    productionLogger.error("Failed to create Redis client:", error);
    return null;
  }
}

/**
 * Close the Redis client connection
 */
export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
    developmentLogger.debug("Redis client disconnected");
  }
}