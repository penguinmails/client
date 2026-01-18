import { NextResponse } from "next/server";
import { MOCK_MAILBOX_DATA } from "@features/analytics/lib/mocks/context";

/**
 * GET /api/analytics/mailboxes
 * Returns mock mailboxes for analytics context
 */
export async function GET() {
  // Simulate network delay (500ms)
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json(MOCK_MAILBOX_DATA);
}
