/**
 * Common building block types
 * Part of the FSD shared layer
 */

import type { NextRequest } from 'next/server';
import type { ComponentType } from 'react';

// Custom component type constraint to avoid 'any' in linter
export type AnyComponentType = ComponentType<Record<string, unknown>>;

export type ID = string | number;

export type Timestamp = string; // ISO date string

export type Status = "active" | "inactive" | "pending" | "error";

export type DisplayStatus =
  | "Running"
  | "Paused"
  | "Draft"
  | "Completed"
  | "Archived";

export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

export interface MetricData {
  total: number;
  rate?: number;
  trend?: "up" | "down" | "stable";
}

// Billing Address (Shared across Billing and Settings)
export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string; // ISO country code
}

// Team Member (Shared across Team and Settings)
export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: string;
  status: "active" | "invited" | "disabled" | "inactive" | "pending";
  joinedAt?: string;
  lastActive?: string;
}

// Company (Shared across multiple features)
export interface Company {
  id: string | number;
  tenantId: string;
  name: string;
}


// Analytics shared types
export interface MailboxWarmupData {
  id: string;
  name?: string;
  email: string;
  status: "active" | "warming" | "paused" | "inactive" | "error";
  warmupProgress: number;
  dailyVolume: number;
  healthScore: number;
  domain: string;
  createdAt: string;
}

export interface WarmupChartData {
  date: string;
  totalWarmups: number;
  spamFlags: number;
  replies: number;
}

// Export additional types for test compatibility
export type ComponentProps<T extends AnyComponentType = AnyComponentType> = React.ComponentProps<T>;
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
