import Redis from "ioredis";

let redisClient: Redis | null = null;

/**
 * Get a singleton Redis client instance.
 * Creates the client on first call and reuses it for subsequent calls.
 */
export function getRedisClient(): Redis | null {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl =
    process.env.REDIS_URL ||
    (process.env.NODE_ENV === "development" ? "redis://localhost:6379" : "");

  if (!redisUrl) {
    console.warn("Redis not configured. Set REDIS_URL environment variable.");
    return null;
  }

  try {
    redisClient = new Redis(redisUrl);
    console.log("Redis client configured successfully");

    // Handle connection errors
    redisClient.on('error', (error) => {
      console.error('Redis client error:', error);
      // Reset client on error so it can be recreated
      redisClient = null;
    });

    // Handle connection ready
    redisClient.on('ready', () => {
      console.log('Redis client connected and ready');
    });

    return redisClient;
  } catch (error) {
    console.error("Failed to create Redis client:", error);
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
    (process.env.NODE_ENV === "development" ? "redis://localhost:6379" : "");

  if (!redisUrl) {
    console.warn("Redis not configured. Set REDIS_URL environment variable.");
    return null;
  }

  try {
    const client = new Redis(redisUrl);
    console.log("New Redis client created successfully");
    return client;
  } catch (error) {
    console.error("Failed to create Redis client:", error);
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
    console.log("Redis client disconnected");
  }
}