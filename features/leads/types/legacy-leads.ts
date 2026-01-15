// Re-export removed to prevent circular dependency

// Additional types that were in this file but not moved to features
// These are database-specific and should eventually move to backend layer

export interface DbLeadList {
  id: string;
  name: string;
  contacts: number;
  description: string;
}

export interface DbLeadListRow {
  id: string;
  name: string;
  contacts: number;
  description: string;
}

// Client types - keeping here as they're separate from leads
import { z } from 'zod';

export const ClientSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  notes: z.string().optional(),
  maskPII: z.boolean().optional(),
  status: z.string().optional(),
  companyId: z.number().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Client = z.infer<typeof ClientSchema>;

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  ARCHIVED = 'archived',
}

export const ClientFormDataSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof ClientFormDataSchema>;

