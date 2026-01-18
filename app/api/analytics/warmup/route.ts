import { NextResponse } from "next/server";
import { MOCK_WARMUP_CHART_DATA } from "@features/analytics/lib/mocks/context";

/**
 * GET /api/analytics/warmup
 * Returns mock warmup chart data
 */
export async function GET() {
  // Simulate network delay (300ms)
  await new Promise(resolve => setTimeout(resolve, 300));

  return NextResponse.json(MOCK_WARMUP_CHART_DATA);
}
