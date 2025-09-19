import { query } from "../_generated/server";
import { v } from "convex/values";

// Import types
import {
  DomainAnalyticsResult,
  TimeSeriesAnalyticsResult,
  ImpactAnalysisResult,
  MailboxAnalyticsRecord,
  EmailMetrics,
  MailboxHealthData
} from "./types";

// Import validation
import { validateQueryArgs, validateDomainId } from "./validation";

// Import calculations
import {
  calculateMailboxHealthScore,
  calculateDomainHealthScore,
  calculateDomainReputation,
  aggregateEmailMetrics,
  calculateMailboxInsights,
  calculateWarmupSummary,
  calculateCapacitySummary,
  formatTimeLabel,
  groupByTimePeriod,
  calculateCorrelationMetrics
} from "./calculations";

/**
 * Get comprehensive analytics that join mailbox and domain data.
 * This provides a unified view of how mailboxes contribute to domain performance.
 */
export const getMailboxDomainJoinedAnalytics = query({
  args: {
    domainIds: v.optional(v.array(v.string())),
    mailboxIds: v.optional(v.array(v.string())),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args) => {
    const validatedArgs = validateQueryArgs(args);
    const { domainIds, mailboxIds, dateRange, companyId } = validatedArgs;

    // Get mailbox analytics data
    let mailboxQuery = ctx.db
      .query("mailboxAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", companyId));

    // Apply date range filter if provided
    if (dateRange) {
      mailboxQuery = mailboxQuery.filter((q) =>
        q.and(
          q.gte(q.field("date"), dateRange.start),
          q.lte(q.field("date"), dateRange.end)
        )
      );
    }

    const allMailboxData = await mailboxQuery.collect();

    // Filter by domain IDs if specified (filter mailboxes by domain)
    let filteredMailboxData = allMailboxData;
    if (domainIds?.length) {
      filteredMailboxData = allMailboxData.filter((m) =>
        domainIds.includes(m.domain)
      );
    }

    // Filter by mailbox IDs if specified
    if (mailboxIds?.length) {
      filteredMailboxData = filteredMailboxData.filter((m) =>
        mailboxIds.includes(m.mailboxId)
      );
    }

    // Get corresponding domain analytics data
    let domainQuery = ctx.db
      .query("domainAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", companyId));

    // Apply date range filter if provided
    if (dateRange) {
      domainQuery = domainQuery.filter((q) =>
        q.and(
          q.gte(q.field("date"), dateRange.start),
          q.lte(q.field("date"), dateRange.end)
        )
      );
    }

    const allDomainData = await domainQuery.collect();

    // Get unique domains from filtered mailbox data
    const domainSet = new Set(filteredMailboxData.map(m => m.domain));
    const relevantDomains = Array.from(domainSet);

    // Filter domain data to only include domains that have mailboxes in our filtered set
    const filteredDomainData = allDomainData.filter((d) =>
      relevantDomains.includes(d.domainId)
    );

    // Group mailbox data by domain
    const mailboxesByDomain = filteredMailboxData.reduce((groups, mailbox) => {
      if (!groups[mailbox.domain]) {
        groups[mailbox.domain] = [];
      }
      groups[mailbox.domain].push(mailbox);
      return groups;
    }, {} as Record<string, typeof filteredMailboxData>);

    // Group domain data by domain ID
    const domainDataByDomain = filteredDomainData.reduce((groups, domain) => {
      if (!groups[domain.domainId]) {
        groups[domain.domainId] = [];
      }
      groups[domain.domainId].push(domain);
      return groups;
    }, {} as Record<string, typeof filteredDomainData>);

    // Create joined analytics for each domain
    const joinedAnalytics: DomainAnalyticsResult[] = relevantDomains.map((domainId: string) => {
      const mailboxes = mailboxesByDomain[domainId] || [];
      const domainRecords = domainDataByDomain[domainId] || [];

      // Aggregate mailbox metrics for this domain
      const mailboxAggregated = aggregateEmailMetrics(mailboxes);

      // Aggregate domain metrics
      const domainAggregated = aggregateEmailMetrics(domainRecords.map(d => ({
        ...d,
        mailboxId: '',
        email: '',
        provider: '',
        domain: d.domainId,
        companyId: d.companyId,
        dailyLimit: 0,
        currentVolume: 0,
        warmupStatus: '',
        warmupProgress: 0,
        updatedAt: d.updatedAt
      } as MailboxAnalyticsRecord & EmailMetrics)));

      // Get domain authentication info (from most recent domain record)
      const latestDomainRecord = domainRecords.length > 0
        ? domainRecords.reduce((latest, current) =>
            current.date > latest.date ? current : latest
          )
        : null;

      // Calculate mailbox health scores and warmup status
      const mailboxHealthData: MailboxHealthData[] = mailboxes.map((mailbox) => {
        const healthScore = Math.round(calculateMailboxHealthScore(mailbox));

        return {
          mailboxId: mailbox.mailboxId,
          email: mailbox.email,
          provider: mailbox.provider,
          warmupStatus: mailbox.warmupStatus,
          warmupProgress: mailbox.warmupProgress,
          healthScore,
          dailyLimit: mailbox.dailyLimit,
          currentVolume: mailbox.currentVolume,
          performance: {
            sent: mailbox.sent,
            delivered: mailbox.delivered,
            opened_tracked: mailbox.opened_tracked,
            clicked_tracked: mailbox.clicked_tracked,
            replied: mailbox.replied,
            bounced: mailbox.bounced,
            unsubscribed: mailbox.unsubscribed,
            spamComplaints: mailbox.spamComplaints,
          },
        };
      });

      // Calculate domain health score from aggregated metrics
      const domainHealthScore = Math.round(calculateDomainHealthScore(domainAggregated));

      // Calculate domain reputation from authentication and performance
      const domainReputation = Math.round(calculateDomainReputation(
        domainAggregated,
        latestDomainRecord?.authentication || {
          spf: false,
          dkim: false,
          dmarc: false,
        }
      ));

      // Calculate warmup and capacity summaries
      const warmupSummary = calculateWarmupSummary(mailboxes);
      const capacitySummary = calculateCapacitySummary(mailboxes);

      return {
        domainId,
        domainName: latestDomainRecord?.domainName || domainId,
        authentication: latestDomainRecord?.authentication || {
          spf: false,
          dkim: false,
          dmarc: false,
        },

        // Domain-level aggregated metrics
        domainMetrics: domainAggregated,
        domainHealthScore,
        domainReputation,

        // Mailbox-level aggregated metrics (should match domain metrics if data is consistent)
        mailboxAggregatedMetrics: mailboxAggregated,

        // Mailbox details for this domain
        mailboxes: mailboxHealthData,
        mailboxCount: mailboxes.length,

        // Warmup summary for domain
        warmupSummary,

        // Capacity summary for domain
        capacitySummary,

        updatedAt: Math.max(
          ...mailboxes.map(m => m.updatedAt),
          ...domainRecords.map(d => d.updatedAt),
          0
        ),
      };
    });

    return joinedAnalytics;
  },
});

/**
 * Get cross-domain time series data showing how mailbox changes affect domain metrics.
 */
export const getCrossDomainTimeSeriesAnalytics = query({
  args: {
    domainIds: v.optional(v.array(v.string())),
    mailboxIds: v.optional(v.array(v.string())),
    dateRange: v.object({
      start: v.string(),
      end: v.string(),
    }),
    companyId: v.string(),
    granularity: v.optional(v.union(v.literal("day"), v.literal("week"), v.literal("month"))),
  },
  handler: async (ctx, args) => {
    const validatedArgs = validateQueryArgs(args);
    const { domainIds, mailboxIds, dateRange, companyId, granularity = "day" } = validatedArgs;

    // Get raw mailbox data for time series grouping
    // dateRange is required for this query according to the schema
    const mailboxQuery = ctx.db
      .query("mailboxAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", companyId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), dateRange!.start),
          q.lte(q.field("date"), dateRange!.end)
        )
      );

    const allMailboxData = await mailboxQuery.collect();

    // Apply domain and mailbox filters
    let filteredMailboxData = allMailboxData;
    if (domainIds?.length) {
      filteredMailboxData = filteredMailboxData.filter((m) =>
        domainIds.includes(m.domain)
      );
    }
    if (mailboxIds?.length) {
      filteredMailboxData = filteredMailboxData.filter((m) =>
        mailboxIds.includes(m.mailboxId)
      );
    }

    // Group by time period and domain
    const timeGroups = groupByTimePeriod(filteredMailboxData, granularity);

    // Convert to time series format with cross-domain insights
    const timeSeriesData: TimeSeriesAnalyticsResult[] = timeGroups
      .map((group) => {
        // Calculate domain health from mailbox aggregation
        const bounceRate = group.aggregatedMetrics.sent > 0
          ? group.aggregatedMetrics.bounced / group.aggregatedMetrics.sent
          : 0;
        const spamRate = group.aggregatedMetrics.delivered > 0
          ? group.aggregatedMetrics.spamComplaints / group.aggregatedMetrics.delivered
          : 0;

        let healthScore = 100;
        healthScore -= bounceRate * 100 * 2;
        healthScore -= spamRate * 100 * 5;
        healthScore = Math.max(0, Math.min(100, healthScore));

        // Calculate mailbox-level insights
        const mailboxInsights = calculateMailboxInsights(group.mailboxes);

        return {
          date: group.date,
          domainId: group.domainId,
          label: formatTimeLabel(group.date, granularity),

          // Domain metrics (aggregated from mailboxes)
          domainMetrics: group.aggregatedMetrics,
          domainHealthScore: Math.round(healthScore),

          // Mailbox insights that affect domain performance
          mailboxInsights,

          // Cross-domain correlation metrics
          correlationMetrics: calculateCorrelationMetrics(group.aggregatedMetrics, {
            totalCapacity: mailboxInsights.totalCapacity,
            totalVolume: mailboxInsights.totalVolume
          }),
        };
      })
      .sort((a, b) => `${a.date}:${a.domainId}`.localeCompare(`${b.date}:${b.domainId}`));

    return timeSeriesData;
  },
});

/**
 * Get mailbox impact analysis on domain performance.
 * Shows how individual mailboxes contribute to overall domain metrics.
 */
export const getMailboxDomainImpactAnalysis = query({
  args: {
    domainId: v.string(),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
  },
  handler: async (ctx, args) => {
    const validatedDomainId = validateDomainId(args.domainId);
    const { dateRange, companyId } = args;

    // Get all mailboxes for this domain
    let mailboxQuery = ctx.db
      .query("mailboxAnalytics")
      .withIndex("by_domain", (q) => q.eq("domain", validatedDomainId));

    // Apply date range filter if provided
    if (dateRange) {
      mailboxQuery = mailboxQuery.filter((q) =>
        q.and(
          q.gte(q.field("date"), dateRange.start),
          q.lte(q.field("date"), dateRange.end)
        )
      );
    }

    const mailboxData = await mailboxQuery.collect();

    // Get corresponding domain analytics data
    let domainQuery = ctx.db
      .query("domainAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", companyId));

    // Apply date range filter if provided
    if (dateRange) {
      domainQuery = domainQuery.filter((q) =>
        q.and(
          q.gte(q.field("date"), dateRange.start),
          q.lte(q.field("date"), dateRange.end)
        )
      );
    }

    const allDomainData = await domainQuery.collect();

    // Filter domain data to only include the specific domain
    const domainData = allDomainData.filter((d) => d.domainId === validatedDomainId);

    // Aggregate domain metrics
    const totalDomainMetrics = aggregateEmailMetrics(domainData.map(d => ({
      ...d,
      mailboxId: '',
      email: '',
      provider: '',
      domain: d.domainId,
      companyId: d.companyId,
      dailyLimit: 0,
      currentVolume: 0,
      warmupStatus: '',
      warmupProgress: 0,
      updatedAt: d.updatedAt
    } as MailboxAnalyticsRecord & EmailMetrics)));

    // Group mailbox data by mailbox
    const mailboxGroups = mailboxData.reduce((groups, record) => {
      if (!groups[record.mailboxId]) {
        groups[record.mailboxId] = {
          mailboxId: record.mailboxId,
          email: record.email,
          provider: record.provider,
          warmupStatus: record.warmupStatus,
          warmupProgress: record.warmupProgress,
          records: [],
        };
      }
      groups[record.mailboxId].records.push(record);
      return groups;
    }, {} as Record<string, { mailboxId: string; email: string; provider: string; warmupStatus: string; warmupProgress: number; records: (MailboxAnalyticsRecord & EmailMetrics)[] }>);

    // Calculate impact analysis
    const impactAnalysis: ImpactAnalysisResult = {
      domainId: validatedDomainId,
      totalDomainMetrics,
      mailboxGroups: Object.values(mailboxGroups).map((group) => {
        const mailboxMetrics = aggregateEmailMetrics(group.records);
        const mailboxHealthScore = Math.round(
          group.records.reduce((sum, record) => sum + calculateMailboxHealthScore(record), 0) /
          group.records.length
        );

        const contributionPercentage = totalDomainMetrics.sent > 0
          ? (mailboxMetrics.sent / totalDomainMetrics.sent) * 100
          : 0;

        // Calculate impact on domain health
        const domainHealthWithMailbox = calculateDomainHealthScore(totalDomainMetrics);
        const domainHealthWithoutMailbox = calculateDomainHealthScore({
          ...totalDomainMetrics,
          sent: totalDomainMetrics.sent - mailboxMetrics.sent,
          delivered: totalDomainMetrics.delivered - mailboxMetrics.delivered,
          bounced: totalDomainMetrics.bounced - mailboxMetrics.bounced,
          opened_tracked: totalDomainMetrics.opened_tracked - mailboxMetrics.opened_tracked,
          clicked_tracked: totalDomainMetrics.clicked_tracked - mailboxMetrics.clicked_tracked,
          replied: totalDomainMetrics.replied - mailboxMetrics.replied,
          unsubscribed: totalDomainMetrics.unsubscribed - mailboxMetrics.unsubscribed,
          spamComplaints: totalDomainMetrics.spamComplaints - mailboxMetrics.spamComplaints,
        });

        const healthImpact = domainHealthWithMailbox - domainHealthWithoutMailbox;
        const volumeImpact = totalDomainMetrics.sent > 0
          ? (mailboxMetrics.sent / totalDomainMetrics.sent) * 100
          : 0;

        return {
          mailboxId: group.mailboxId,
          email: group.email,
          provider: group.provider,
          warmupStatus: group.warmupStatus,
          warmupProgress: group.warmupProgress,
          metrics: mailboxMetrics,
          healthScore: mailboxHealthScore,
          contributionPercentage: Math.round(contributionPercentage * 100) / 100,
          impactOnDomain: {
            deliveryImpact: healthImpact,
            reputationImpact: healthImpact * 0.8, // Approximation
            volumeImpact: Math.round(volumeImpact * 100) / 100,
          },
        };
      }),
      domainHealthScore: Math.round(calculateDomainHealthScore(totalDomainMetrics)),
      averageMailboxHealthScore: Math.round(
        Object.values(mailboxGroups).reduce((sum, group) => {
          const healthScore = group.records.reduce((sum, record) => sum + calculateMailboxHealthScore(record), 0) / group.records.length;
          return sum + healthScore;
        }, 0) / Object.keys(mailboxGroups).length
      ),
      updatedAt: Math.max(
        ...mailboxData.map(m => m.updatedAt),
        ...domainData.map(d => d.updatedAt),
        0
      ),
    };

    return impactAnalysis;
  },
});
