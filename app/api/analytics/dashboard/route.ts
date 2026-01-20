import { NextResponse } from "next/server";
import { MOCK_STATS, MOCK_CHART_DATA } from "@features/analytics/lib/mocks/dashboard";

/**
 * GET /api/analytics/dashboard
 * Returns mock analytics dashboard data with simulated delay
 */
export async function GET() {
  // Simulate network delay (500ms)
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json({
    stats: MOCK_STATS,
    chartData: MOCK_CHART_DATA,
  });
}
