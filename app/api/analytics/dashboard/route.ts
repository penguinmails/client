import { NextResponse } from "next/server";
import { getGlobalStatsAction, getAnalyticsChartDataAction } from "@/features/analytics/actions/stats";
import { productionLogger } from "@/lib/logger";

import { 
  getCached, 
  setCache, 
  CacheTTL 
} from '@/lib/cache/cache-service';

/**
 * GET /api/analytics/dashboard
 * Returns real metrics from NileDB
 */
export async function GET() {
  const cacheKey = 'pm:analytics:dashboard';
  
  try {
    const cached = await getCached<unknown>(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT' }
      });
    }

    const [statsResult, chartResult] = await Promise.all([
      getGlobalStatsAction(),
      getAnalyticsChartDataAction()
    ]);

    if (!statsResult.success || !chartResult.success) {
      throw new Error("Failed to fetch analytics data");
    }

    const responseData = {
      stats: statsResult.data,
      chartData: chartResult.data,
    };

    await setCache(cacheKey, responseData, CacheTTL.DASHBOARD);

    return NextResponse.json(responseData, {
      headers: { 'X-Cache': 'MISS' }
    });
  } catch (error) {
    productionLogger.error("API /api/analytics/dashboard failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
