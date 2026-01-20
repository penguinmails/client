import { productionLogger } from "@/lib/logger";

/**
 * Enhanced error handling utilities for Next.js actions
 * Provides structured logging and error classification for production monitoring
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface ErrorContext {
  actionName?: string;
  userId?: string;
  companyId?: string;
  requestId?: string;
  timestamp?: string;
  [key: string]: unknown;
}


export interface ActionErrorContext extends ErrorContext {
  type?: string;
  code?: string;
  field?: string;
  details?: unknown;
}

// ============================================================================
// Error Classification
// ============================================================================

export function classifyError(error: Error): {
  type: 'network' | 'validation' | 'authentication' | 'authorization' | 'not_found' | 'server' | 'unknown';
  retryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
} {
  const message = error.message.toLowerCase();
  
  // Network-related errors
  if (message.includes('network') || message.includes('fetch') || message.includes('timeout') || message.includes('connection')) {
    return { type: 'network', retryable: true, severity: 'medium' };
  }
  
  // Authentication errors
  if (message.includes('unauthorized') || message.includes('authentication') || message.includes('token')) {
    return { type: 'authentication', retryable: false, severity: 'high' };
  }
  
  // Authorization errors
  if (message.includes('forbidden') || message.includes('permission') || message.includes('access denied')) {
    return { type: 'authorization', retryable: false, severity: 'high' };
  }
  
  // Validation errors
  if (message.includes('validation') || message.includes('invalid') || message.includes('bad request')) {
    return { type: 'validation', retryable: false, severity: 'low' };
  }
  
  // Not found errors
  if (message.includes('not found') || message.includes('404')) {
    return { type: 'not_found', retryable: false, severity: 'low' };
  }
  
  // Server errors
  if (message.includes('internal server error') || message.includes('500') || message.includes('server error')) {
    return { type: 'server', retryable: true, severity: 'high' };
  }
  
  return { type: 'unknown', retryable: false, severity: 'medium' };
}


// ============================================================================
// Action Error Handling
// ============================================================================

/**
 * Enhanced action error logging with structured context
 */
export function logActionError(
  error: {
    type?: string;
    message?: string;
    code?: string;
    field?: string;
    details?: unknown;
  },
  context?: {
    actionName?: string;
    userId?: string;
    companyId?: string;
    requestId?: string;
  }
): void {
  // For testing, always log if NODE_ENV is "test" or "development"
  if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test") return;

  productionLogger.error("Action Error", {
    error: {
      type: error.type,
      message: error.message,
      code: error.code,
      field: error.field,
      details: error.details,
    },
    context: context ? { ...context } : {},
  });

  // In production, send to monitoring service
  if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test") {
    productionLogger.error("Action Error", {
      error: {
        type: error.type,
        message: error.message,
        code: error.code,
        field: error.field,
        details: error.details,
      },
      context,
      timestamp: new Date().toISOString(),
    });
  }
}

// ============================================================================
// Error Recovery Helpers
// ============================================================================

/**
 * Determines if an error can be retried based on its type and context
 */
export function isRetryableError(error: Error): boolean {
  const classification = classifyError(error);
  return classification.retryable;
}

/**
 * Provides user-friendly error messages for different error types
 */
export function getUserFriendlyErrorMessage(error: Error): string {
  const classification = classifyError(error);
  
  switch (classification.type) {
    case 'network':
      return "Network connection issue. Please check your internet connection and try again.";
    case 'authentication':
      return "Your session has expired. Please log in again.";
    case 'authorization':
      return "You don't have permission to perform this action.";
    case 'validation':
      return error.message || "Please check your input and try again.";
    case 'not_found':
      return "The requested resource was not found.";
    case 'server':
      return "A server error occurred. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
}

// ============================================================================
// Error Formatting for API Responses
// ============================================================================

/**
 * Formats errors for consistent API response structure
 */
export function formatApiError(error: Error, context?: ErrorContext): {
  error: {
    message: string;
    type: string;
    code?: string;
    details?: unknown;
  };
  requestId?: string;
} {
  const classification = classifyError(error);
  const requestId = context?.requestId || generateRequestId();
  
  return {
    error: {
      message: getUserFriendlyErrorMessage(error),
      type: classification.type,
      code: error.name,
      details: {
        originalMessage: error.message,
        retryable: classification.retryable,
        severity: classification.severity,
      },
    },
    requestId,
  };
}

// ============================================================================
// Request ID Generation
// ============================================================================

/**
 * Generates a unique request ID for error tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// Error Reporting
// ============================================================================

/**
 * Reports errors to external monitoring services (e.g., Sentry, DataDog)
 */
export function reportError(error: Error, context?: ErrorContext): void {
  const classification = classifyError(error);
  
  // Only report high severity errors to external services in production
  if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test" && classification.severity === 'high') {
    // Example: Sentry.captureException(error, { extra: context });
    // Example: DatadogService.reportError(error, context);
    
    productionLogger.error("Reported Error", {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        type: classification.type,
        severity: classification.severity,
      },
      context,
      timestamp: new Date().toISOString(),
    });
  }
}

// ============================================================================
// Error Boundary Helpers
// ============================================================================

/**
 * Enhanced Error interface with additional properties
 */
interface EnhancedError extends Error {
  type?: string;
  code?: string;
  field?: string;
  details?: unknown;
}

/**
 * Creates a standardized error object for consistent handling
 */
export function createActionError(
  message: string,
  type: string = 'unknown',
  code?: string,
  field?: string,
  details?: unknown
): EnhancedError {
  const error = new Error(message) as EnhancedError;
  error.type = type;
  error.code = code;
  error.field = field;
  error.details = details;
  return error;
}

/**
 * Wraps async functions with error handling and logging
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: ErrorContext & { actionName: string }
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const actionError = error instanceof Error ? error : new Error(String(error));
    
    logActionError(actionError, context);
    reportError(actionError, context);
    
    throw actionError;
  }
}
