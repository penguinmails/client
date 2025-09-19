/**
 * Test Schema: Simplified Parameter Structures
 * 
 * This file contains test schemas with progressively simplified parameter structures
 * to identify the root cause of "Convex type instantiation is excessively deep" warnings.
 */

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ============================================================================
// TEST 1: MINIMAL SCHEMA - BASIC TYPES ONLY
// ============================================================================

export const minimalSchema = defineSchema({
  simpleTable: defineTable({
    id: v.string(),
    name: v.string(),
    count: v.number(),
    active: v.boolean(),
  }).index("by_id", ["id"]),
});

// ============================================================================
// TEST 2: MODERATE COMPLEXITY - SOME OBJECTS AND UNIONS
// ============================================================================

export const moderateSchema = defineSchema({
  moderateTable: defineTable({
    id: v.string(),
    name: v.string(),
    status: v.union(v.literal("ACTIVE"), v.literal("INACTIVE")),
    metrics: v.object({
      count: v.number(),
      rate: v.number(),
    }),
    tags: v.array(v.string()),
  })
    .index("by_id", ["id"])
    .index("by_status", ["status"]),
});

// ============================================================================
// TEST 3: HIGH COMPLEXITY - NESTED OBJECTS AND MULTIPLE UNIONS
// ============================================================================

export const complexSchema = defineSchema({
  complexTable: defineTable({
    id: v.string(),
    name: v.string(),
    status: v.union(
      v.literal("DRAFT"),
      v.literal("ACTIVE"), 
      v.literal("PAUSED"),
      v.literal("COMPLETED"),
      v.literal("ARCHIVED")
    ),
    metrics: v.object({
      sent: v.number(),
      delivered: v.number(),
      opened: v.number(),
      clicked: v.number(),
      replied: v.number(),
      bounced: v.number(),
      unsubscribed: v.number(),
      complaints: v.number(),
    }),
    config: v.object({
      settings: v.object({
        enabled: v.boolean(),
        priority: v.union(v.literal("LOW"), v.literal("MEDIUM"), v.literal("HIGH")),
        options: v.array(v.string()),
      }),
      authentication: v.object({
        spf: v.boolean(),
        dkim: v.boolean(),
        dmarc: v.boolean(),
      }),
    }),
    metadata: v.object({
      createdAt: v.number(),
      updatedAt: v.number(),
      version: v.string(),
    }),
  })
    .index("by_id", ["id"])
    .index("by_status", ["status"])
    .index("by_created", ["metadata.createdAt"]),
});

// ============================================================================
// TEST 4: CURRENT ANALYTICS COMPLEXITY LEVEL
// ============================================================================

export const analyticsLevelSchema = defineSchema({
  campaignAnalytics: defineTable({
    // Entity identification
    campaignId: v.string(),
    campaignName: v.string(),
    companyId: v.string(),
    
    // Time dimension
    date: v.string(),
    
    // Raw performance metrics (8 fields)
    sent: v.number(),
    delivered: v.number(),
    opened_tracked: v.number(),
    clicked_tracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
    
    // Campaign-specific data
    status: v.union(
      v.literal("ACTIVE"), 
      v.literal("PAUSED"), 
      v.literal("COMPLETED"), 
      v.literal("DRAFT")
    ),
    leadCount: v.number(),
    activeLeads: v.number(),
    completedLeads: v.number(),
    
    // Metadata
    updatedAt: v.number(),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_company_date", ["companyId", "date"])
    .index("by_campaign_date", ["campaignId", "date"])
    .index("by_company_campaign", ["companyId", "campaignId"]),
});
