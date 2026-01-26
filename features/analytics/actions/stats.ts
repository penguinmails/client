"use server";

import { eventStorageService } from "../lib/services/EventStorageService";
import { productionLogger } from "@/lib/logger";
import { listCampaignsAction } from "@/features/marketing/actions/campaigns";
import { makeMauticRequest } from "@/features/marketing/lib/mautic-client";
import { getSystemServicesAction } from "@/features/infrastructure/actions/monitoring";

/**
 * Gets global analytics stats for the dashboard
 */
export async function getGlobalStatsAction() {
  try {
    const stats = await eventStorageService.getAggregatedStats();
    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    productionLogger.error("[getGlobalStatsAction] Failed:", error);
    return {
      success: false,
      error: "Failed to fetch global stats",
    };
  }
}

/**
 * Gets analytics stats for a specific campaign
 */
export async function getCampaignStatsAction(campaignId: number) {
  try {
    const stats = await eventStorageService.getAggregatedStats(campaignId);
    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    productionLogger.error(`[getCampaignStatsAction] Failed for ${campaignId}:`, error);
    return {
      success: false,
      error: `Failed to fetch stats for campaign ${campaignId}`,
    };
  }
}

/**
 * Gets chart data (time series) for analytics dashboard
 */
export async function getAnalyticsChartDataAction(campaignId?: number) {
  try {
    const chartData = await eventStorageService.getTimeSeriesData(campaignId);
    return {
      success: true,
      data: chartData,
    };
  } catch (error) {
    productionLogger.error("[getAnalyticsChartDataAction] Failed:", error);
    return {
      success: false,
      error: "Failed to fetch chart data",
    };
  }
}

/**
 * Gets dashboard analytics data from Mautic and Hestia
 */
export async function getDashboardAnalyticsAction() {
  try {
    // 1. Fetch campaigns to get Active count
    const campaignsResult = await listCampaignsAction({ limit: 100 });
    const activeCampaigns = campaignsResult.success && campaignsResult.data 
      ? campaignsResult.data.data.filter(c => c.isPublished).length 
      : 0;

    // 2. Fetch global email stats from Mautic stats endpoint
    // We use the total from /stats/email_stats to get total sent
    interface StatsResponse { total: number }
    const [sentStats, openedStats, clickedStats, bouncedStats] = await Promise.all([
       makeMauticRequest<StatsResponse>('GET', '/stats/email_stats', { params: { limit: 1 } }).catch(() => ({ total: 0 })),
       makeMauticRequest<StatsResponse>('GET', '/stats/email_stats', { params: { limit: 1, 'where[0][col]': 'is_read', 'where[0][expr]': 'eq', 'where[0][val]': 1 } }).catch(() => ({ total: 0 })),
       makeMauticRequest<StatsResponse>('GET', '/stats/page_hits', { params: { limit: 1, 'where[0][col]': 'email_id', 'where[0][expr]': 'isNotNull' } }).catch(() => ({ total: 0 })),
       makeMauticRequest<StatsResponse>('GET', '/stats/email_stats', { params: { limit: 1, 'where[0][col]': 'is_failed', 'where[0][expr]': 'eq', 'where[0][val]': 1 } }).catch(() => ({ total: 0 })),
    ]);

    const totalSent = Number(sentStats.total || 0);
    const totalOpened = Number(openedStats.total || 0);
    const totalClicked = Number(clickedStats.total || 0);
    const totalBounced = Number(bouncedStats.total || 0);

    // 3. Fetch System Health from Hestia
    const systemServices = await getSystemServicesAction();
    const systemHealth = systemServices.success && systemServices.data
      ? (systemServices.data.every(s => s.state === 'running') ? 100 : 85)
      : 0;

    return {
      success: true,
      data: {
        activeCampaigns,
        totalLeadsContacted: totalSent,
        openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
        replyRate: totalSent > 0 ? (totalClicked / totalSent) * 0.5 : 0, // Approximation for now
        bounceRate: totalSent > 0 ? (totalBounced / totalSent) * 100 : 0,
        systemHealth
      }
    };
  } catch (error) {
    productionLogger.error("[getDashboardAnalyticsAction] Failed:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard analytics"
    };
  }
}
