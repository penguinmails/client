import type { NextRequest } from 'next/server';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
export interface EnhancedApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
  timestamp?: string;
  details?: Record<string, unknown>;
  code?: string;
}
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp?: string;
  [key: string]: unknown;
}
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  timestamp?: string;
  details?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export type FormHandlerParams<T = Record<string, unknown>> = {
  data: T;
  req: NextRequest;
};
export type FormHandlerResult<T = Record<string, unknown>> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: FormValidationError[];
  validationErrors?: FormValidationError[];
};
export interface FormValidationError {
  code?: string;
  message: string;
  field?: string;
}

export interface ActionResult<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

// Type guard functions
export function isActionSuccess<T>(result: ActionResult<T>): result is ActionResult<T> & { success: true; data: T } {
  return result.success === true;
}

export function isActionError<T>(result: ActionResult<T>): result is ActionResult<T> & { success: false; error: string } {
  return result.success === false;
}


