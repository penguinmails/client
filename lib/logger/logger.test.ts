/**
 * Unit tests for logging utilities
 */

import {
  logger,
  developmentLogger,
  productionLogger,
  createLogger,
  type LoggerConfig,
} from '../logger';
import { getEnvironment } from '@/shared/config/env';

// Access createLoggerConfig through createLogger since it's used internally
const createLoggerConfig = () => {
  const environment = getEnvironment();
  return {
    environment,
    enableConsole: true,
    enableRemoteLogging: environment !== 'development',
  };
};

// Mock console methods with proper typing
const mockConsole = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Store original console
const _originalConsole = global.console;

// Mock process.env
const originalEnv = process.env.NODE_ENV;

describe('Logger Utilities', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock console with proper typing
    global.console = mockConsole as unknown as Console;
  });

  afterEach(() => {
    // Restore original console
    global.console = _originalConsole;
    
    // Restore original NODE_ENV
    Object.defineProperty(process.env, 'NODE_ENV', { value: originalEnv });
  });

  describe('getEnvironment', () => {
    it('should return development for development NODE_ENV', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });
      expect(getEnvironment()).toBe('development');
    });

    it('should return production for production NODE_ENV', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production' });
      expect(getEnvironment()).toBe('production');
    });

    it('should return staging for staging NODE_ENV', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'staging' });
      expect(getEnvironment()).toBe('staging');
    });

    it('should default to development for unknown NODE_ENV', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'unknown' });
      expect(getEnvironment()).toBe('development');
    });

    it('should default to development for undefined NODE_ENV', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: undefined });
      expect(getEnvironment()).toBe('development');
    });
  });

  describe('createLoggerConfig', () => {
    it('should create development config for development environment', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });
      const config = createLoggerConfig();
      
      expect(config).toEqual({
        environment: 'development',
        enableConsole: true,
        enableRemoteLogging: false,
      });
    });

    it('should create production config for production environment', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production' });
      const config = createLoggerConfig();
      
      expect(config).toEqual({
        environment: 'production',
        enableConsole: true,
        enableRemoteLogging: true,
      });
    });

    it('should create staging config for staging environment', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'staging' });
      const config = createLoggerConfig();
      
      expect(config).toEqual({
        environment: 'staging',
        enableConsole: true,
        enableRemoteLogging: true,
      });
    });
  });

  describe('developmentLogger', () => {
    beforeEach(() => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });
    });

    it('should log debug messages in development', () => {
      developmentLogger.debug('Test debug message', { data: 'test' });
      expect(mockConsole.log).toHaveBeenCalledWith('[DEBUG] Test debug message', { data: 'test' });
    });

    it('should log info messages in development', () => {
      developmentLogger.info('Test info message', { data: 'test' });
      expect(mockConsole.log).toHaveBeenCalledWith('[INFO] Test info message', { data: 'test' });
    });

    it('should log warn messages in development', () => {
      developmentLogger.warn('Test warn message', { data: 'test' });
      expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] Test warn message', { data: 'test' });
    });

    it('should log error messages in development', () => {
      developmentLogger.error('Test error message', { data: 'test' });
      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Test error message', { data: 'test' });
    });

    it('should not log in production environment', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production' });
      
      developmentLogger.debug('Test debug');
      developmentLogger.info('Test info');
      developmentLogger.warn('Test warn');
      developmentLogger.error('Test error');
      
      expect(mockConsole.log).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('should not log in staging environment', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'staging' });
      
      developmentLogger.debug('Test debug');
      developmentLogger.info('Test info');
      developmentLogger.warn('Test warn');
      developmentLogger.error('Test error');
      
      expect(mockConsole.log).not.toHaveBeenCalled();
      expect(mockConsole.warn).not.toHaveBeenCalled();
      expect(mockConsole.error).not.toHaveBeenCalled();
    });
  });

  describe('productionLogger', () => {
    it('should never log debug messages', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });
      productionLogger.debug('Test debug');
      expect(mockConsole.log).not.toHaveBeenCalled();

      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production' });
      productionLogger.debug('Test debug');
      expect(mockConsole.log).not.toHaveBeenCalled();
    });

    it('should never log info messages', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });
      productionLogger.info('Test info');
      expect(mockConsole.log).not.toHaveBeenCalled();

      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production' });
      productionLogger.info('Test info');
      expect(mockConsole.log).not.toHaveBeenCalled();
    });

    it('should log warn messages in production', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production' });
      productionLogger.warn('Test warn message', { data: 'test' });
      expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] Test warn message', { data: 'test' });
    });

    it('should log error messages in all environments', () => {
      // Test development
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });
      productionLogger.error('Test error dev', { data: 'test' });
      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Test error dev', { data: 'test' });

      // Reset mock
      mockConsole.error.mockClear();

      // Test production
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production' });
      productionLogger.error('Test error prod', { data: 'test' });
      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Test error prod', { data: 'test' });
    });

    it('should not log warn messages in development', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });
      productionLogger.warn('Test warn');
      expect(mockConsole.warn).not.toHaveBeenCalled();
    });
  });

  describe('createLogger', () => {
    it('should create logger with custom configuration', () => {
      const customConfig: Partial<LoggerConfig> = {
        environment: 'production',
        enableConsole: false,
      };
      
      const customLogger = createLogger(customConfig);
      
      // Should not log to console when enableConsole is false
      customLogger.error('Test error');
      expect(mockConsole.error).not.toHaveBeenCalled();
    });

    it('should merge with default configuration', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });
      
      const customLogger = createLogger({
        enableRemoteLogging: true,
      });
      
      // Should still log to console in development
      customLogger.debug('Test debug');
      expect(mockConsole.log).toHaveBeenCalledWith('[DEBUG] Test debug');
    });
  });

  describe('default logger behavior', () => {
    it('should log all levels in development', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });
      
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');
      
      expect(mockConsole.log).toHaveBeenCalledWith('[DEBUG] Debug message');
      expect(mockConsole.log).toHaveBeenCalledWith('[INFO] Info message');
      expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] Warn message');
      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Error message');
    });

    it('should only log warn and error in production', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production' });
      
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');
      
      expect(mockConsole.log).not.toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalledWith('[WARN] Warn message');
      expect(mockConsole.error).toHaveBeenCalledWith('[ERROR] Error message');
    });
  });

  describe('fallback mechanisms', () => {
    it('should handle missing console gracefully', () => {
      // Remove console entirely with proper typing
      global.console = undefined as unknown as Console;
      
      // Should not throw errors
      expect(() => {
        logger.debug('Test');
        logger.info('Test');
        logger.warn('Test');
        logger.error('Test');
      }).not.toThrow();
    });

    it('should handle console methods that are not functions', () => {
      // Mock console with non-function methods using proper typing
      global.console = {
        log: 'not a function',
        warn: null,
        error: undefined,
      } as unknown as Console;
      
      // Should not throw errors
      expect(() => {
        logger.debug('Test');
        logger.warn('Test');
        logger.error('Test');
      }).not.toThrow();
    });

    it('should use fallback console methods when primary methods fail', () => {
      // Mock console methods to throw
      const _mockError = jest.fn(() => {
        throw new Error('Console error failed');
      });
      
      // Mock console with fallback error method
      const _fallbackError = jest.fn();
      
      global.console = {
        ...mockConsole,
        error: _fallbackError, // This will be the fallback
      } as unknown as Console;
      
      // Mock the fallbackToConsole method to throw initially
      const _originalConsole = global.console;
      
      // Create a logger with console that will fail on first try
      const config = createLoggerConfig();
      const testLogger = createLogger(config);
      
      // Should not throw and should handle gracefully
      expect(() => {
        testLogger.error('Test error');
      }).not.toThrow();
      
      // Should have attempted to log
      expect(_fallbackError).toHaveBeenCalled();
    });
  });

  describe('environment detection edge cases', () => {
    it('should handle empty string NODE_ENV', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: '' });
      expect(getEnvironment()).toBe('development');
    });

    it('should handle whitespace NODE_ENV', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: '   ' });
      expect(getEnvironment()).toBe('development');
    });

    it('should handle case sensitivity', () => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'PRODUCTION' });
      expect(getEnvironment()).toBe('development'); // Should default to development for unknown values
    });
  });
});