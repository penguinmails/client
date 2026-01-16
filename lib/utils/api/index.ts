/**
 * API Controller Utilities
 *
 * Wrapper functions to abstract away boilerplate error handling and success responses
 * for consistent API route patterns.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
  EnhancedApiResponse
} from '@/types';
import {
  handleSupportedError,
  toSupportedError,
  ErrorLogContext
} from '@/lib/nile/errors';
import { productionLogger } from '@/lib/logger';

/**
 * API Controller Handler Options
 */
export interface ApiControllerOptions<_T> {
  /**
   * Controller name for logging and analytics
   */
  controllerName: string;

  /**
   * Operation name for more specific tracking
   */
  operation?: string;

  /**
   * Request object for context
   */
  req: NextRequest;

  /**
   * Additional logging context
   */
  logContext?: Omit<ErrorLogContext, 'operation' | 'url'>;

  /**
   * Success message template
   */
  successMessage?: string;

  /**
   * Custom error handler (optional)
   */
  customErrorHandler?: (error: unknown, context: ErrorLogContext) => ApiErrorResponse;
}

/**
 * Higher-Order Function for API GET controllers with error catching
 */
export async function withQueryErrorCatch<T>(
  controllerFn: (req: NextRequest) => Promise<T>,
  options: ApiControllerOptions<T>
): Promise<NextResponse<EnhancedApiResponse<T>>> {
  const { controllerName, operation, req, logContext, successMessage, customErrorHandler } = options;

  try {
    const data = await controllerFn(req);

    // Auto-generate success message if not provided
    const autoSuccessMessage = successMessage ||
      generateSuccessMessage(controllerName, operation || 'get');

    const successResponse: ApiSuccessResponse<T> = {
      success: true,
      data,
      message: autoSuccessMessage,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    return handleControllerError(error, {
      controllerName,
      operation: operation || `get_${controllerName.toLowerCase()}`,
      req,
      logContext,
      customErrorHandler
    });
  }
}

/**
 * Higher-Order Function for API POST/PUT/PATCH controllers with error catching
 */
export async function withMutationErrorCatch<T>(
  controllerFn: (req: NextRequest) => Promise<T>,
  options: ApiControllerOptions<T>
): Promise<NextResponse<EnhancedApiResponse<T>>> {
  const { controllerName, operation, req, logContext, successMessage, customErrorHandler } = options;

  try {
    const data = await controllerFn(req);

    // Auto-generate success message if not provided
    const autoSuccessMessage = successMessage ||
      generateSuccessMessage(controllerName, operation || 'create');

    const successResponse: ApiSuccessResponse<T> = {
      success: true,
      data,
      message: autoSuccessMessage,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    return handleControllerError(error, {
      controllerName,
      operation: operation || `${controllerName.toLowerCase()}_mutation`,
      req,
      logContext,
      customErrorHandler
    });
  }
}

/**
 * Higher-Order Function for API DELETE controllers with error catching
 * Body is optional for DELETE operations
 */
export async function withDeleteErrorCatch<T = void>(
  controllerFn: (req: NextRequest) => Promise<T>,
  options: ApiControllerOptions<T>
): Promise<NextResponse<EnhancedApiResponse<T>>> {
  const { controllerName, operation, req, logContext, successMessage, customErrorHandler } = options;

  try {
    const data = await controllerFn(req);

    // Auto-generate success message if not provided
    const autoSuccessMessage = successMessage ||
      generateSuccessMessage(controllerName, operation || 'delete');

    const successResponse: ApiSuccessResponse<T> = {
      success: true,
      data,
      message: autoSuccessMessage,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    return handleControllerError(error, {
      controllerName,
      operation: operation || `delete_${controllerName.toLowerCase()}`,
      req,
      logContext,
      customErrorHandler
    });
  }
}

/**
 * Centralized error handler for all controllers
 */
function handleControllerError(
  error: unknown,
  {
    controllerName,
    operation,
    req,
    logContext,
    customErrorHandler
  }: {
    controllerName: string;
    operation: string;
    req: NextRequest;
    logContext?: Omit<ErrorLogContext, 'operation' | 'url'>;
    customErrorHandler?: (error: unknown, context: ErrorLogContext) => ApiErrorResponse;
  }
): NextResponse<ApiErrorResponse> {
  // Log the error with full context
  productionLogger.error(`[API/${controllerName}] Error in ${operation}:`, error);

  // Build complete error context
  const errorContext: ErrorLogContext = {
    operation,
    url: req.url,
    ...logContext
  };

  // Use custom error handler if provided
  if (customErrorHandler) {
    const customResponse = customErrorHandler(error, errorContext);
    return NextResponse.json(customResponse, { status: 500 });
  }

  // Convert to supported error and handle with our utilities
  const supportedError = toSupportedError(error);
  const { body, status } = handleSupportedError(supportedError, errorContext);

  // Check if this is an authentication error and handle it specially
  const errorBody = body as { error?: string; code?: string; context?: Record<string, unknown> };
  const isAuthError = status === 401 || errorBody.code === 'AUTH_REQUIRED' || errorBody.error?.includes('Authentication');
  
  if (isAuthError) {
    productionLogger.info(`[API/${controllerName}] Authentication error detected, returning 401`);
    // Add a header to indicate this is an auth error for client-side handling
    const authErrorResponse: ApiErrorResponse = {
      success: false,
      error: errorBody.error || "Authentication required",
      code: errorBody.code || "AUTH_REQUIRED",
      details: { ...(errorBody.context || {}), requiresAuth: true },
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(authErrorResponse, { 
      status: 401,
      headers: {
        'X-Auth-Error': 'true'
      }
    });
  }

  // Ensure the error response matches ApiErrorResponse type for non-auth errors
  const errorResponse: ApiErrorResponse = {
    success: false,
    error: typeof body.error === 'string' ? body.error : "Internal server error",
    code: typeof body.code === 'string' ? body.code : "INTERNAL_ERROR",
    details: (body.context || {}) as Record<string, unknown>,
    timestamp: new Date().toISOString()
  };

  return NextResponse.json(errorResponse, { status });
}

/**
 * Helper to create success responses with consistent structure
 */
export function createSuccessResponse<T>(
  data: T,
  options: {
    message?: string;
    controllerName?: string;
    operation?: string;
  } = {}
): ApiSuccessResponse<T> {
  const { message, controllerName, operation } = options;

  return {
    success: true,
    data,
    message: message ||
      (controllerName && operation
        ? `${controllerName} ${operation} successful`
        : 'Operation completed successfully'),
    timestamp: new Date().toISOString()
  };
}

/**
 * Helper to create error responses with consistent structure
 */
export function createErrorResponse(
  error: unknown,
  options: {
    message?: string;
    code?: string;
    status?: number;
    controllerName?: string;
    operation?: string;
    context?: Record<string, unknown>;
  } = {}
): { response: ApiErrorResponse; status: number } {
  const { message, code, status: statusCode, controllerName, operation, context } = options;

  // Convert to supported error for consistent handling
  const supportedError = toSupportedError(error);

  // Use our error handler to get consistent response structure
  const { body, status } = handleSupportedError(supportedError, {
    operation: operation || 'custom_error',
    ...(controllerName && { controllerName }),
    ...context
  });

  // Ensure consistent response structure
  const errorResponse: ApiErrorResponse = {
    success: false,
    error: message || (typeof body.error === 'string' ? body.error : "Operation failed"),
    code: code || (typeof body.code === 'string' ? body.code : "OPERATION_FAILED"),
    details: (body.context || {}) as Record<string, unknown>,
    timestamp: new Date().toISOString()
  };

  return {
    response: errorResponse,
    status: statusCode || status || 500
  };
}

/**
 * Helper to create manual error responses (for cases outside try/catch)
 */
export function manualErrorResponse(
  message: string,
  options: {
    code?: string;
    status?: number;
    details?: unknown;
    controllerName?: string;
    operation?: string;
  } = {}
): NextResponse<ApiErrorResponse> {
  const { code, status, details, controllerName, operation } = options;

  const errorResponse: ApiErrorResponse = {
    success: false,
    error: message,
    code: code || "MANUAL_ERROR",
    details: details as Record<string, unknown>,
    timestamp: new Date().toISOString()
  };

  // Log the manual error for consistency
  if (controllerName || operation) {
    productionLogger.warn(`[API/${controllerName || 'Manual'}] ${operation || 'manual_error'}: ${message}`);
  }

  return NextResponse.json(errorResponse, { status: status || 400 });
}

/**
 * Helper function to generate success messages from controller name and operation
 * This allows successMessage to be optional in ApiControllerOptions
 */
function generateSuccessMessage(controllerName: string, operation: string): string {
  // Handle common operation patterns
  if (operation.startsWith('get') || operation === 'retrieve' || operation === 'fetch') {
    return `${controllerName} retrieved successfully`;
  }

  if (operation.startsWith('create') || operation.startsWith('add') || operation.startsWith('post')) {
    return `${controllerName} created successfully`;
  }

  if (operation.startsWith('update') || operation.startsWith('put') || operation.startsWith('patch')) {
    return `${controllerName} updated successfully`;
  }

  if (operation.startsWith('delete') || operation.startsWith('remove')) {
    return `${controllerName} deleted successfully`;
  }

  // Handle mutation operations
  if (operation.includes('mutation') || operation.endsWith('_mutation')) {
    const baseName = operation.replace('_mutation', '').replace('mutation', '');
    return `${baseName} ${controllerName} completed successfully`;
  }

  // Default fallback
  return `${controllerName} operation completed successfully`;
}
