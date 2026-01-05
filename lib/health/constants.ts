/**
 * Health Check Constants
 */

export const VERSION = process.env.npm_package_version || '0.1.0';

// 1 minute = 60000 milliseconds
export const DOWNTIME_THRESHOLD_MS = 60 * 1000;
