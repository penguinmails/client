import { NextResponse } from "next/server";
import { MOCK_ACCOUNT_METRICS } from "@features/analytics/lib/mocks/context";

/**
 * GET /api/analytics/account-metrics
 * Returns mock account metrics
 */
export async function GET() {
  // Simulate network delay (300ms)
  await new Promise(resolve => setTimeout(resolve, 300));

  return NextResponse.json(MOCK_ACCOUNT_METRICS);
}
