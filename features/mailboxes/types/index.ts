/**
 * Canonical EmailAccount type aligned with backend DB schema
 * 
 * Represents an email account (mailbox) from email_accounts table
 */

export interface EmailAccount {
  id: string;
  domainId: string;
  email: string;
  provider: string;
  status: 'active' | 'inactive' | 'warming' | 'paused' | 'error';
  smtpSettings?: Record<string, unknown>;
  imapSettings?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * EmailAccountAnalytics - separate view model for analytics fields
 * 
 * Contains metrics and analytics data for an email account
 */
export interface EmailAccountAnalytics {
  warmupProgress: number;
  dailyLimit: number;
  emailsSent: number;
  openRate: number;
  replyRate: number;
  lastActivity: Date;
  dailyVolume: number;
  healthScore: number;
  totalWarmups?: number;
  spamFlags?: number;
  replies?: number;
  lastUpdated?: Date;
}

/**
 * EmailAccountWithAnalytics - combined type for display purposes
 * 
 * Includes both core email account data and analytics
 */
export interface EmailAccountWithAnalytics extends EmailAccount {
  analytics?: EmailAccountAnalytics;
}

/**
 * MailboxData compatibility interface
 * 
 * For backward compatibility with existing code
 */
export type MailboxData = EmailAccountWithAnalytics;

/**
 * MockMailbox compatibility type
 * 
 * For backward compatibility with existing mocks
 */
export type MockMailbox = EmailAccount;

// Export type for mailbox status constants
export const EmailAccountStatus = {
  ACTIVE: 'active' as const,
  INACTIVE: 'inactive' as const,
  WARMING: 'warming' as const,
  PAUSED: 'paused' as const,
  ERROR: 'error' as const
};

export type EmailAccountStatus = typeof EmailAccountStatus[keyof typeof EmailAccountStatus];

// Helper to map legacy types to canonical types
export function mapLegacyMailboxDataToEmailAccount(data: Record<string, unknown>): EmailAccount {
  return {
    id: data.id?.toString() || '',
    domainId: data.domainId?.toString() || '',
    email: data.email?.toString() || '',
    provider: data.provider?.toString() || 'custom',
    status: (data.status as EmailAccountStatus) || 'active',
    smtpSettings: data.smtpSettings as Record<string, unknown> | undefined,
    imapSettings: data.imapSettings as Record<string, unknown> | undefined,
    createdAt: data.createdAt as Date | undefined,
    updatedAt: data.updatedAt as Date | undefined
  };
}

// Helper to map analytics data to EmailAccountAnalytics
export function mapAnalyticsToEmailAccountAnalytics(data: Record<string, unknown>): EmailAccountAnalytics {
  return {
    warmupProgress: (data.warmupProgress as number) || 0,
    dailyLimit: (data.dailyLimit as number) || 0,
    emailsSent: (data.emailsSent as number) || 0,
    openRate: (data.openRate as number) || 0,
    replyRate: (data.replyRate as number) || 0,
    lastActivity: (data.lastActivity as Date) || new Date(),
    dailyVolume: (data.dailyVolume as number) || 0,
    healthScore: (data.healthScore as number) || 0,
    totalWarmups: data.totalWarmups as number | undefined,
    spamFlags: data.spamFlags as number | undefined,
    replies: data.replies as number | undefined,
    lastUpdated: data.lastUpdated as Date | undefined
  };
}
