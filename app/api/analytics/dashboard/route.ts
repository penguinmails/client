import { NextResponse } from "next/server";
import { getGlobalStatsAction, getAnalyticsChartDataAction } from "@/features/analytics/actions/stats";
import { productionLogger } from "@/lib/logger";

/**
 * GET /api/analytics/dashboard
 * Returns real metrics from NileDB
 */
export async function GET() {
  try {
    const [statsResult, chartResult] = await Promise.all([
      getGlobalStatsAction(),
      getAnalyticsChartDataAction()
    ]);

    if (!statsResult.success || !chartResult.success) {
      throw new Error("Failed to fetch analytics data");
    }

    return NextResponse.json({
      stats: statsResult.data,
      chartData: chartResult.data,
    });
  } catch (error) {
    productionLogger.error("API /api/analytics/dashboard failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
