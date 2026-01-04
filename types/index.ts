// Barrel exports for all centralized TypeScript types
// This allows importing types from '@/types' 

// ============================================================================
// SHARED TYPES (Root types directory) - EXPORT FIRST
// ============================================================================

// Common utility types
export {
  type ID,
  type Timestamp,
  type Status,
  type DisplayStatus,
  type BaseEntity,
  type PaginationParams,
  type PaginatedResponse,
  type SelectOption,
  type MetricData,
  type BillingAddress,
  type TeamMember,
  type MailboxWarmupData,
  type WarmupChartData,
} from "./common";

// Core types for utilities (exported to avoid circular deps)
export {
  type CoreUser,
  type CoreCompany,
  type CoreTeam,
  type CoreTenant,
  CoreUserRole,
  CoreTeamRole,
} from "./core";

// Utility functions
export * from "./utils";


// Company types (Auth/Relationship-aware)
export {
  type CompanySettings,
  type CompanyInfo,
  mapCompanyInfoToCompany,
  createDefaultCompanySettings,
} from "./company";

// API Response types (Standard ActionResult, ApiResponse)
export * from "./api";

// UI and component prop types (Includes ComponentProps)
export * from "./ui";

// Other legacy/unmigrated types
export * from "./templates";
export * from "./accounts"; // Added accounts exports
export * from "./nav-link";
export * from "./notification";
export * from "./tab";
export * from "./test-utils";
export * from "./utils";
export * from "./onboarding";

// ============================================================================
// FEATURE TYPES (Re-exported from features)
// ============================================================================

// Auth
export {
  UserRole,
  AuthErrorCodes,
  type Tenant,
  type AuthErrorCode,
  type NileDBUser,
} from "@features/auth/types";

// Billing (Selective to avoid BillingAddress conflict)
export * from "@features/billing/types";

// Campaigns (Avoiding CampaignStatus collision)
export {
  CampaignStatusEnum,
  CampaignEventCondition,
  type CampaignStatusType,
  type EmailEventType,
  type CampaignMetrics,
  type Campaign, 
  type CampaignLead,
  type CampaignDisplay,
  type StatsCardData,
  type Step,
  type ChartData,
  type MetricToggle,
  type CampaignStep,
  type SequenceStep,
  type CampaignFormValues,
  type CampaignFormProps,
  type CampaignSteps,
  type PartialCampaignStep,
  type CampaignPerformanceData,
  type WarmupSummaryData,
  type Client,
} from "@features/campaigns/types";


// Domains (Avoiding DomainAnalytics collision)
export {
  type DNSRecordType,
  type DNSRecordStatus,
  type DomainStatus,
  type EmailAccountStatus,
  VerificationStatus,
  RelayType,
  DomainAccountCreationType,
  ACCOUNT_STATUSES,
  WarmupStatus,
  type WarmupStatusType,


  type DNSRecord,
  type Domain,
  type DomainDB,
  type EmailAccount,
  type AddDomainFormValues,
  type DomainSettingsFormValues,
  type EmailAccountFormValues,
  type EmailAccountFormProps,
} from "@features/domains/types";

// Inbox
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
} from "@features/inbox/types";

// Settings (Selective exports to avoid circular deps)
export {
  type AppearanceSettingsEntity,
  type SecuritySettings,
  type NotificationPreferences,
  type TeamMembersResponse as SettingsTeamMembersResponse,
  type TeamSettingsProps,
  type TeamMemberUpdate,
  type CreateTeamMember,
  type GeneralSettings,
  type AllSettings,
  type TrackingSettings,
  type CompanyProfile,
  type ProfileFormValues,
  profileFormSchema,
} from "@features/settings/types";

// Team
export {
  type TeamRole,
  type TeamMemberStatus,
  type TeamPermission,
  type TeamInvite,
  type TeamActivity,
  type Team,
  type TeamStats,
  type TeamMembersResponse,
} from "@features/team/types";

// Analytics
export * from "@features/analytics/types";

// ============================================================================
// EXPLICIT RE-EXPORTS & ALIASES (Resolving Conflicts)
// ============================================================================

// Resolve collisions and provide primary types
export type { AppearanceSettingsEntity as AppearanceSettings } from "@features/settings/types";
export type { TeamMember as SettingsTeamMember } from "@features/settings/types";
export type { Campaign as InboxCampaign } from "@features/inbox/types";
export type { Client as InboxClient } from "@features/inbox/types";


// Analytics aliases
export type {
  DomainAnalytics as AnalyticsDomainAnalytics,
  CampaignStatus as AnalyticsCampaignStatus,
  WarmupStatus as AnalyticsWarmupStatus,
  LeadStatus as AnalyticsLeadStatus,
} from "@features/analytics/types/domain-specific";
