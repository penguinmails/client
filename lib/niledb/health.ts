import { NileConfig } from './config';

/**
 * Validate NileDB configuration and connectivity
 */
export const validateConfiguration = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required environment variables
  const requiredVars = ['NILEDB_API_URL', 'NILEDB_USER', 'NILEDB_PASSWORD', 'NILEDB_POSTGRES_URL'];
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }

  // Validate URL formats
  const needsProductionSecurity = !['development', 'local', 'test'].includes(process.env.NODE_ENV || '');

  if (needsProductionSecurity && process.env.NILEDB_API_URL && !process.env.NILEDB_API_URL.startsWith('https://')) {
    errors.push('NILEDB_API_URL must be a valid HTTPS URL');
  }

  if (process.env.NILEDB_POSTGRES_URL && !process.env.NILEDB_POSTGRES_URL.startsWith('postgres://')) {
    errors.push('NILEDB_POSTGRES_URL must be a valid PostgreSQL connection string');
  }

  // Validate Redis URL if provided
  if (process.env.REDIS_URL && !process.env.REDIS_URL.startsWith('redis://')) {
    errors.push('REDIS_URL must be a valid Redis connection string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Test NileDB connectivity
 */
export const testConnectivity = async (config: NileConfig): Promise<{ isConnected: boolean; errors: string[] }> => {
  const errors: string[] = [];

  try {
    // Test API connectivity
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const apiResponse = await fetch(`${config.apiUrl}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!apiResponse.ok) {
      errors.push(`API health check failed with status ${apiResponse.status}`);
    }
  } catch (error) {
    errors.push(`API connectivity test failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  // Test database connectivity for each database
  for (const [dbName, dbConfig] of Object.entries(config.databases)) {
    try {
      // Note: In a real implementation, you'd use a PostgreSQL client to test connections
      // For now, we'll just validate the URL format
      const url = new URL(dbConfig.url);
      if (url.protocol !== 'postgres:') {
        errors.push(`${dbName} database URL is not a valid PostgreSQL URL`);
      }
    } catch (error) {
      errors.push(`${dbName} database URL validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return {
    isConnected: errors.length === 0,
    errors,
  };
};

/**
 * Get health status summary
 */
export const getHealthStatus = async (): Promise<{
  configuration: { isValid: boolean; errors: string[] };
  connectivity: { isConnected: boolean; errors: string[] };
  overall: boolean;
}> => {
  const configValidation = validateConfiguration();

  let connectivity: { isConnected: boolean; errors: string[] } = { isConnected: true, errors: [] };
  if (configValidation.isValid) {
    try {
      const config = await import('./config').then(m => m.createNileConfig());
      connectivity = await testConnectivity(config);
    } catch (error) {
      connectivity = { isConnected: false, errors: [`Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`] };
    }
  }

  return {
    configuration: configValidation,
    connectivity,
    overall: configValidation.isValid && connectivity.isConnected,
  };
};