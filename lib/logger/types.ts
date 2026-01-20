/**
 * Logger Types
 * 
 * Type definitions for the logging system.
 * Part of the FSD shared layer.
 */

export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

export interface LoggerConfig {
  environment: 'development' | 'staging' | 'production';
  enableConsole: boolean;
  enableRemoteLogging: boolean;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
