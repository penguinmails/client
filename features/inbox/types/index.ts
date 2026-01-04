import { z } from "zod";

// ============================================================
// Shared Types & Enums
// ============================================================

export type MessageType = "incoming" | "outgoing" | "system";
export type ConversationStatus = "read" | "unread" | "archived" | "spam";

// ============================================================
// Schemas
// ============================================================

export const ClientSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  notes: z.string().optional(),
  maskPII: z.boolean().optional(),
  status: z.string().optional(),
  companyId: z.number().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
}).optional();

export const CampaignSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.enum([
    "DRAFT",
    "SCHEDULED",
    "RUNNING",
    "PAUSED",
    "COMPLETED",
    "CANCELLED",
  ]),
  fromName: z.string(),
  fromEmail: z.string().email(),
  companyId: z.number(),
  createdById: z.string().optional(),
  metrics: z
    .object({
      sent: z.number(),
      opens: z.union([z.number(), z.null()]),
      clicks: z.union([z.number(), z.null()]),
      replies: z.number(),
      bounced: z.number().optional(),
      openRate: z.number(),
      replyRate: z.number(),
    })
    .optional(),
  sendDays: z.array(z.number().int().min(0).max(6)),
  sendTimeStart: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  sendTimeEnd: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  emailsPerDay: z.number().int().positive().optional(),
  timezone: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const MessageSchema = z.object({
  id: z.union([z.string(), z.number()]),
  type: z.enum(["incoming", "outgoing", "system"]),
  sender: z.string(),
  time: z.string(), // ISO string
  content: z.string(),
  subject: z.string().optional(),
  avatar: z.string().optional(),
  isStarred: z.boolean().optional(),
  attachments: z.array(z.any()).optional(),
});

export const ConversationSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  email: z.string().email(),
  company: z.string().optional(),
  title: z.string().optional(),
  subject: z.string(),
  preview: z.string(),
  time: z.string(), // ISO string
  status: z.enum(["read", "unread", "archived", "spam"]),
  campaign: z.string().optional(),
  tag: z.string().optional(),
  isPinned: z.boolean().optional(),
  isStarred: z.boolean().optional(),
  avatar: z.string().optional(),
  lastMessage: z.enum(["incoming", "outgoing"]).optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
  unreadCount: z.number().optional(),
  messages: z.array(MessageSchema).optional(),
});

// Legacy Email Schema (from types/inbox.ts) - Keeping for compatibility
export const EmailSchema = z.object({
  id: z.number(),
  subject: z.string(),
  starred: z.boolean(),
  read: z.boolean(),
  body: z.string(),
  date: z.string(),
  preview: z.string(),
  createdAt: z.coerce.date(),
  campaign: CampaignSchema,
  client: ClientSchema.optional(),
});

export const EmailsTypeSchema = z
  .object({
    emails: z.array(EmailSchema).optional(),
    unread: z.number().optional(),
  })
  .optional();

// ============================================================
// Types
// ============================================================

// Import shared types instead of redefining
import type { 
  Campaign as SharedCampaign,
  Client as SharedClient 
} from "@/types";

export type Message = z.infer<typeof MessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;
export type Client = SharedClient;
export type Campaign = SharedCampaign;
export type Email = z.infer<typeof EmailSchema>;
export type EmailsType = z.infer<typeof EmailsTypeSchema>;

// Feature-specific interfaces
export interface InboxMessage extends Message {
  conversationId: string | number;
  from: string;
  to: string[];
  timestamp: Date | string;
  isRead: boolean;
  direction: 'inbound' | 'outbound';
}
