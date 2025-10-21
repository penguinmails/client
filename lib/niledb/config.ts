/**
 * NileDB Configuration Types
 */
export interface DatabaseConfig {
  name: string;
  url: string;
  user: string;
  password: string;
}

export interface NileConfig {
  apiUrl: string;
  user: string;
  password: string;
  postgresUrl: string;
  databaseName: string;
  databases: {
    oltp: DatabaseConfig;
    olap: DatabaseConfig;
    messages: DatabaseConfig;
    queue: DatabaseConfig;
  };
}

/**
 * Create NileDB configuration with environment-specific settings
 * Supports multiple databases for different purposes (oltp, olap, messages, queue)
 */
export const createNileConfig = (): NileConfig => {
  const apiUrl = process.env.NILEDB_API_URL;
  const user = process.env.NILEDB_USER;
  const password = process.env.NILEDB_PASSWORD;
  const postgresUrl = process.env.NILEDB_POSTGRES_URL;

  if (!apiUrl || !user || !password || !postgresUrl) {
    throw new Error('Missing required NileDB environment variables');
  }

  // Extract base database name from URL for backward compatibility
  const databaseName = extractDatabaseNameFromUrl(postgresUrl);

  return {
    apiUrl,
    user,
    password,
    postgresUrl,
    databaseName,
    // Multiple database connections for different purposes
    databases: {
      oltp: createDatabaseConfig('oltp', 5443),
      olap: createDatabaseConfig('olap', 5444),
      messages: createDatabaseConfig('messages', 5445),
      queue: createDatabaseConfig('queue', 5446),
    },
  };
};

/**
 * Create configuration for a specific database
 */
function createDatabaseConfig(name: string, port: number): { name: string; url: string; user: string; password: string } {
  const user = process.env.NILEDB_USER || '';
  const password = process.env.NILEDB_PASSWORD || '';

  return {
    name,
    url: `postgres://${user}:${password}@localhost:${port}/${name}`,
    user,
    password,
  };
}

/**
 * Extract database ID from API URL for backward compatibility
 */
function extractDatabaseIdFromUrl(apiUrl: string): string {
  if (!apiUrl) return '';
  if(['development', 'local', 'test'].includes(process.env.NODE_ENV)) return 'test';

  // Extract from URL like: https://us-west-2.api.thenile.dev/v2/databases/01988a31-7e7a-7bc7-a089-92bc09d501d4
  const match = apiUrl.match(/\/databases\/([a-zA-Z0-9-]+)(?:\/|$)/);
  return match ? match[1] : '';
}

/**
 * Extract database name from Postgres URL
 */
function extractDatabaseNameFromUrl(postgresUrl: string): string {
  try {
    const url = new URL(postgresUrl);
    return url.pathname.slice(1); // Remove leading slash
  } catch {
    return 'test'; // Default fallback
  }
}