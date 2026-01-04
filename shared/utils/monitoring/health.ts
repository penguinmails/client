/**
 * Health Check Utilities
 * 
 * Utilities for validating NileDB configuration and connectivity
 */

import { NileConfig } from '@/shared/config/nile-config';

/**
 * Validate NileDB configuration
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
      const { createNileConfig } = await import('@/shared/config/nile-config');
      const config = createNileConfig();
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