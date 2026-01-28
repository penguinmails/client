/**
 * Leads Feature - Types & Schemas
 * 
 * Zod schemas and inferred types for the leads feature.
 * Used by: forms, filters, backend validation, data tables, DB queries.
 */

import { z } from 'zod';

// ============================================================
// Enums
// ============================================================

export enum LeadStatus {
  NOT_USED = 'not-used',
  SENT = 'sent',
  REPLIED = 'replied',
  BOUNCED = 'bounced',
}

export enum LeadListStatus {
  NOT_USED = 'not-used',
  USED = 'used',
  BEING_USED = 'being-used',
}

// ============================================================
// Lead Schemas
// ============================================================

export const LeadSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  tags: z.array(z.string()).optional(),
  lastContact: z.string().nullable().optional(),
  campaign: z.string().nullable().optional(),
  source: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Lead = z.infer<typeof LeadSchema>;

// ============================================================
// Lead List Schemas
// ============================================================

export const LeadListSchema = z.object({
  id: z.string(),
  name: z.string(),
  contacts: z.number(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['active', 'used', 'being-used', 'inactive']).optional(),
  campaign: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type LeadList = z.infer<typeof LeadListSchema>;

export const LeadListDataSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  alias: z.string().optional(),
  description: z.string().optional(),
  contacts: z.number(),
  status: z.enum(['active', 'inactive', 'published', 'unpublished']),
  isPublished: z.boolean().optional(),
  dateAdded: z.string().optional(),
  dateModified: z.string().optional(),
  createdByUser: z.string().optional(),
  modifiedByUser: z.string().optional(),
  campaign: z.string().nullable().optional(),
  openRate: z.number().nullable().optional(),
  replyRate: z.number().nullable().optional(),
  tags: z.array(z.string()).optional(),
  bouncedCount: z.number().optional(),
});

export type LeadListData = z.infer<typeof LeadListDataSchema>;

// ============================================================
// Form Schemas
// ============================================================

export const LeadFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
});

export type LeadFormData = z.infer<typeof LeadFormSchema>;

export const LeadListFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type LeadListFormData = z.infer<typeof LeadListFormSchema>;

// ============================================================
// Filter Schemas
// ============================================================

export const LeadFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
});

export type LeadFilters = z.infer<typeof LeadFiltersSchema>;

export const LeadListFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'active', 'used', 'being-used', 'inactive']).optional(),
  page: z.number().default(1),
  limit: z.number().default(10),
});

export type LeadListFilters = z.infer<typeof LeadListFiltersSchema>;

// ============================================================
// CSV Import Types
// ============================================================

export interface CSVColumn {
  key: string;
  label: string;
  required: boolean;
}

export type CSVRecord = Record<string, string>;

export const CSV_COLUMNS: CSVColumn[] = [
  { key: 'email', label: 'Email Address', required: true },
  { key: 'first_name', label: 'First Name', required: true },
  { key: 'last_name', label: 'Last Name', required: true },
  { key: 'company', label: 'Company Name', required: false },
  { key: 'title', label: 'Job Title', required: false },
  { key: 'website', label: 'Website', required: false },
  { key: 'phone', label: 'Phone Number', required: false },
];

// ============================================================
// Stats Types
// ============================================================

export interface LeadStat {
  title: string;
  value: string;
  icon: string;
  color: string;
}

export type LeadStats = LeadStat[];
