/**
 * Shared Types
 * 
 * Common types used across multiple features to prevent cross-feature imports
 */

// System Health Types
export interface SystemHealthStatus {
  status: "healthy" | "degraded" | "unhealthy" | "unknown";
  lastCheck?: Date;
  details?: string;
  retryInfo?: {
    attempts: number;
    maxAttempts: number;
    backoffDelay: number;
    isAtRetryLimit: boolean;
  };
}

export interface SystemHealthContextValue {
  systemHealth: SystemHealthStatus;
  checkSystemHealth: () => Promise<void>;
  isChecking: boolean;
  retryInfo?: {
    attempts: number;
    maxAttempts: number;
    backoffDelay: number;
    isAtRetryLimit: boolean;
    timeUntilNextRetry: number;
  };
  manualReset: () => void;
}

// Auth Types (shared across features)
export interface BaseUser {
  id: string;
  email: string;
  emailVerified?: boolean;
  role?: string;
}

export interface UserRole {
  ADMIN: "admin";
  SUPER_ADMIN: "super_admin";
  MANAGER: "manager";
  USER: "user";
}

export interface TenantInfo {
  id: string;
  name: string;
  created: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  tenantId: string;
  role?: string;
}

// Common API Response Types
export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Mock Data Types (to prevent cross-feature mock imports)
export interface MockDataProvider<T> {
  getData: () => T[];
  getById: (id: string | number) => T | undefined;
  create: (data: Partial<T>) => T;
  update: (id: string | number, data: Partial<T>) => T | undefined;
  delete: (id: string | number) => boolean;
}

// Common Form Types
export interface FormFieldError {
  message: string;
  type?: string;
}

export interface ValidationResult {
  success: boolean;
  data?: unknown;
  error?: FormFieldError;
}

// Common Component Props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

// Analytics Types (shared)
export interface BaseAnalyticsData {
  id: string;
  name: string;
  value: number;
  change?: number;
  trend?: "up" | "down" | "stable";
}

export interface StatsCardData extends BaseAnalyticsData {
  description?: string;
  icon?: string;
  color?: string;
}

// Domain Types (shared)
export interface DomainAnalyticsData {
  domainId: string;
  metrics: Record<string, number>;
  lastUpdated: Date;
}

// Template Types (shared)
export interface BaseTemplate {
  id: number;
  name: string;
  content: string;
  subject?: string;
  type: "email" | "quick-reply" | "campaign";
  createdAt: Date;
  updatedAt: Date;
}

// Error Types
export interface AppError {
  message: string;
  code?: string;
  type: "validation" | "authentication" | "network" | "unknown";
  details?: Record<string, unknown>;
}

// Pagination Types
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}