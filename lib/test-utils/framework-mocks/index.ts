/**
 * Framework Mocks - Generic Testing Utilities
 * 
 * This module exports generic framework mocks that are used across
 * the entire application for testing purposes. These mocks provide
 * consistent behavior for external dependencies and framework APIs.
 */

// Note: These are JavaScript files that use module.exports, so we can't use export *
// Instead, we provide the paths for Jest configuration

/**
 * Framework mock utilities for Jest configuration
 */
export const frameworkMockPaths = {
  'client-only': require.resolve('./client-only.js'),
  'server-only': require.resolve('./server-only.js'),
  '@niledatabase/react': require.resolve('./nile-database.js'),
  '@niledatabase/server': require.resolve('./nile-database.js'),
  'next-intl': require.resolve('./next-intl.js'),
  'next/headers': require.resolve('./next/headers.js'),
  'next/navigation': require.resolve('./next/navigation.js'),
};

/**
 * Helper function to configure Jest with framework mocks
 */
export function configureFrameworkMocks(jestConfig: {
  moduleNameMapping?: Record<string, string>;
  [key: string]: unknown;
}) {
  return {
    ...jestConfig,
    moduleNameMapping: {
      ...jestConfig.moduleNameMapping,
      ...frameworkMockPaths,
    },
  };
}
