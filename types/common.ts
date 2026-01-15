/**
 * Common building block types
 * Part of the FSD shared layer
 */

import type { ComponentType } from 'react';

export interface BaseUser {
  id: string;
  email: string;
  emailVerified?: boolean;
  role?: string;
}

export const UserRole = {
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin",
  MANAGER: "manager",
  USER: "user",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];


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

export interface Client {
  id: number;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  notes?: string;
  maskPII?: boolean;
  status?: string;
  companyId?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Campaign {
  id: string | number;
  name: string;
  subject?: string;
  status?: string;
  fromName: string;
  fromEmail: string;
  metrics?: {
    recipients?: { sent: number; total: number };
    opens?: { total: number; rate: number };
    clicks?: { total: number; rate: number };
    replies?: { total: number; rate: number };
    bounces?: { total: number; rate: number };
  };
  lastUpdated?: string;
  totalRecipients?: number;
  sent?: number;
  delivered?: number;
  opened?: number;
  clicked?: number;
  replied?: number;
  bounced?: number;
  unsubscribed?: number;
  createdAt?: Date;
  scheduledAt?: Date;
  completedAt?: Date;
  leadListId?: string;
  mailboxIds?: string[];
  description?: string;
  settings?: Record<string, unknown>;
}

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



