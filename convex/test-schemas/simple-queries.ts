/**
 * Test Queries: Progressive Complexity Analysis
 * 
 * This file contains test queries with different parameter complexity levels
 * to identify the specific patterns causing TypeScript compilation issues.
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

// ============================================================================
// TEST 1: MINIMAL QUERY - SIMPLE PARAMETERS
// ============================================================================

export const simpleQuery = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("simpleTable")
      .filter((q) => q.eq(q.field("id"), args.id))
      .collect();
  },
});

// ============================================================================
// TEST 2: MODERATE QUERY - OPTIONAL PARAMETERS AND OBJECTS
// ============================================================================

export const moderateQuery = query({
  args: {
    id: v.optional(v.string()),
    status: v.optional(v.union(v.literal("ACTIVE"), v.literal("INACTIVE"))),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("moderateTable");
    
    if (args.id) {
      query = query.filter((q) => q.eq(q.field("id"), args.id));
    }
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    return await query.collect();
  },
});

// ============================================================================
// TEST 3: COMPLEX QUERY - MULTIPLE OPTIONAL OBJECTS AND ARRAYS
// ============================================================================

export const complexQuery = query({
  args: {
    ids: v.optional(v.array(v.string())),
    status: v.optional(v.union(
      v.literal("DRAFT"),
      v.literal("ACTIVE"), 
      v.literal("PAUSED"),
      v.literal("COMPLETED"),
      v.literal("ARCHIVED")
    )),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    filters: v.optional(v.object({
      minSent: v.optional(v.number()),
      maxSent: v.optional(v.number()),
      hasReplies: v.optional(v.boolean()),
    })),
    options: v.optional(v.object({
      includeMetrics: v.optional(v.boolean()),
      includeConfig: v.optional(v.boolean()),
      limit: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("complexTable");
    
    if (args.ids?.length) {
      query = query.filter((q) => 
        q.or(...args.ids!.map(id => q.eq(q.field("id"), id)))
      );
    }
    
    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }
    
    if (args.filters?.minSent !== undefined) {
      query = query.filter((q) => q.gte(q.field("metrics.sent"), args.filters!.minSent!));
    }
    
    const results = await query.collect();
    
    if (args.options?.limit) {
      return results.slice(0, args.options.limit);
    }
    
    return results;
  },
});

// ============================================================================
// TEST 4: ANALYTICS-LEVEL COMPLEXITY - CURRENT PRODUCTION PATTERN
// ============================================================================

export const analyticsLevelQuery = query({
  args: {
    campaignIds: v.optional(v.array(v.string())),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    companyId: v.string(),
    includeSequenceData: v.optional(v.boolean()),
    includeTimeSeriesData: v.optional(v.boolean()),
    filters: v.optional(v.object({
      status: v.optional(v.array(v.union(
        v.literal("ACTIVE"), 
        v.literal("PAUSED"), 
        v.literal("COMPLETED"), 
        v.literal("DRAFT")
      ))),
      minSent: v.optional(v.number()),
      maxSent: v.optional(v.number()),
      minReplies: v.optional(v.number()),
      hasActivity: v.optional(v.boolean()),
    })),
    computeOptions: v.optional(v.object({
      granularity: v.optional(v.union(
        v.literal("day"), 
        v.literal("week"), 
        v.literal("month")
      )),
      aggregateBy: v.optional(v.union(
        v.literal("campaign"), 
        v.literal("date"), 
        v.literal("status")
      )),
      includeRates: v.optional(v.boolean()),
      includeComparisons: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    // This represents the complexity level of our current analytics queries
    let query = ctx.db
      .query("campaignAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId));

    // Apply date range filter
    if (args.dateRange) {
      query = query.filter((q) =>
        q.and(
          q.gte(q.field("date"), args.dateRange!.start),
          q.lte(q.field("date"), args.dateRange!.end)
        )
      );
    }

    // Apply campaign IDs filter
    if (args.campaignIds?.length) {
      query = query.filter((q) =>
        q.or(...args.campaignIds!.map(id => q.eq(q.field("campaignId"), id)))
      );
    }

    // Apply status filter
    if (args.filters?.status?.length) {
      query = query.filter((q) =>
        q.or(...args.filters!.status!.map(status => q.eq(q.field("status"), status)))
      );
    }

    // Apply numeric filters
    if (args.filters?.minSent !== undefined) {
      query = query.filter((q) => q.gte(q.field("sent"), args.filters!.minSent!));
    }

    if (args.filters?.maxSent !== undefined) {
      query = query.filter((q) => q.lte(q.field("sent"), args.filters!.maxSent!));
    }

    if (args.filters?.minReplies !== undefined) {
      query = query.filter((q) => q.gte(q.field("replied"), args.filters!.minReplies!));
    }

    const results = await query.collect();

    // This is where the complex type inference happens that causes the warnings
    return {
      campaigns: results,
      metadata: {
        dateRange: args.dateRange,
        campaignCount: results.length,
        includesSequenceData: Boolean(args.includeSequenceData),
        includesTimeSeriesData: Boolean(args.includeTimeSeriesData),
        generatedAt: Date.now(),
      },
    };
  },
});

// ============================================================================
// TEST 5: EXTREME COMPLEXITY - PUSHING TYPESCRIPT LIMITS
// ============================================================================

export const extremeComplexityQuery = query({
  args: {
    // Multiple nested optional objects
    primaryFilters: v.optional(v.object({
      entityIds: v.optional(v.array(v.string())),
      entityTypes: v.optional(v.array(v.union(
        v.literal("CAMPAIGN"),
        v.literal("LEAD"),
        v.literal("TEMPLATE"),
        v.literal("DOMAIN"),
        v.literal("MAILBOX")
      ))),
      dateRanges: v.optional(v.array(v.object({
        start: v.string(),
        end: v.string(),
        label: v.optional(v.string()),
      }))),
      statusFilters: v.optional(v.object({
        include: v.optional(v.array(v.string())),
        exclude: v.optional(v.array(v.string())),
        priority: v.optional(v.union(
          v.literal("HIGH"),
          v.literal("MEDIUM"),
          v.literal("LOW")
        )),
      })),
    })),
    
    // Complex metric filters
    metricFilters: v.optional(v.object({
      ranges: v.optional(v.object({
        sent: v.optional(v.object({ min: v.optional(v.number()), max: v.optional(v.number()) })),
        delivered: v.optional(v.object({ min: v.optional(v.number()), max: v.optional(v.number()) })),
        opened: v.optional(v.object({ min: v.optional(v.number()), max: v.optional(v.number()) })),
        clicked: v.optional(v.object({ min: v.optional(v.number()), max: v.optional(v.number()) })),
        replied: v.optional(v.object({ min: v.optional(v.number()), max: v.optional(v.number()) })),
      })),
      rates: v.optional(v.object({
        deliveryRate: v.optional(v.object({ min: v.optional(v.number()), max: v.optional(v.number()) })),
        openRate: v.optional(v.object({ min: v.optional(v.number()), max: v.optional(v.number()) })),
        clickRate: v.optional(v.object({ min: v.optional(v.number()), max: v.optional(v.number()) })),
        replyRate: v.optional(v.object({ min: v.optional(v.number()), max: v.optional(v.number()) })),
      })),
    })),
    
    // Complex computation options
    computationOptions: v.optional(v.object({
      aggregations: v.optional(v.array(v.union(
        v.literal("SUM"),
        v.literal("AVG"),
        v.literal("MIN"),
        v.literal("MAX"),
        v.literal("COUNT")
      ))),
      groupBy: v.optional(v.array(v.union(
        v.literal("DATE"),
        v.literal("CAMPAIGN"),
        v.literal("STATUS"),
        v.literal("DOMAIN"),
        v.literal("TEMPLATE")
      ))),
      sortBy: v.optional(v.object({
        field: v.string(),
        direction: v.union(v.literal("ASC"), v.literal("DESC")),
        nullsLast: v.optional(v.boolean()),
      })),
      pagination: v.optional(v.object({
        offset: v.optional(v.number()),
        limit: v.optional(v.number()),
        cursor: v.optional(v.string()),
      })),
      outputFormat: v.optional(v.object({
        includeRawData: v.optional(v.boolean()),
        includeAggregations: v.optional(v.boolean()),
        includeComparisons: v.optional(v.boolean()),
        includeTimeSeries: v.optional(v.boolean()),
        timeSeriesGranularity: v.optional(v.union(
          v.literal("HOUR"),
          v.literal("DAY"),
          v.literal("WEEK"),
          v.literal("MONTH"),
          v.literal("QUARTER"),
          v.literal("YEAR")
        )),
      })),
    })),
    
    // Required fields
    companyId: v.string(),
    requestId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // This query is designed to push TypeScript's type inference to its limits
    // and should definitely trigger the "excessively deep" warning
    
    const results = await ctx.db
      .query("campaignAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId))
      .collect();

    return {
      data: results,
      metadata: {
        requestId: args.requestId,
        processedAt: Date.now(),
        filters: args.primaryFilters,
        metrics: args.metricFilters,
        computation: args.computationOptions,
      },
    };
  },
});
