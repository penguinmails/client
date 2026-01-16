/**
 * Application Limits and Quotas
 * 
 * Centralized limits for various app resources.
 * Part of the FSD shared layer.
 */

export const limits = {
  /** Maximum email accounts per user */
  maxEmailAccounts: 10,
  
  /** Maximum campaigns per user */
  maxCampaigns: 50,
  
  /** Maximum templates per user */
  maxTemplates: 100,
  
  /** Maximum leads per user */
  maxLeads: 10000,
  
  /** Maximum recipients per campaign */
  maxRecipientsPerCampaign: 1000,
  
  /** Warmup delay in hours */
  warmupDelayHours: 24,
  
  /** Number of retry attempts for failed operations */
  retryAttempts: 3
} as const;

export type Limits = typeof limits;
