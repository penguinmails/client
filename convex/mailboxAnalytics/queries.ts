import { query } from "../_generated/server";
import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";
import type { TimeSeriesDataPoint, PerformanceMetrics } from "../../types/analytics/core";
import type { MailboxHealthMetrics } from "../../lib/services/analytics/MailboxAnalyticsService";

// Type aliases to reduce deep instantiation
type MetricsAccumulator = PerformanceMetrics;
type MailboxGroups = Record<string, Doc<"mailboxAnalytics">[]>;
type TimeGroups = Record<string, Doc<"mailboxAnalytics">[]>;
import { 
  validateCompanyId, 
  validateDateRange, 
  normalizeMailboxIds 
} from "./validation";
import { 
  calculateHealthScore, 
  calculateDeliverabilityScore,
  calculateComprehensiveHealthScore,
  getTimeKey, 
  formatTimeLabel 
} from "./calculations";
import type { MailboxAnalyticsResult } from "./types";

/**
 * Get raw mailbox analytics data with filtering support.
 */
export const getMailboxAnalytics = query({
  args: {
    mailboxIds: v.optional(v.array(v.string())),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args): Promise<Doc<"mailboxAnalytics">[]> => {
    // Input validation
    validateCompanyId(args.companyId);
    
    if (args.dateRange) {
      validateDateRange(args.dateRange);
    }
    
    const normalizedMailboxIds = normalizeMailboxIds(args.mailboxIds);

    // Optimize index usage based on query parameters
    let results: Doc<"mailboxAnalytics">[];

    if (normalizedMailboxIds && normalizedMailboxIds.length <= 5) {
      // Use by_company_mailbox index when filtering by specific mailboxIds (small set)
      const mailboxQueries = normalizedMailboxIds.map(mailboxId =>
        ctx.db
          .query("mailboxAnalytics")
          .withIndex("by_company_mailbox", (q) => 
            q.eq("companyId", args.companyId).eq("mailboxId", mailboxId)
          )
          .collect()
      );
      
      const mailboxResults = await Promise.all(mailboxQueries);
      results = mailboxResults.flat();
      
      // Apply date filtering if specified
      if (args.dateRange) {
        results = results.filter((record) =>
          record.date >= args.dateRange!.start && record.date <= args.dateRange!.end
        );
      }
    } else {
      // Use by_company_date index when filtering by date range or large mailbox sets
      let query = ctx.db
        .query("mailboxAnalytics")
        .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId));

      if (args.dateRange) {
        query = query.filter((q) =>
          q.and(
            q.gte(q.field("date"), args.dateRange!.start),
            q.lte(q.field("date"), args.dateRange!.end)
          )
        );
      }

      results = await query.collect();

      // Implement post-filtering when index usage isn't optimal
      if (normalizedMailboxIds && normalizedMailboxIds.length > 0) {
        // Create a Set for O(1) lookup performance with large mailbox lists
        const mailboxIdSet = new Set(normalizedMailboxIds);
        results = results.filter((record) => mailboxIdSet.has(record.mailboxId));
      }
    }

    // Add query optimization for large datasets - sort deterministically
    return results.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.mailboxId.localeCompare(b.mailboxId);
    });
  },
});

/**
 * Get aggregated mailbox analytmailbox.
 */
export const getMailboxAggregatedAnalytics = query({
  args: {
    mailboxIds: v.optional(v.array(v.string())),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args): Promise<MailboxAnalyticsResult[]> => {
    // Get raw data directly instead of calling another query to avoid deep instantiation
    validateCompanyId(args.companyId);
    
    if (args.dateRange) {
      validateDateRange(args.dateRange);
    }
    
    const normalizedMailboxIds = normalizeMailboxIds(args.mailboxIds);

    // Optimize index usage based on query parameters
    let rawData: Doc<"mailboxAnalytics">[];

    if (normalizedMailboxIds && normalizedMailboxIds.length <= 5) {
      // Use by_company_mailbox index when filtering by specific mailboxIds (small set)
      const mailboxQueries = normalizedMailboxIds.map(mailboxId =>
        ctx.db
          .query("mailboxAnalytics")
          .withIndex("by_company_mailbox", (q) => 
            q.eq("companyId", args.companyId).eq("mailboxId", mailboxId)
          )
          .collect()
      );
      
      const mailboxResults = await Promise.all(mailboxQueries);
      rawData = mailboxResults.flat();
      
      // Apply date filtering if specified
      if (args.dateRange) {
        rawData = rawData.filter((record) =>
          record.date >= args.dateRange!.start && record.date <= args.dateRange!.end
        );
      }
    } else {
      // Use by_company_date index when filtering by date range or large mailbox sets
      let query = ctx.db
        .query("mailboxAnalytics")
        .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId));

      if (args.dateRange) {
        query = query.filter((q) =>
          q.and(
            q.gte(q.field("date"), args.dateRange!.start),
            q.lte(q.field("date"), args.dateRange!.end)
          )
        );
      }

      rawData = await query.collect();

      // Implement post-filtering when index usage isn't optimal
      if (normalizedMailboxIds && normalizedMailboxIds.length > 0) {
        // Create a Set for O(1) lookup performance with large mailbox lists
        const mailboxIdSet = new Set(normalizedMailboxIds);
        rawData = rawData.filter((record) => mailboxIdSet.has(record.mailboxId));
      }
    }

    // Group by mailbox with proper typing
    const mailboxGroups: MailboxGroups = rawData.reduce((
      acc: MailboxGroups,
      record: Doc<"mailboxAnalytics">
    ) => {
      if (!acc[record.mailboxId]) {
        acc[record.mailboxId] = [];
      }
      acc[record.mailboxId].push(record);
      return acc;
    }, {} as MailboxGroups);

    // Aggregate metrics for each mailbox with deterministic sorting
    const results: MailboxAnalyticsResult[] = (
      Object.entries(mailboxGroups) as Array<[string, Doc<"mailboxAnalytics">[]]>
    ).map(([mailboxId, records]) => {
      // Sort records by date for deterministic processing
      const sortedRecords = records.sort((a, b) => a.date.localeCompare(b.date));
      
      const latestRecord = sortedRecords.reduce((latest, current) =>
        current.date > latest.date ? current : latest
      );

      // Local aggregation logic with proper typing
      const zeroMetrics: MetricsAccumulator = {
        sent: 0,
        delivered: 0,
        opened_tracked: 0,
        clicked_tracked: 0,
        replied: 0,
        bounced: 0,
        unsubscribed: 0,
        spamComplaints: 0,
      };
      
      const metrics: MetricsAccumulator = sortedRecords.reduce<MetricsAccumulator>(
        (acc, record) => ({
          sent: acc.sent + record.sent,
          delivered: acc.delivered + record.delivered,
          opened_tracked: acc.opened_tracked + record.opened_tracked,
          clicked_tracked: acc.clicked_tracked + record.clicked_tracked,
          replied: acc.replied + record.replied,
          bounced: acc.bounced + record.bounced,
          unsubscribed: acc.unsubscribed + record.unsubscribed,
          spamComplaints: acc.spamComplaints + record.spamComplaints,
        }),
        zeroMetrics
      );

      return {
        mailboxId,
        email: latestRecord.email,
        domain: latestRecord.domain,
        provider: latestRecord.provider,
        warmupStatus: latestRecord.warmupStatus,
        warmupProgress: latestRecord.warmupProgress,
        dailyLimit: latestRecord.dailyLimit,
        currentVolume: latestRecord.currentVolume,
        metrics,
        healthScore: calculateHealthScore(metrics),
        updatedAt: latestRecord.updatedAt,
      } as MailboxAnalyticsResult;
    });

    // Ensure deterministic sorting by date and mailboxId
    return results.sort((a, b) => {
      const dateCompare = b.updatedAt - a.updatedAt; // Latest first
      if (dateCompare !== 0) return dateCompare;
      return a.mailboxId.localeCompare(b.mailboxId); // Then by mailboxId
    });
  },
});

/**
 * Get mailbox performance metrics for specific mailboxes.
 */
export const getMailboxPerformanceMetrics = query({
  args: {
    mailboxIds: v.array(v.string()),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args): Promise<MailboxAnalyticsResult[]> => {
    // Get raw data directly to avoid deep instantiation
    validateCompanyId(args.companyId);
    
    if (args.dateRange) {
      validateDateRange(args.dateRange);
    }
    
    const normalizedMailboxIds = normalizeMailboxIds(args.mailboxIds);
    if (!normalizedMailboxIds || normalizedMailboxIds.length === 0) {
      return [];
    }

    // Optimize index usage based on query parameters
    let rawData: Doc<"mailboxAnalytics">[];

    if (normalizedMailboxIds && normalizedMailboxIds.length <= 5) {
      // Use by_company_mailbox index when filtering by specific mailboxIds (small set)
      const mailboxQueries = normalizedMailboxIds.map(mailboxId =>
        ctx.db
          .query("mailboxAnalytics")
          .withIndex("by_company_mailbox", (q) => 
            q.eq("companyId", args.companyId).eq("mailboxId", mailboxId)
          )
          .collect()
      );
      
      const mailboxResults = await Promise.all(mailboxQueries);
      rawData = mailboxResults.flat();
      
      // Apply date filtering if specified
      if (args.dateRange) {
        rawData = rawData.filter((record) =>
          record.date >= args.dateRange!.start && record.date <= args.dateRange!.end
        );
      }
    } else {
      // Use by_company_date index when filtering by date range or large mailbox sets
      let query = ctx.db
        .query("mailboxAnalytics")
        .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId));

      if (args.dateRange) {
        query = query.filter((q) =>
          q.and(
            q.gte(q.field("date"), args.dateRange!.start),
            q.lte(q.field("date"), args.dateRange!.end)
          )
        );
      }

      rawData = await query.collect();

      // Implement post-filtering when index usage isn't optimal
      if (normalizedMailboxIds && normalizedMailboxIds.length > 0) {
        // Create a Set for O(1) lookup performance with large mailbox lists
        const mailboxIdSet = new Set(normalizedMailboxIds);
        rawData = rawData.filter((record) => mailboxIdSet.has(record.mailboxId));
      }
    }

    // Group by mailbox with proper typing
    const mailboxGroups: MailboxGroups = rawData.reduce((
      acc: MailboxGroups,
      record: Doc<"mailboxAnalytics">
    ) => {
      if (!acc[record.mailboxId]) {
        acc[record.mailboxId] = [];
      }
      acc[record.mailboxId].push(record);
      return acc;
    }, {} as MailboxGroups);

    // Aggregate metrics for each mailbox with deterministic sorting
    const results: MailboxAnalyticsResult[] = (
      Object.entries(mailboxGroups) as Array<[string, Doc<"mailboxAnalytics">[]]>
    ).map(([mailboxId, records]) => {
      // Sort records by date for deterministic processing
      const sortedRecords = records.sort((a, b) => a.date.localeCompare(b.date));
      
      const latestRecord = sortedRecords.reduce((latest, current) =>
        current.date > latest.date ? current : latest
      );

      // Local aggregation logic with proper typing
      const zeroMetrics: MetricsAccumulator = {
        sent: 0,
        delivered: 0,
        opened_tracked: 0,
        clicked_tracked: 0,
        replied: 0,
        bounced: 0,
        unsubscribed: 0,
        spamComplaints: 0,
      };
      
      const metrics: MetricsAccumulator = sortedRecords.reduce<MetricsAccumulator>(
        (acc, record) => ({
          sent: acc.sent + record.sent,
          delivered: acc.delivered + record.delivered,
          opened_tracked: acc.opened_tracked + record.opened_tracked,
          clicked_tracked: acc.clicked_tracked + record.clicked_tracked,
          replied: acc.replied + record.replied,
          bounced: acc.bounced + record.bounced,
          unsubscribed: acc.unsubscribed + record.unsubscribed,
          spamComplaints: acc.spamComplaints + record.spamComplaints,
        }),
        zeroMetrics
      );

      return {
        mailboxId,
        email: latestRecord.email,
        domain: latestRecord.domain,
        provider: latestRecord.provider,
        warmupStatus: latestRecord.warmupStatus,
        warmupProgress: latestRecord.warmupProgress,
        dailyLimit: latestRecord.dailyLimit,
        currentVolume: latestRecord.currentVolume,
        metrics,
        healthScore: calculateHealthScore(metrics),
        updatedAt: latestRecord.updatedAt,
      } as MailboxAnalyticsResult;
    });

    // Ensure deterministic sorting by date and mailboxId
    return results.sort((a, b) => {
      const dateCompare = b.updatedAt - a.updatedAt; // Latest first
      if (dateCompare !== 0) return dateCompare;
      return a.mailboxId.localeCompare(b.mailboxId); // Then by mailboxId
    });
  },
});

/**
 * Get time series analytics data for mailboxes.
 */
export const getMailboxTimeSeriesAnalytics = query({
  args: {
    mailboxIds: v.optional(v.array(v.string())),
    dateRange: v.object({
      start: v.string(),
      end: v.string(),
    }),
    companyId: v.string(),
    granularity: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, args): Promise<TimeSeriesDataPoint[]> => {
    // Input validation
    validateCompanyId(args.companyId);
    validateDateRange(args.dateRange);
    
    const granularity = args.granularity || "day";

    // Get raw data directly to avoid deep instantiation
    const normalizedMailboxIds = normalizeMailboxIds(args.mailboxIds);

    // Optimize index usage based on query parameters
    let rawData: Doc<"mailboxAnalytics">[];

    if (normalizedMailboxIds && normalizedMailboxIds.length <= 5) {
      // Use by_company_mailbox index when filtering by specific mailboxIds (small set)
      const mailboxQueries = normalizedMailboxIds.map(mailboxId =>
        ctx.db
          .query("mailboxAnalytics")
          .withIndex("by_company_mailbox", (q) => 
            q.eq("companyId", args.companyId).eq("mailboxId", mailboxId)
          )
          .collect()
      );
      
      const mailboxResults = await Promise.all(mailboxQueries);
      rawData = mailboxResults.flat();
      
      // Apply date filtering if specified
      rawData = rawData.filter((record) =>
        record.date >= args.dateRange.start && record.date <= args.dateRange.end
      );
    } else {
      // Use by_company_date index when filtering by date range or large mailbox sets
      const query = ctx.db
        .query("mailboxAnalytics")
        .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId))
        .filter((q) =>
          q.and(
            q.gte(q.field("date"), args.dateRange.start),
            q.lte(q.field("date"), args.dateRange.end)
          )
        );

      rawData = await query.collect();

      // Implement post-filtering when index usage isn't optimal
      if (normalizedMailboxIds && normalizedMailboxIds.length > 0) {
        // Create a Set for O(1) lookup performance with large mailbox lists
        const mailboxIdSet = new Set(normalizedMailboxIds);
        rawData = rawData.filter((record) => mailboxIdSet.has(record.mailboxId));
      }
    }

    // Local time grouping logic using getTimeKey helper
    const timeGroups: TimeGroups = rawData.reduce((acc: TimeGroups, record: Doc<"mailboxAnalytics">) => {
      const timeKey = getTimeKey(record.date, granularity);
      if (!acc[timeKey]) {
        acc[timeKey] = [];
      }
      acc[timeKey].push(record);
      return acc;
    }, {} as TimeGroups);

    // Aggregate metrics for each time period with proper typing
    const results: TimeSeriesDataPoint[] = Object.entries(timeGroups)
      .map(([timeKey, records]: [string, Doc<"mailboxAnalytics">[]]) => {
        const zeroMetrics: MetricsAccumulator = {
          sent: 0,
          delivered: 0,
          opened_tracked: 0,
          clicked_tracked: 0,
          replied: 0,
          bounced: 0,
          unsubscribed: 0,
          spamComplaints: 0,
        };
        
        const metrics: MetricsAccumulator = records.reduce<MetricsAccumulator>(
          (acc, record) => ({
            sent: acc.sent + record.sent,
            delivered: acc.delivered + record.delivered,
            opened_tracked: acc.opened_tracked + record.opened_tracked,
            clicked_tracked: acc.clicked_tracked + record.clicked_tracked,
            replied: acc.replied + record.replied,
            bounced: acc.bounced + record.bounced,
            unsubscribed: acc.unsubscribed + record.unsubscribed,
            spamComplaints: acc.spamComplaints + record.spamComplaints,
          }),
          zeroMetrics
        );

        return {
          date: timeKey,
          label: formatTimeLabel(timeKey, granularity),
          metrics,
        } as TimeSeriesDataPoint;
      });

    // Proper sorting by date for time series data
    return results.sort((a, b) => a.date.localeCompare(b.date));
  },
});

/**
 * Get warmup analytics for specific mailboxes.
 */
type WarmupAnalyticsResult = Array<{
  mailboxId: string;
  totalWarmups: number;
  spamComplaints: number;
  replies: number;
  progressPercentage: number;
  dailyStats: Array<{
    date: string;
    emailsWarmed: number;
    delivered: number;
    spamComplaints: number;
    replies: number;
    bounced: number;
    healthScore: number;
  }>;
}>;

export const getWarmupAnalytics = query({
  args: {
    mailboxIds: v.array(v.string()),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args): Promise<WarmupAnalyticsResult> => {
    validateCompanyId(args.companyId);
    
    const normalizedMailboxIds = normalizeMailboxIds(args.mailboxIds);
    if (!normalizedMailboxIds || normalizedMailboxIds.length === 0) {
      return [];
    }

    // Query warmup analytics data
    let query = ctx.db
      .query("warmupAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId));

    if (args.dateRange) {
      query = query.filter((q) =>
        q.and(
          q.gte(q.field("date"), args.dateRange!.start),
          q.lte(q.field("date"), args.dateRange!.end)
        )
      );
    }

    const warmupResults = await query.collect();
    
    // Filter by mailbox IDs
    const mailboxIdSet = new Set(normalizedMailboxIds);
    const filteredResults = warmupResults.filter((record) => mailboxIdSet.has(record.mailboxId));

    // Group by mailbox and aggregate
    const mailboxGroups = filteredResults.reduce((acc: Record<string, Doc<"warmupAnalytics">[]>, record) => {
      if (!acc[record.mailboxId]) {
        acc[record.mailboxId] = [];
      }
      acc[record.mailboxId].push(record);
      return acc;
    }, {});

    return Object.entries(mailboxGroups).map(([mailboxId, records]) => {
      const sortedRecords = records.sort((a, b) => a.date.localeCompare(b.date));
      
      const totals = sortedRecords.reduce(
        (acc, record) => ({
          totalWarmups: acc.totalWarmups + record.totalWarmups,
          spamComplaints: acc.spamComplaints + record.spamComplaints,
          replies: acc.replies + record.replies,
        }),
        { totalWarmups: 0, spamComplaints: 0, replies: 0 }
      );

      const latestRecord = sortedRecords[sortedRecords.length - 1];
      const progressPercentage = latestRecord?.progressPercentage || 0;

      const dailyStats = sortedRecords.map((record) => ({
        date: record.date,
        emailsWarmed: record.emailsWarmed,
        delivered: record.delivered,
        spamComplaints: record.spamComplaints,
        replies: record.replies,
        bounced: record.bounced,
        healthScore: record.healthScore,
      }));

      return {
        mailboxId,
        totalWarmups: totals.totalWarmups,
        spamComplaints: totals.spamComplaints,
        replies: totals.replies,
        progressPercentage,
        dailyStats,
      };
    }).sort((a, b) => a.mailboxId.localeCompare(b.mailboxId));
  },
});

/**
 * Get mailbox health metrics with reputation factors.
 */
export const getMailboxHealthMetrics = query({
  args: {
    mailboxIds: v.optional(v.array(v.string())),
    companyId: v.string(),
  },
  handler: async (ctx, args): Promise<MailboxHealthMetrics[]> => {
    validateCompanyId(args.companyId);
    
    const normalizedMailboxIds = normalizeMailboxIds(args.mailboxIds);

    // Get last 30 days of data
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Get mailbox analytics data directly to avoid deep instantiation
    let rawData: Doc<"mailboxAnalytics">[];

    if (normalizedMailboxIds && normalizedMailboxIds.length <= 5) {
      // Use by_company_mailbox index when filtering by specific mailboxIds (small set)
      const mailboxQueries = normalizedMailboxIds.map(mailboxId =>
        ctx.db
          .query("mailboxAnalytics")
          .withIndex("by_company_mailbox", (q) => 
            q.eq("companyId", args.companyId).eq("mailboxId", mailboxId)
          )
          .collect()
      );
      
      const mailboxResults = await Promise.all(mailboxQueries);
      rawData = mailboxResults.flat();
      
      // Apply date filtering
      rawData = rawData.filter((record) =>
        record.date >= startDate && record.date <= endDate
      );
    } else {
      // Use by_company_date index when filtering by date range or large mailbox sets
      const query = ctx.db
        .query("mailboxAnalytics")
        .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId))
        .filter((q) =>
          q.and(
            q.gte(q.field("date"), startDate),
            q.lte(q.field("date"), endDate)
          )
        );

      rawData = await query.collect();

      // Implement post-filtering when index usage isn't optimal
      if (normalizedMailboxIds && normalizedMailboxIds.length > 0) {
        // Create a Set for O(1) lookup performance with large mailbox lists
        const mailboxIdSet = new Set(normalizedMailboxIds);
        rawData = rawData.filter((record) => mailboxIdSet.has(record.mailboxId));
      }
    }

    // Group by mailbox with proper typing
    const mailboxGroups: MailboxGroups = rawData.reduce((
      acc: MailboxGroups,
      record: Doc<"mailboxAnalytics">
    ) => {
      if (!acc[record.mailboxId]) {
        acc[record.mailboxId] = [];
      }
      acc[record.mailboxId].push(record);
      return acc;
    }, {} as MailboxGroups);

    // Aggregate metrics for each mailbox with deterministic sorting
    const mailboxData: MailboxAnalyticsResult[] = (
      Object.entries(mailboxGroups) as Array<[string, Doc<"mailboxAnalytics">[]]>
    ).map(([mailboxId, records]) => {
      // Sort records by date for deterministic processing
      const sortedRecords = records.sort((a, b) => a.date.localeCompare(b.date));
      
      const latestRecord = sortedRecords.reduce((latest, current) =>
        current.date > latest.date ? current : latest
      );

      // Local aggregation logic with proper typing
      const zeroMetrics: MetricsAccumulator = {
        sent: 0,
        delivered: 0,
        opened_tracked: 0,
        clicked_tracked: 0,
        replied: 0,
        bounced: 0,
        unsubscribed: 0,
        spamComplaints: 0,
      };
      
      const metrics: MetricsAccumulator = sortedRecords.reduce<MetricsAccumulator>(
        (acc, record) => ({
          sent: acc.sent + record.sent,
          delivered: acc.delivered + record.delivered,
          opened_tracked: acc.opened_tracked + record.opened_tracked,
          clicked_tracked: acc.clicked_tracked + record.clicked_tracked,
          replied: acc.replied + record.replied,
          bounced: acc.bounced + record.bounced,
          unsubscribed: acc.unsubscribed + record.unsubscribed,
          spamComplaints: acc.spamComplaints + record.spamComplaints,
        }),
        zeroMetrics
      );

      return {
        mailboxId,
        email: latestRecord.email,
        domain: latestRecord.domain,
        provider: latestRecord.provider,
        warmupStatus: latestRecord.warmupStatus,
        warmupProgress: latestRecord.warmupProgress,
        dailyLimit: latestRecord.dailyLimit,
        currentVolume: latestRecord.currentVolume,
        metrics,
        healthScore: calculateHealthScore(metrics),
        updatedAt: latestRecord.updatedAt,
      } as MailboxAnalyticsResult;
    });

    // Get warmup data directly to avoid deep instantiation
    const warmupMailboxIds = normalizedMailboxIds || mailboxData.map(m => m.mailboxId);
    
    const query = ctx.db
      .query("warmupAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate)
        )
      );

    const warmupResults = await query.collect();
    
    // Filter by mailbox IDs
    const mailboxIdSet = new Set(warmupMailboxIds);
    const filteredResults = warmupResults.filter((record) => mailboxIdSet.has(record.mailboxId));

    // Group by mailbox and aggregate
    const warmupMailboxGroups = filteredResults.reduce((acc: Record<string, Doc<"warmupAnalytics">[]>, record: Doc<"warmupAnalytics">) => {
      if (!acc[record.mailboxId]) {
        acc[record.mailboxId] = [];
      }
      acc[record.mailboxId].push(record);
      return acc;
    }, {});

    const warmupData = Object.entries(warmupMailboxGroups).map(([mailboxId, records]) => {
      const sortedRecords = records.sort((a, b) => a.date.localeCompare(b.date));
      
      const totals = sortedRecords.reduce(
        (acc, record) => ({
          totalWarmups: acc.totalWarmups + record.totalWarmups,
          spamComplaints: acc.spamComplaints + record.spamComplaints,
          replies: acc.replies + record.replies,
        }),
        { totalWarmups: 0, spamComplaints: 0, replies: 0 }
      );

      const latestRecord = sortedRecords[sortedRecords.length - 1];
      const progressPercentage = latestRecord?.progressPercentage || 0;

      const dailyStats = sortedRecords.map((record) => ({
        date: record.date,
        emailsWarmed: record.emailsWarmed,
        delivered: record.delivered,
        spamComplaints: record.spamComplaints,
        replies: record.replies,
        bounced: record.bounced,
        healthScore: record.healthScore,
      }));

      return {
        mailboxId,
        totalWarmups: totals.totalWarmups,
        spamComplaints: totals.spamComplaints,
        replies: totals.replies,
        progressPercentage,
        dailyStats,
      };
    }).sort((a, b) => a.mailboxId.localeCompare(b.mailboxId));

    // Create warmup lookup
    const warmupLookup = warmupData.reduce<Record<string, typeof warmupData[number]>>(
      (acc, warmup) => {
        acc[warmup.mailboxId] = warmup;
        return acc;
      },
      {}
    );

    // Compute health metrics
    const results: MailboxHealthMetrics[] = (mailboxData as MailboxAnalyticsResult[]).map((mailbox: MailboxAnalyticsResult) => {
      const warmup = warmupLookup[mailbox.mailboxId];
      
      // Compute reputation factors
      const reputationFactors = {
        deliverabilityScore: calculateDeliverabilityScore(mailbox.metrics),
        spamScore: mailbox.metrics.delivered > 0 
          ? mailbox.metrics.spamComplaints / mailbox.metrics.delivered 
          : 0,
        bounceScore: mailbox.metrics.sent > 0 
          ? mailbox.metrics.bounced / mailbox.metrics.sent 
          : 0,
        engagementScore: mailbox.metrics.delivered > 0 
          ? (mailbox.metrics.opened_tracked + mailbox.metrics.replied) / mailbox.metrics.delivered 
          : 0,
        warmupScore: warmup ? warmup.progressPercentage / 100 : 0,
      };

      return {
        mailboxId: mailbox.mailboxId,
        email: mailbox.email,
        domain: mailbox.domain,
        provider: mailbox.provider,
        warmupStatus: mailbox.warmupStatus,
        warmupProgress: mailbox.warmupProgress,
        healthScore: calculateComprehensiveHealthScore(mailbox.metrics, reputationFactors),
        reputationFactors,
        performanceMetrics: mailbox.metrics,
        dailyLimit: mailbox.dailyLimit,
        currentVolume: mailbox.currentVolume,
        lastUpdated: mailbox.updatedAt,
      } as MailboxHealthMetrics;
    });

    // Sort by health score (highest first), then by mailboxId
    return results.sort((a, b) => {
      const healthCompare = b.healthScore - a.healthScore;
      if (healthCompare !== 0) return healthCompare;
      return a.mailboxId.localeCompare(b.mailboxId);
    });
  },
});
