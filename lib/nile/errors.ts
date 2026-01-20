/**
 * Nile Data Layer Error Handling
 *
 * Comprehensive error classes and utilities for consistent error handling
 * across the data access layer.
 */

import { productionLogger, developmentLogger } from '@/lib/logger';

/**
 * Supported error types for better type safety
 */
export type SupportedError =
  | Error
  | DataError
  | AuthenticationError
  | SessionExpiredError
  | InvalidCredentialsError
  | InsufficientPrivilegesError
  | ResourceNotFoundError
  | ValidationError
  | ConflictError
  | DatabaseError
  | TypeError
  | RangeError
  | SyntaxError
  | URIError
  | EvalError
  | AggregateError;

// Base Error Classes
export class DataError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly timestamp: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = 'DATA_ERROR',
    statusCode: number = 500,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.context = context;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      timestamp: this.timestamp,
      ...(this.context && { context: this.context }),
    };
  }
}

// Authentication Errors
export class AuthenticationError extends DataError {
  constructor(
    message: string,
    code: string = 'AUTH_REQUIRED',
    context?: Record<string, unknown>
  ) {
    super(message, code, 401, context);
  }
}

export class SessionExpiredError extends AuthenticationError {
  constructor(message: string = 'Session has expired') {
    super(message, 'SESSION_EXPIRED');
  }
}

export class InvalidCredentialsError extends AuthenticationError {
  constructor(message: string = 'Invalid credentials provided') {
    super(message, 'INVALID_CREDENTIALS');
  }
}

export class InsufficientPrivilegesError extends AuthenticationError {
  constructor(
    message: string = 'Insufficient privileges',
    requiredRole?: string,
    currentRole?: string
  ) {
    super(message, 'INSUFFICIENT_PRIVILEGES', {
      requiredRole,
      currentRole,
    });
    // Override statusCode after construction
    Object.defineProperty(this, 'statusCode', { value: 403, writable: false });
  }
}

// Resource Errors
export class ResourceNotFoundError extends DataError {
  constructor(
    message: string = 'Resource not found',
    resourceType?: string,
    resourceId?: string
  ) {
    super(message, 'RESOURCE_NOT_FOUND', 404, { resourceType, resourceId });
  }
}

export class ValidationError extends DataError {
  constructor(
    message: string = 'Input validation failed',
    validationErrors?: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 400, { validationErrors });
  }
}

export class ConflictError extends DataError {
  constructor(
    message: string = 'Resource conflict',
    conflictType?: string,
    conflictDetails?: Record<string, unknown>
  ) {
    super(message, 'CONFLICT_ERROR', 409, { conflictType, ...conflictDetails });
  }
}

// Database Errors
export class DatabaseError extends DataError {
  constructor(
    message: string,
    code: string = 'DATABASE_ERROR',
    originalError?: Error,
    context?: Record<string, unknown>
  ) {
    super(message, code, 500, {
      ...context,
      originalError: originalError?.message,
    });
  }
}

// Nile Specific Errors
export class DuplicateEmailError extends ConflictError {
  public readonly isVerified: boolean;

  constructor(
    message: string = 'Email address already registered',
    email?: string,
    isVerified: boolean = false
  ) {
    super(
      message,
      'duplicate_email',
      {
        email,
        isVerified
      }
    );
    this.isVerified = isVerified;
    // Override code for specific detection
    Object.defineProperty(this, 'code', {
      value: isVerified ? 'EMAIL_ALREADY_EXISTS_VERIFIED' : 'EMAIL_ALREADY_EXISTS_UNVERIFIED',
      writable: false
    });
  }
}

export const isDuplicateEmailError = (error: unknown): error is DuplicateEmailError => {
  return error instanceof DuplicateEmailError;
};

// Error Classification
export const classifyDatabaseError = (error: unknown): DatabaseError => {
  let pgError: Record<string, unknown> | undefined;

  // Try to extract PostgreSQL error information
  if (error && typeof error === 'object') {
    // Check for PostgreSQL error structure
    if ('code' in error && typeof error.code === 'string') {
      pgError = error as Record<string, unknown>;
    }
    // Check for nested error structure
    else if ('error' in error && typeof error.error === 'object' && error.error !== null) {
      pgError = (error as { error: Record<string, unknown> }).error;
    }
  }

  const code = pgError?.code as string | undefined;

  // PostgreSQL error codes
  switch (code) {
    case '23505': // unique_violation
      // Check if it's an email duplicate
      const detail = pgError?.detail as string | undefined;
      if (detail && detail.includes('email')) {
        // Extract email from error detail if possible
        const emailMatch = detail.match(/\(email\)=\(([^)]+)\)/);
        const email = emailMatch ? emailMatch[1] : undefined;

        return new DuplicateEmailError(
          'Email address already registered',
          email,
          false // We'll check verification status in auth.ts
        );
      }

      // Generic conflict error for other unique violations
      return new ConflictError('Duplicate entry detected', 'unique_violation', {
        constraint: pgError?.constraint as string | undefined,
        detail: pgError?.detail as string | undefined,
      });

    default:
      // Generic database error for other cases
      developmentLogger.error('Unknown error occurred', error);
      return new DatabaseError(
        'Database operation failed',
        'DATABASE_OPERATION_FAILED',
        error instanceof Error ? error : undefined
      );
  }
};

export const isNileDBError = (error: unknown): error is DatabaseError => {
  return error instanceof DatabaseError;
};

// Error Utilities
export const isDataError = (error: unknown): error is DataError => {
  return error instanceof DataError;
};

export const isAuthenticationError = (error: unknown): error is AuthenticationError => {
  return error instanceof AuthenticationError;
};

// Error Logging Utilities
export interface ErrorLogContext {
  userId?: string;
  tenantId?: string;
  companyId?: string;
  operation?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  [key: string]: unknown;
}

export const logError = (
  error: unknown,
  context: ErrorLogContext = {},
  level: 'error' | 'warn' | 'info' = 'error'
): void => {
  // Helper function to safely extract error information
  const extractErrorInfo = (error: unknown) => {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (typeof error === 'string') {
      return {
        name: 'StringError',
        message: error,
        stack: undefined,
      };
    } else if (error && typeof error === 'object') {
      return {
        name: 'ObjectError',
        message: JSON.stringify(error),
        stack: undefined,
      };
    } else {
      return {
        name: 'UnknownError',
        message: String(error),
        stack: undefined,
      };
    }
  };

  const errorInfo = extractErrorInfo(error);
  const logData = {
    timestamp: new Date().toISOString(),
    level,
    error: {
      name: errorInfo.name,
      message: errorInfo.message,
      stack: errorInfo.stack,
      ...(isDataError(error) && {
        code: error.code,
        statusCode: error.statusCode,
        context: error.context,
      }),
    },
    context,
  };

  switch (level) {
    case 'error':
      productionLogger.error('Data Layer Error:', logData);
      break;
    case 'warn':
      productionLogger.warn('Data Layer Warning:', logData);
      break;
    case 'info':
      developmentLogger.info('Data Layer Info:', logData);
      break;
  }
};

// Error Response Utilities for API Routes
export const createErrorResponse = (
  error: unknown,
  context?: ErrorLogContext
): { body: Record<string, unknown>; status: number } => {
  // Log the error
  logError(error, context);

  if (isDataError(error)) {
    return {
      body: error.toJSON(),
      status: error.statusCode,
    };
  }

  // Handle unknown errors
  const unknownError = new DataError(
    'An unexpected error occurred',
    'INTERNAL_SERVER_ERROR',
    500
  );

  return {
    body: unknownError.toJSON(),
    status: unknownError.statusCode,
  };
};

// Enhanced error handler that can work with SupportedError types
export const handleSupportedError = (
  error: SupportedError,
  context?: ErrorLogContext
): { body: Record<string, unknown>; status: number } => {
  // Log the error
  logError(error, context);

  if (isDataError(error)) {
    return {
      body: error.toJSON(),
      status: error.statusCode,
    };
  }

  // Handle standard JavaScript errors
  if (error instanceof Error) {
    const handledError = new DataError(
      error.message,
      error.name === 'Error' ? 'GENERIC_ERROR' : error.name,
      500,
      {
        originalError: error.name,
        ...(error.stack && { stack: error.stack.split('\n').slice(0, 3).join('\n') })
      }
    );
    return {
      body: handledError.toJSON(),
      status: handledError.statusCode,
    };
  }

  // Fallback for any other SupportedError types
  const fallbackError = new DataError(
    'An error occurred',
    'HANDLED_ERROR',
    500
  );

  return {
    body: fallbackError.toJSON(),
    status: fallbackError.statusCode,
  };
};

// Type guard for SupportedError
export const isSupportedError = (error: unknown): error is SupportedError => {
  return error instanceof Error ||
         error instanceof DataError ||
         error instanceof AuthenticationError ||
         error instanceof SessionExpiredError ||
         error instanceof InvalidCredentialsError ||
         error instanceof InsufficientPrivilegesError ||
         error instanceof ResourceNotFoundError ||
         error instanceof ValidationError ||
         error instanceof ConflictError ||
         error instanceof DatabaseError;
};

// Utility to safely convert unknown to SupportedError
export const toSupportedError = (error: unknown): SupportedError => {
  if (isSupportedError(error)) {
    return error;
  }

  if (typeof error === 'string') {
    return new Error(error);
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return new Error(String(error.message));
  }

  return new Error('Unknown error occurred');
};
