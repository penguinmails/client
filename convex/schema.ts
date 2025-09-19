import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex schema for analytics data structures.
 * All analytics data is stored with standardized field names and Convex-compatible types.
 */
export default defineSchema({
  // ============================================================================
  // CAMPAIGN ANALYTICS
  // ============================================================================
  campaignAnalytics: defineTable({
    // Entity identification
    campaignId: v.string(),
    campaignName: v.string(),
    companyId: v.string(),
    
    // Time dimension
    date: v.string(), // ISO date string (YYYY-MM-DD)
    
    // Raw performance metrics (standardized field names)
    sent: v.number(),
    delivered: v.number(),
    opened_tracked: v.number(),
    clicked_tracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
    
    // Campaign-specific data
    status: v.union(v.literal("ACTIVE"), v.literal("PAUSED"), v.literal("COMPLETED"), v.literal("DRAFT")),
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

  // ============================================================================
  // DOMAIN ANALYTICS
  // ============================================================================
  domainAnalytics: defineTable({
    // Entity identification
    domainId: v.string(),
    domainName: v.string(),
    companyId: v.string(),
    
    // Time dimension
    date: v.string(), // ISO date string (YYYY-MM-DD)
    
    // Raw performance metrics (aggregated from mailboxes)
    sent: v.number(),
    delivered: v.number(),
    opened_tracked: v.number(),
    clicked_tracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
    
    // Domain-specific data
    authentication: v.object({
      spf: v.boolean(),
      dkim: v.boolean(),
      dmarc: v.boolean(),
    }),
    
    // Metadata
    updatedAt: v.number(),
  })
    .index("by_domain", ["domainId"])
    .index("by_company_date", ["companyId", "date"])
    .index("by_domain_date", ["domainId", "date"])
    .index("by_company_domain", ["companyId", "domainId"]),

  // ============================================================================
  // MAILBOX ANALYTICS
  // ============================================================================
  mailboxAnalytics: defineTable({
    // Entity identification
    mailboxId: v.string(),
    email: v.string(),
    domain: v.string(),
    provider: v.string(),
    companyId: v.string(),
    
    // Time dimension
    date: v.string(), // ISO date string (YYYY-MM-DD)
    
    // Raw performance metrics
    sent: v.number(),
    delivered: v.number(),
    opened_tracked: v.number(),
    clicked_tracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
    
    // Mailbox-specific data
    warmupStatus: v.union(
      v.literal("NOT_STARTED"),
      v.literal("WARMING"),
      v.literal("WARMED"),
      v.literal("PAUSED")
    ),
    warmupProgress: v.number(), // 0-100
    dailyLimit: v.number(),
    currentVolume: v.number(),
    
    // Metadata
    updatedAt: v.number(),
  })
    .index("by_mailbox", ["mailboxId"])
    .index("by_company_date", ["companyId", "date"])
    .index("by_mailbox_date", ["mailboxId", "date"])
    .index("by_domain", ["domain"])
    .index("by_company_mailbox", ["companyId", "mailboxId"]),

  // ============================================================================
  // LEAD ANALYTICS
  // ============================================================================
  leadAnalytics: defineTable({
    // Entity identification
    leadId: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    companyId: v.string(),
    
    // Time dimension
    date: v.string(), // ISO date string (YYYY-MM-DD)
    
    // Raw performance metrics (engagement with this lead)
    sent: v.number(),
    delivered: v.number(),
    opened_tracked: v.number(),
    clicked_tracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
    
    // Lead-specific data
    status: v.union(
      v.literal("ACTIVE"),
      v.literal("REPLIED"),
      v.literal("BOUNCED"),
      v.literal("UNSUBSCRIBED"),
      v.literal("COMPLETED")
    ),
    
    // Metadata
    updatedAt: v.number(),
  })
    .index("by_lead", ["leadId"])
    .index("by_company_date", ["companyId", "date"])
    .index("by_lead_date", ["leadId", "date"])
    .index("by_company_lead", ["companyId", "leadId"]),

  // ============================================================================
  // TEMPLATE ANALYTICS
  // ============================================================================
  templateAnalytics: defineTable({
    // Entity identification
    templateId: v.string(),
    templateName: v.string(),
    category: v.optional(v.string()),
    companyId: v.string(),
    
    // Time dimension
    date: v.string(), // ISO date string (YYYY-MM-DD)
    
    // Raw performance metrics (usage of this template)
    sent: v.number(),
    delivered: v.number(),
    opened_tracked: v.number(),
    clicked_tracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
    
    // Template-specific data
    usage: v.number(), // Number of times template was used
    
    // Metadata
    updatedAt: v.number(),
  })
    .index("by_template", ["templateId"])
    .index("by_company_date", ["companyId", "date"])
    .index("by_template_date", ["templateId", "date"])
    .index("by_company_template", ["companyId", "templateId"]),

  // ============================================================================
  // BILLING ANALYTICS
  // ============================================================================
  billingAnalytics: defineTable({
    // Entity identification
    companyId: v.string(),
    
    // Time dimension
    date: v.string(), // ISO date string (YYYY-MM-DD)
    
    // Usage metrics
    emailsSent: v.number(),
    emailsRemaining: v.number(),
    domainsUsed: v.number(),
    domainsLimit: v.number(),
    mailboxesUsed: v.number(),
    mailboxesLimit: v.number(),
    
    // Plan information
    planType: v.string(),
    
    // Cost metrics
    currentPeriodCost: v.number(),
    projectedCost: v.number(),
    currency: v.string(),
    
    // Metadata
    updatedAt: v.number(),
  })
    .index("by_company_date", ["companyId", "date"])
    .index("by_company", ["companyId"]),

  // ============================================================================
  // WARMUP ANALYTICS (Specialized for mailbox warmup tracking)
  // ============================================================================
  warmupAnalytics: defineTable({
    // Entity identification
    mailboxId: v.string(),
    companyId: v.string(),
    
    // Time dimension
    date: v.string(), // ISO date string (YYYY-MM-DD)
    
    // Warmup-specific metrics
    totalWarmups: v.number(),
    delivered: v.number(),
    spamComplaints: v.number(),
    replies: v.number(),
    bounced: v.number(),
    
    // Daily warmup stats
    emailsWarmed: v.number(),
    healthScore: v.number(), // 0-100, calculated from performance
    progressPercentage: v.number(), // 0-100
    
    // Metadata
    updatedAt: v.number(),
  })
    .index("by_mailbox", ["mailboxId"])
    .index("by_company_date", ["companyId", "date"])
    .index("by_mailbox_date", ["mailboxId", "date"]),

  // ============================================================================
  // SEQUENCE STEP ANALYTICS (Part of campaign analytics)
  // ============================================================================
  sequenceStepAnalytics: defineTable({
    // Entity identification
    stepId: v.string(),
    campaignId: v.string(),
    companyId: v.string(),
    
    // Time dimension
    date: v.string(), // ISO date string (YYYY-MM-DD)
    
    // Raw performance metrics
    sent: v.number(),
    delivered: v.number(),
    opened_tracked: v.number(),
    clicked_tracked: v.number(),
    replied: v.number(),
    bounced: v.number(),
    unsubscribed: v.number(),
    spamComplaints: v.number(),
    
    // Step-specific data
    stepType: v.union(v.literal("email"), v.literal("wait"), v.literal("action")),
    subject: v.optional(v.string()), // For email steps
    waitDuration: v.optional(v.number()), // For wait steps (in hours)
    sequenceOrder: v.number(),
    
    // Metadata
    updatedAt: v.number(),
  })
    .index("by_step", ["stepId"])
    .index("by_campaign", ["campaignId"])
    .index("by_company_date", ["companyId", "date"])
    .index("by_campaign_date", ["campaignId", "date"])
    .index("by_step_date", ["stepId", "date"]),
});
