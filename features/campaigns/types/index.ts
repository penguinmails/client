/**
 * Campaigns Feature - Types & Schemas
 * 
 * Consolidated types and Zod schemas for campaigns.
 */

import { z } from 'zod';
import type { LucideIcon } from 'lucide-react';
import { RefObject } from 'react';

// ============================================================
// Enums & Constants
// ============================================================

export enum CampaignStatusEnum {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  ACTIVE = 'active', // Mapping running/active together if needed
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  ARCHIVED = 'archived'
}

export const CampaignStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type CampaignStatusType = keyof typeof CampaignStatus;
export type CampaignStatus = CampaignStatusType;

export const CampaignEventCondition = {
  ALWAYS: "ALWAYS",
  IF_NOT_OPENED: "IF_NOT_OPENED",
  IF_NOT_CLICKED: "IF_NOT_CLICKED",
  IF_NOT_REPLIED: "IF_NOT_REPLIED",
  IF_OPTION_A: "IF_OPTION_A",
  IF_OPTION_B: "IF_OPTION_B",
  IF_OPTION_C: "IF_OPTION_C",
  IF_OPTION_D: "IF_OPTION_D",
  IF_OPTION_E: "IF_OPTION_E",
  IF_UNSUBSCRIBED: "IF_UNSUBSCRIBED",
} as const;

export type CampaignEventConditionType = keyof typeof CampaignEventCondition;

export type EmailEventType =
  | "SENT"
  | "DELIVERED"
  | "OPENED"
  | "CLICKED"
  | "BOUNCED"
  | "SPAM_COMPLAINT"
  | "UNSUBSCRIBED"
  | "REPLIED";

// ============================================================
// Schemas
// ============================================================

export const CampaignMetricsSchema = z.object({
  recipients: z.object({ sent: z.number(), total: z.number() }),
  opens: z.object({ total: z.number(), rate: z.number() }),
  clicks: z.object({ total: z.number(), rate: z.number() }),
  replies: z.object({ total: z.number(), rate: z.number() }),
  bounces: z.object({ total: z.number(), rate: z.number() }).optional(),
});

export type CampaignMetrics = z.infer<typeof CampaignMetricsSchema>;

export const CampaignSchema = z.object({
  id: z.string().or(z.number()),
  name: z.string(),
  subject: z.string().optional(),
  status: z.nativeEnum(CampaignStatusEnum).or(z.string()).optional(),
  fromName: z.string(),
  fromEmail: z.string().email(),
  metrics: CampaignMetricsSchema,
  lastUpdated: z.string(),
  // Additional fields for compatibility
  totalRecipients: z.number().optional(),
  sent: z.number().optional(),
  delivered: z.number().optional(),
  opened: z.number().optional(),
  clicked: z.number().optional(),
  replied: z.number().optional(),
  bounced: z.number().optional(),
  unsubscribed: z.number().optional(),
  createdAt: z.date().optional(),
  scheduledAt: z.date().optional(),
  completedAt: z.date().optional(),
  leadListId: z.string().optional(),
  mailboxIds: z.array(z.string()).optional(),
  description: z.string().optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
});

export type Campaign = z.infer<typeof CampaignSchema>;

// ============================================================
// UI / Component Types
// ============================================================

export interface CampaignLead {
  id: number | string;
  name: string;
  email: string;
  company: string;
  status: string;
  currentStep: number;
  lastActivity: string;
}

export interface CampaignDisplay {
  id: number;
  openRate?: number;
  replyRate?: number;
  name: string;
  status: CampaignStatusEnum;
  mailboxes: number;
  leadsSent: number;
  replies: number;
  lastSent: string;
  createdDate: string;
  assignedMailboxes: string[];
  leadsList?: {
    id?: number | string;
    name: string;
    description: string;
    contacts: number;
  };
}

export interface StatsCardData {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

export interface Step {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'current' | 'completed';
}

export interface ChartData {
  date: string;
  sent: number;
  opened: number;
  replied: number;
  bounced: number;
  clicked: number;
  formattedDate: string;
}

export interface MetricToggle {
  key: keyof ChartData;
  label: string;
  color: string;
  visible: boolean;
}

// ============================================================
// Form Types (Consolidated)
// ============================================================

export const CampaignStepSchema = z.object({
  id: z.number().optional(),
  sequenceOrder: z.number(),
  delayDays: z.number(),
  delayHours: z.number(),
  templateId: z.number(),
  campaignId: z.number(),
  emailSubject: z.string().optional(),
  emailBody: z.string().optional(),
  condition: z.enum([
    "ALWAYS",
    "IF_NOT_OPENED",
    "IF_NOT_CLICKED",
    "IF_NOT_REPLIED",
    "IF_OPTION_A",
    "IF_OPTION_B",
    "IF_OPTION_C",
    "IF_OPTION_D",
    "IF_OPTION_E",
    "IF_UNSUBSCRIBED"
  ]),
  // Backward compatibility optional fields if needed by UI state
  type: z.enum(['email', 'wait']).optional(),
  order: z.number().optional(),
  
  // Analytics / Display fields
  sent: z.number().optional(),
  opened_tracked: z.number().optional(),
  clicked_tracked: z.number().optional(),
  replied: z.number().optional(),
  completed: z.number().optional(),
  duration: z.string().optional(),
  subject: z.string().optional(),
});




export type CampaignStep = z.infer<typeof CampaignStepSchema>;
export type SequenceStep = CampaignStep;

/**
 * Legacy campaign performance data (precomputed rates).
 * Used by CampaignPerformanceTable for backward compatibility.
 */
export interface CampaignPerformanceData {
  name: string;
  sent: number;
  opens: number;
  clicks: number;
  replies: number;
  bounced: number;
  openRate: number;
  replyRate: number;
}

export interface WarmupSummaryData {
  activeMailboxes: number;
  warmingUp: number;
  readyToSend: number;
  needsAttention: number;
}

export interface Client {
  id?: string | number;
  email: string;
  name?: string;
}




export const CampaignFormSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Campaign name is required"),
  description: z.string().optional(),
  fromName: z.string().min(1, "From name is required"),
  fromEmail: z.string().email("Invalid email address"),
  status: z.enum(["DRAFT", "ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).default("DRAFT"),
  companyId: z.number().optional(),
  createdById: z.string().optional(),
  steps: z.array(CampaignStepSchema).min(1, "At least one step is required"),
  sendDays: z.array(z.number()).optional(),
  sendTimeStart: z.string().optional(),
  sendTimeEnd: z.string().optional(),
  emailsPerDay: z.number().optional(),
  timezone: z.string().optional().default("UTC"),
  clients: z.array(z.string().email("Invalid email address")),
  leadsList: z.object({
    id: z.union([z.string(), z.number()]),
    name: z.string(),
    description: z.string(),
    contacts: z.number(),
  }).optional(),
  selectedMailboxes: z.array(z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
    domain: z.string(),
    status: z.enum(['active', 'inactive', 'warming', 'error']),
    dailyLimit: z.number(),
    currentSent: z.number(),
    warmupProgress: z.number(),
    healthScore: z.number(),
    lastActivity: z.date(),
    createdAt: z.date(),
  })).optional(),
  metrics: z.object({
    recipients: z.object({
      sent: z.number(),
      total: z.number(),
    }).optional(),
    opens: z.object({
      total: z.number(),
      rate: z.number(),
    }).optional(),
    clicks: z.object({
      total: z.number(),
      rate: z.number(),
    }).optional(),
    replies: z.object({
      total: z.number(),
      rate: z.number(),
    }).optional(),
    bounces: z.object({
      total: z.number(),
      rate: z.number(),
    }).optional(),
  }).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type CampaignFormValues = z.infer<typeof CampaignFormSchema>;

export interface CampaignFormProps {
  initialData?: CampaignFormValues;
  onSubmit: (data: CampaignFormValues) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  submitLoadingLabel?: string;
  readOnly?: boolean;
}

// React Hook Form types needed for props
import { Control, UseFormRegister, FieldErrors } from "react-hook-form";
import { MouseEvent } from "react";

// Minimal Template interface to avoid circular dependency
interface Template {
  id: number;
  name: string;
  body: string;
  bodyHtml: string;
  subject: string;
  category: "OUTREACH" | "INTRODUCTION" | "FOLLOW_UP" | "MEETING" | "VALUE" | "SAAS" | "AGENCY" | "CONSULTING" | "ECOMMERCE" | "REAL_ESTATE" | "HR" | "FINANCE" | "HEALTHCARE";
  companyId: number;
  description: string;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CampaignSteps = z.infer<typeof CampaignStepSchema>[];
export type PartialCampaignStep = Partial<z.infer<typeof CampaignStepSchema>>;

export interface SequenceStepActionsProps {
  onMoveStepUp: (index: number) => void;
  onMoveStepDown: (index: number) => void;
  onRemoveStep: (index: number) => void;
  onUpdateStep: (index: number, updates: Partial<SequenceStepProps['step']>) => void;
  onInsertTag: (index: number, tag: string) => void;
  onSetCurrentEditingStep: (index: number | null) => void;
  onSelectTemplate: (index: number, templateId: number) => void;
}

export interface EmailSecuenceSettingsProps {
  steps: CampaignSteps;
  templates?: Template[];
  currentEditingStep: number | null;
  emailBodyRef: RefObject<HTMLTextAreaElement>;
  stepErrors?: FieldErrors<CampaignSteps>;
  actions: SequenceStepActionsProps & {
    handleAddEmailStep: (index: number) => void;
  };
}

export interface RecipientsSettingsProps {
  recipients: string;
  handleChangeRecipients: (evt: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export interface EmailStepType {
  delayDays: number;
  delayHours: number;
  condition: "always" | "if_not_opened" | "if_not_clicked" | "if_not_replied";
}

export interface EmailEvent {
  type: EmailEventType;
  timestamp: Date;
}

export interface Client {
  email: string;
  // Add other client properties as needed
}

export interface CampaignResponse {
  id: number;
  name: string;
  status: CampaignStatusType;
  emailEvents: EmailEvent[];
  clients: Client[];
  updatedAt: Date;
}

export interface ScheduleSettingsProps {
  selectedTimezone: string;
  timezones: string[];
  selectedSendDays: number[];
  control: Control<CampaignFormValues>;
  register: UseFormRegister<CampaignFormValues>;
  handleDayChange: (dayId: number, evt: MouseEvent<HTMLButtonElement>) => void;
}

// Sequence Types
export interface SequenceStepProps {
  step: {
    id?: number;
    sequenceOrder: number;
    delayDays: number;
    delayHours: number;
    emailSubject?: string;
    emailBody?: string;
    templateId?: number;
    campaignId: number;
    condition: CampaignEventConditionType;
    createdAt?: Date;
    updatedAt?: Date;
  };
  index: number;
  totalSteps: number;
  currentEditingStep: number | null;
  emailBodyRef: RefObject<HTMLTextAreaElement>;
  templates?: Template[];
  actions: {
    onMoveStepUp: (index: number) => void;
    onMoveStepDown: (index: number) => void;
    onRemoveStep: (index: number) => void;
    onUpdateStep: (index: number, updates: Partial<Pick<SequenceStepProps['step'], 'sequenceOrder' | 'delayDays' | 'delayHours' | 'emailSubject' | 'emailBody' | 'templateId' | 'condition'>>) => void;
    onInsertTag: (index: number, tag: string) => void;
    onSetCurrentEditingStep: (index: number | null) => void;
    onSelectTemplate: (index: number, templateId: number) => void;
  };
}
