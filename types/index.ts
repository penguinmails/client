/**
 * Shared Types
 * 
 * Common types used across multiple features to prevent cross-feature imports
 */

export * from './common';

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

// Auth Types (shared across features) are now in common.ts
export * from './auth';

export interface TenantInfo {
  id: string;
  name: string;
  created: string;
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

// Re-export specific modules moved from shared/types
export {
  type Mailbox,
  type AccountStatsDataPoint,
  type AccountDetails,
  type WarmupAccount,
  type WarmupStatsDataPoint,
  type WarmupResponse,
} from "./accounts";
export * from './admin';
export {
  type PerformanceMetrics,
  type CalculatedRates,
  type TimeSeriesDataPoint,
  type BaseAnalytics,
  type AnalyticsFilters,
  type AnalyticsComputeOptions,
  type FilteredDataset,
  type DataGranularity,
  type CampaignAnalytics,
  // DomainAnalytics is clashing with domains, excluding it if domains has a better one
  // type DomainAnalytics,
  type MailboxAnalytics,
  type LeadAnalytics,
  type TemplateAnalytics,
  type BillingAnalytics,
  // CampaignStatus clashing with campaigns
  // type CampaignStatus,
  // WarmupStatus clashing with domains
  // type WarmupStatus,
  type LeadStatus as AnalyticsLeadStatus,
  type SequenceStepAnalytics,
  type WarmupAnalytics,
  type DailyWarmupStats,
  type AccountMetrics,
  type DateRangePreset,
  type AnalyticsUIFilters,
  type AnalyticsMetricConfig,
  type KPIDisplayConfig,
  type ChartDataPoint,
  type SmartInsightDisplay,
  type AnalyticsLoadingState,
  type AnalyticsDomain,
  type MetricToggleProps,
  type DateRangePickerProps,
  type EntityFilterProps,
  type FormattedAnalyticsStats,
  type PerformanceThresholds,
} from "./analytics";
export * from './api';
// Selectively re-export from campaigns/leads to avoid clashing with common.ts
export { 
  type CampaignStatusEnum as CampaignsStatusEnum,
  type CampaignStatus as CampaignsStatus,
  CampaignStatus as CampaignsStatusConst,
  CampaignSchema,
  CampaignMetricsSchema,
  type CampaignMetrics,
  type CampaignLead,
  type CampaignDisplay,
  type CampaignFormValues,
  type CampaignPerformanceData,
  type SequenceStep,
} from './campaigns';
export {
  type CompanySettings,
  type Company,
  type CompanyInfo,
  mapCompanyInfoToCompany,
  createDefaultCompanySettings,
} from './company';
export * from './core';
export * from './domains';

// Selective re-export from inbox to avoid clashing with campaigns
export {
  type MessageType,
  type ConversationStatus,
  type Message,
  type Conversation,
  type Email,
  type EmailsType,
  type InboxMessage,
  MessageSchema,
  ConversationSchema,
  EmailSchema,
  EmailsTypeSchema
} from './inbox';

// Selective re-export from leads to avoid clashing with campaigns/inbox
export {
  type Lead,
  type LeadList,
  type LeadListData,
  type LeadFilters,
  type LeadListFilters,
  type CSVColumn,
  type CSVRecord,
  type LeadStat,
  type LeadStats,
  LeadStatus,
  LeadListStatus,
  LeadSchema,
  LeadListSchema,
  LeadListDataSchema,
  LeadFiltersSchema,
  LeadListFiltersSchema,
  CSV_COLUMNS,
  // Client related types from legacy leads if they don't clash
  type ClientFormData,
  ClientFormDataSchema,
  ClientStatus,
  type DbLeadList,
  type DbLeadListRow
} from './leads';

export * from './nav-link';
// Explicitly re-export from notification to avoid clashes with legacy-settings
export * from './notification';
export * from './onboarding';
// Explicitly re-export non-clashing settings
export {
  type ClientPreferences,
  isClientPreferences,
  validateClientPreferences,
  isValidTimezone,
  isValidEmail,
  isValidUrl,
  isValidTheme,
  isValidSidebarView,
  isValidDateFormat,
} from './settings';
export * from './tab';
export * from './templates';
export * from './test-utils';
export * from './toolbar';
export * from './ui';
export * from './utils';
