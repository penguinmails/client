"use server";

import { eventStorageService } from "../lib/services/EventStorageService";
import { productionLogger } from "@/lib/logger";

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
