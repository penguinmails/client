/**
 * Logger Module
 * 
 * Public API for logging utilities.
 * Part of the FSD shared layer.
 */

export type { Logger, LoggerConfig, LogLevel } from './types';
export {
  logger,
  developmentLogger,
  productionLogger,
  createLogger
} from './logger';
