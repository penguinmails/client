/**
 * Environment Detection Utilities
 * 
 * Centralized environment detection for the entire application.
 * Part of the FSD shared layer.
 */

export type Environment = 'development' | 'staging' | 'production';

/**
 * Get the current runtime environment
 */
export function getEnvironment(): Environment {
  const env = process.env.NODE_ENV as string;
  
  if (env === 'production') return 'production';
  if (env === 'staging') return 'staging';
  return 'development';
}

/**
 * Environment check helpers
 */
export const isDevelopment = (): boolean => getEnvironment() === 'development';
export const isStaging = (): boolean => getEnvironment() === 'staging';
export const isProduction = (): boolean => getEnvironment() === 'production';

/**
 * Check if running in a browser environment
 */
export const isBrowser = (): boolean => typeof window !== 'undefined';

/**
 * Check if running in a server environment
 */
export const isServer = (): boolean => typeof window === 'undefined';
