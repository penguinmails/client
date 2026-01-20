import { NextRequest } from 'next/server';

/**
 * Standardized API and Server Action response types
 * Part of the FSD shared layer
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: unknown;
  timestamp?: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp?: string;
}

export type EnhancedApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface FormValidationError {
  field: string;
  message: string;
  code?: string;
}

export type FormHandlerResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; validationErrors?: FormValidationError[] };

export interface FormHandlerParams<T = Record<string, unknown>> {
  data: T;
  req: NextRequest;
}
