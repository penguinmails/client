/**
 * Type Instantiation Demonstration
 * 
 * This file demonstrates the specific patterns that cause
 * "Type instantiation is excessively deep" warnings in Convex.
 */

import { query } from "../_generated/server";
import { v } from "convex/values";

// ============================================================================
// DEMONSTRATION 1: SIMPLE QUERY (NO WARNINGS)
// ============================================================================

export const simpleQueryNoWarnings = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    // This simple pattern doesn't trigger warnings
    return await ctx.db
      .query("campaignAnalytics")
      .filter((q) => q.eq(q.field("campaignId"), args.id))
      .first();
  },
});

// ============================================================================
// DEMONSTRATION 2: MODERATE COMPLEXITY (MINOR WARNINGS)
// ============================================================================

export const moderateComplexityQuery = query({
  args: {
    companyId: v.string(),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    // This pattern may trigger minor warnings
    let query = ctx.db
      .query("campaignAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId));

    if (args.dateRange) {
      query = query.filter((q) =>
        q.and(
          q.gte(q.field("date"), args.dateRange!.start),
          q.lte(q.field("date"), args.dateRange!.end)
        )
      );
    }

    return await query.collect();
  },
});

// ============================================================================
// DEMONSTRATION 3: HIGH COMPLEXITY (TRIGGERS WARNINGS)
// ============================================================================

export const highComplexityQuery = query({
  args: {
    // Multiple optional nested objects
    companyId: v.string(),
    campaignIds: v.optional(v.array(v.string())),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
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
    })),
    options: v.optional(v.object({
      includeMetrics: v.optional(v.boolean()),
      includeTimeSeries: v.optional(v.boolean()),
      granularity: v.optional(v.union(
        v.literal("day"),
        v.literal("week"),
        v.literal("month")
      )),
    })),
  },
  handler: async (ctx, args) => {
    // This complex pattern WILL trigger "Type instantiation is excessively deep"
    let query = ctx.db
      .query("campaignAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId));

    // Multiple conditional filters compound the type complexity
    if (args.dateRange) {
      query = query.filter((q) =>
        q.and(
          q.gte(q.field("date"), args.dateRange!.start),
          q.lte(q.field("date"), args.dateRange!.end)
        )
      );
    }

    if (args.campaignIds?.length) {
      query = query.filter((q) =>
        q.or(...args.campaignIds!.map(id => q.eq(q.field("campaignId"), id)))
      );
    }

    if (args.filters?.status?.length) {
      query = query.filter((q) =>
        q.or(...args.filters!.status!.map(status => q.eq(q.field("status"), status)))
      );
    }

    if (args.filters?.minSent !== undefined) {
      query = query.filter((q) => q.gte(q.field("sent"), args.filters!.minSent!));
    }

    if (args.filters?.maxSent !== undefined) {
      query = query.filter((q) => q.lte(q.field("sent"), args.filters!.maxSent!));
    }

    const results = await query.collect();

    // Complex return type also contributes to the issue
    return {
      campaigns: results,
      metadata: {
        dateRange: args.dateRange,
        campaignCount: results.length,
        filters: args.filters,
        options: args.options,
        includesMetrics: args.options?.includeMetrics ?? false,
        includesTimeSeries: args.options?.includeTimeSeries ?? false,
        granularity: args.options?.granularity ?? "day",
        generatedAt: Date.now(),
      },
    };
  },
});

// ============================================================================
// DEMONSTRATION 4: THE EXACT PATTERN CAUSING ISSUES
// ============================================================================

/**
 * This demonstrates the exact pattern from our analytics services
 * that triggers the "Type instantiation is excessively deep" warning.
 * 
 * The issue occurs when:
 * 1. Multiple optional nested objects in args
 * 2. Complex conditional filtering logic
 * 3. Generic type inference through multiple layers
 * 4. Complex return type structures
 */
export const analyticsPatternDemo = query({
  args: {
    // This mirrors the complexity of our actual analytics queries
    companyId: v.string(),
    entityIds: v.optional(v.array(v.string())),
    dateRange: v.optional(v.object({
      start: v.string(),
      end: v.string(),
    })),
    includeSequenceData: v.optional(v.boolean()),
    includeTimeSeriesData: v.optional(v.boolean()),
    filters: v.optional(v.object({
      campaignStatus: v.optional(v.array(v.union(
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
    // This is the EXACT pattern that causes TypeScript to emit:
    // "Type instantiation is excessively deep and possibly infinite"
    
    let query = ctx.db
      .query("campaignAnalytics")
      .withIndex("by_company_date", (q) => q.eq("companyId", args.companyId));

    // Each conditional filter adds to the type complexity
    if (args.dateRange) {
      query = query.filter((q) =>
        q.and(
          q.gte(q.field("date"), args.dateRange!.start),
          q.lte(q.field("date"), args.dateRange!.end)
        )
      );
    }

    if (args.entityIds?.length) {
      query = query.filter((q) =>
        q.or(...args.entityIds!.map(id => q.eq(q.field("campaignId"), id)))
      );
    }

    if (args.filters?.campaignStatus?.length) {
      query = query.filter((q) =>
        q.or(...args.filters!.campaignStatus!.map(status => q.eq(q.field("status"), status)))
      );
    }

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

    // The complex return type structure compounds the issue
    return {
      campaigns: results.map(campaign => ({
        ...campaign,
        // Additional computed fields add more type complexity
        computedMetrics: {
          deliveryRate: campaign.delivered / (campaign.sent || 1),
          openRate: campaign.opened_tracked / (campaign.delivered || 1),
          clickRate: campaign.clicked_tracked / (campaign.opened_tracked || 1),
          replyRate: campaign.replied / (campaign.delivered || 1),
        },
      })),
      timeSeriesData: args.includeTimeSeriesData ? [] : null,
      sequenceAnalytics: args.includeSequenceData ? {} : null,
      metadata: {
        dateRange: args.dateRange,
        campaignCount: results.length,
        includesSequenceData: Boolean(args.includeSequenceData),
        includesTimeSeriesData: Boolean(args.includeTimeSeriesData),
        filters: args.filters,
        computeOptions: args.computeOptions,
        generatedAt: Date.now(),
      },
    };
  },
});

// ============================================================================
// TYPE COMPLEXITY ANALYSIS
// ============================================================================

/**
 * Analysis of why the above pattern causes type instantiation issues:
 * 
 * 1. ARGUMENT VALIDATION COMPLEXITY:
 *    - 6 optional parameters with nested objects
 *    - Multiple union types within optional objects
 *    - Array types with union elements
 *    - Creates exponential type combinations
 * 
 * 2. CONDITIONAL LOGIC COMPLEXITY:
 *    - Each if statement creates a conditional type branch
 *    - TypeScript must track all possible execution paths
 *    - Filter chains compound the type inference complexity
 * 
 * 3. GENERIC TYPE PROPAGATION:
 *    - Convex query builder uses complex generics
 *    - Each filter operation propagates generic constraints
 *    - Return type inference through multiple generic layers
 * 
 * 4. RETURN TYPE COMPLEXITY:
 *    - Nested object with computed properties
 *    - Conditional properties based on input parameters
 *    - TypeScript must infer the exact shape based on all inputs
 * 
 * SOLUTION:
 * The ConvexQueryHelper utility breaks this chain by using type assertions
 * at the service layer, preventing TypeScript from attempting deep type
 * inference through the entire Convex type system.
 */
