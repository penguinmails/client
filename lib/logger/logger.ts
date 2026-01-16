/* eslint-disable no-console */
/**
 * Logger Implementation
 * 
 * Environment-aware logging with graceful fallbacks.
 * Part of the FSD shared layer.
 */

import { getEnvironment } from '@/lib/config/env';
import type { Logger, LoggerConfig, LogLevel } from './types';

/**
 * Get environment helper for test compatibility
 */
export { getEnvironment } from '@/lib/config/env';

/**
 * Safe logger implementation with graceful fallbacks
 */
class SafeLogger implements Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  private fallbackToConsole(
    level: 'log' | 'warn' | 'error',
    message: string,
    ...args: unknown[]
  ) {
    if (this.config.enableConsole && typeof console !== 'undefined') {
      const consoleMethod = console[level];
      if (typeof consoleMethod === 'function') {
        consoleMethod(message, ...args);
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    // In development, log everything
    if (this.config.environment === 'development') {
      return true;
    }
    
    // In staging/production, only log warnings and errors
    return level === 'warn' || level === 'error';
  }

  debug(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('debug')) return;
    
    try {
      if (this.config.environment === 'development') {
        this.fallbackToConsole('log', `[DEBUG] ${message}`, ...args);
      }
    } catch {
      // Silent fallback - debug messages shouldn't break the app
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('info')) return;
    
    try {
      if (this.config.environment === 'development') {
        this.fallbackToConsole('log', `[INFO] ${message}`, ...args);
      }
    } catch {
      // Silent fallback
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('warn')) return;
    
    try {
      this.fallbackToConsole('warn', `[WARN] ${message}`, ...args);
      
      // In production/staging, could send to remote logging service
      if (this.config.enableRemoteLogging && this.config.environment !== 'development') {
        // TODO: Implement remote logging integration (e.g., PostHog, Sentry)
      }
    } catch {
      // Fallback to basic console.warn if available
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(`[WARN] ${message}`, ...args);
      }
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('error')) return;
    
    try {
      this.fallbackToConsole('error', `[ERROR] ${message}`, ...args);
      
      // In production/staging, could send to remote logging service
      if (this.config.enableRemoteLogging && this.config.environment !== 'development') {
        // TODO: Implement remote logging integration (e.g., PostHog, Sentry)
      }
    } catch {
      // Fallback to basic console.error if available
      try {
        if (typeof console !== 'undefined' && console.error && typeof console.error === 'function') {
          console.error(`[ERROR] ${message}`, ...args);
        }
      } catch {
        // Silent failure - logging should never break the application
      }
    }
  }
}

/**
 * Create logger configuration based on environment
 */
function createLoggerConfig(): LoggerConfig {
  const environment = getEnvironment();
  
  return {
    environment,
    enableConsole: true,
    enableRemoteLogging: environment !== 'development',
  };
}

/**
 * Create a custom logger with specific configuration
 */
export function createLogger(config: Partial<LoggerConfig> = {}): Logger {
  const defaultConfig = createLoggerConfig();
  const fullConfig: LoggerConfig = {
    ...defaultConfig,
    ...config,
  };
  
  return new SafeLogger(fullConfig);
}

/**
 * Default logger that adapts to environment
 * - Development: logs everything to console
 * - Staging/Production: logs warnings and errors
 */
export const logger: Logger = {
  debug: (message: string, ...args: unknown[]) => {
    const config = createLoggerConfig();
    const dynamicLogger = new SafeLogger(config);
    dynamicLogger.debug(message, ...args);
  },
  info: (message: string, ...args: unknown[]) => {
    const config = createLoggerConfig();
    const dynamicLogger = new SafeLogger(config);
    dynamicLogger.info(message, ...args);
  },
  warn: (message: string, ...args: unknown[]) => {
    const config = createLoggerConfig();
    const dynamicLogger = new SafeLogger(config);
    dynamicLogger.warn(message, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    const config = createLoggerConfig();
    const dynamicLogger = new SafeLogger(config);
    dynamicLogger.error(message, ...args);
  },
};

/**
 * Development-only logger - only logs in development environment
 */
export const developmentLogger: Logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (getEnvironment() === 'development') {
      logger.debug(message, ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (getEnvironment() === 'development') {
      logger.info(message, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (getEnvironment() === 'development') {
      logger.warn(message, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (getEnvironment() === 'development') {
      logger.error(message, ...args);
    }
  },
};

/**
 * Production logger - only logs errors in all environments, warnings in staging/production
 */
export const productionLogger: Logger = {
  debug: () => {},
  info: () => {},
  warn: (message: string, ...args: unknown[]) => {
    if (getEnvironment() !== 'development') {
      logger.warn(message, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    logger.error(message, ...args);
  },
};

// Export additional utilities for test compatibility
export { createLoggerConfig };
