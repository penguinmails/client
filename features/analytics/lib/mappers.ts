import { MailboxWarmupData } from "@/entities/email";
import { MailboxAnalytics } from "@features/analytics/types/domain-specific";

// Raw mailbox data interface for type safety
interface RawMailboxData {
  id?: string;
  name?: string;
  email?: string;
  status?: string;
  warmupProgress?: number;
  dailyVolume?: number;
  dailyLimit?: number;
  healthScore?: number;
  reputation?: number;
  domain?: string;
  createdAt?: string;
  totalWarmups?: number;
  spamFlags?: number;
  replies?: number;
  lastUpdated?: Date | string;
}


// Extended mailbox analytics type that includes warmup-specific properties
type ExtendedMailboxAnalytics = MailboxAnalytics & {
  totalWarmups?: number;
  spamFlags?: number;
  replies?: number;
  lastUpdated?: Date;
};

/**
 * Maps raw mailbox data to legacy mailbox data format
 * This is a temporary mapper to maintain compatibility during migration
 * @param rawData - Raw mailbox data from the new analytics system
 * @returns Mapped legacy mailbox data
 */
export function mapRawToLegacyMailboxData(rawData: RawMailboxData[] | ExtendedMailboxAnalytics | Record<string, unknown>): (MailboxWarmupData & {
  totalWarmups?: number;
  spamFlags?: number;
  replies?: number;
  lastUpdated?: Date;
})[] {
  // Handle different input types
  if (!rawData) {
    return [];
  }

  // If it's a single MailboxAnalytics object, convert to array
  if (!Array.isArray(rawData) && typeof rawData === 'object') {
    if ('mailboxId' in rawData) {
      // It's a MailboxAnalytics object
      const mailboxAnalytics = rawData as ExtendedMailboxAnalytics;
      return [{
        id: mailboxAnalytics.mailboxId,
        name: mailboxAnalytics.name,
        email: mailboxAnalytics.email,
        status: mailboxAnalytics.warmupStatus === 'WARMED' ? 'active' as const : 'warming' as const,
        warmupProgress: mailboxAnalytics.warmupProgress,
        dailyVolume: mailboxAnalytics.currentVolume,
        healthScore: mailboxAnalytics.healthScore,
        domain: mailboxAnalytics.domain || "unknown.com",
        createdAt: new Date(mailboxAnalytics.updatedAt).toISOString(),
        // Include warmup-specific properties
        totalWarmups: mailboxAnalytics.totalWarmups,
        spamFlags: mailboxAnalytics.spamFlags,
        replies: mailboxAnalytics.replies,
        lastUpdated: mailboxAnalytics.lastUpdated,
      }];
    }
    // It's a generic object, return empty array
    return [];
  }

  // Handle array input
  const dataArray = Array.isArray(rawData) ? rawData : [];

  return dataArray.map((item: RawMailboxData, index: number) => ({
    id: item.id || index.toString(),
    name: item.name || item.email || `Mailbox ${index + 1}`,
    email: item.email || `mailbox${index}@example.com`,
    status: (item.status || "active") as "active" | "warming" | "paused" | "inactive",
    warmupProgress: item.warmupProgress || 0,
    dailyVolume: item.dailyVolume || item.dailyLimit || 50,
    healthScore: item.healthScore || item.reputation || 0,
    domain: item.domain || "example.com",
    createdAt: item.createdAt || new Date().toISOString(),
    // Include warmup-specific properties if available
    totalWarmups: 'totalWarmups' in item ? (item.totalWarmups as number) : undefined,
    spamFlags: 'spamFlags' in item ? (item.spamFlags as number) : undefined,
    replies: 'replies' in item ? (item.replies as number) : undefined,
    lastUpdated: 'lastUpdated' in item ? (item.lastUpdated as Date) : undefined,
  }));
}

// Analytics data interface for type safety
interface AnalyticsMailboxData {
  mailboxId: string;
  email: string;
  domain: string;
  warmupData: {
    status: string;
    progress: number;
    dailyVolume: number;
    healthScore: number;
  };
  timestamps: {
    createdAt: string;
  };
}

/**
 * Maps legacy mailbox data to new analytics format
 * @param legacyData - Legacy mailbox data
 * @returns Mapped analytics data
 */
export function mapLegacyToAnalyticsData(legacyData: MailboxWarmupData[]): AnalyticsMailboxData[] {
  if (!Array.isArray(legacyData)) {
    return [];
  }
  
  return legacyData.map((mailbox: MailboxWarmupData): AnalyticsMailboxData => ({
    mailboxId: mailbox.id,
    email: mailbox.email,
    domain: mailbox.domain || "unknown.com",
    warmupData: {
      status: mailbox.status,
      progress: mailbox.warmupProgress,
      dailyVolume: mailbox.dailyVolume,
      healthScore: mailbox.healthScore,
    },
    timestamps: {
      createdAt: mailbox.createdAt || new Date().toISOString(),
    },
  }));
}

// Aggregate metrics interface for type safety
interface AggregateMetrics {
  totalMailboxes: number;
  totalDailyVolume: number;
  totalWarmupProgress: number;
  totalHealthScore: number;
  activeMailboxes: number;
  warmingMailboxes: number;
  averageDailyVolume: number;
  averageWarmupProgress: number;
  averageHealthScore: number;
}

/**
 * Calculates aggregate metrics from mailbox data
 * @param mailboxes - Array of mailbox data
 * @returns Aggregated metrics
 */
export function calculateAggregateMetrics(mailboxes: MailboxWarmupData[]): AggregateMetrics {
  if (!Array.isArray(mailboxes) || mailboxes.length === 0) {
    return {
      totalMailboxes: 0,
      totalDailyVolume: 0,
      totalWarmupProgress: 0,
      totalHealthScore: 0,
      activeMailboxes: 0,
      warmingMailboxes: 0,
      averageDailyVolume: 0,
      averageWarmupProgress: 0,
      averageHealthScore: 0,
    };
  }

  const totals = mailboxes.reduce(
    (acc, mailbox) => ({
      totalMailboxes: acc.totalMailboxes + 1,
      totalDailyVolume: acc.totalDailyVolume + (mailbox.dailyVolume || 0),
      totalWarmupProgress: acc.totalWarmupProgress + (mailbox.warmupProgress || 0),
      totalHealthScore: acc.totalHealthScore + (mailbox.healthScore || 0),
      activeMailboxes: acc.activeMailboxes + (mailbox.status === "active" ? 1 : 0),
      warmingMailboxes: acc.warmingMailboxes + (mailbox.status === "warming" ? 1 : 0),
    }),
    {
      totalMailboxes: 0,
      totalDailyVolume: 0,
      totalWarmupProgress: 0,
      totalHealthScore: 0,
      activeMailboxes: 0,
      warmingMailboxes: 0,
    }
  );

  return {
    ...totals,
    averageDailyVolume: totals.totalMailboxes > 0 ? totals.totalDailyVolume / totals.totalMailboxes : 0,
    averageWarmupProgress: totals.totalMailboxes > 0 ? totals.totalWarmupProgress / totals.totalMailboxes : 0,
    averageHealthScore: totals.totalMailboxes > 0 ? totals.totalHealthScore / totals.totalMailboxes : 0,
  };
}
