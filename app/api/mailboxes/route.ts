import { NextRequest, NextResponse } from "next/server";
import { MOCK_MAILBOXES, MOCK_ANALYTICS } from "@features/mailboxes/lib/mocks";

/**
 * GET /api/mailboxes
 * Returns mock mailboxes data with simulated delay
 */
export async function GET(request: NextRequest) {
  // Simulate network delay (500ms)
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check for analytics query parameter
  const searchParams = request.nextUrl.searchParams;
  const includeAnalytics = searchParams.get("analytics") === "true";

  if (includeAnalytics) {
    return NextResponse.json({
      mailboxes: MOCK_MAILBOXES,
      analytics: MOCK_ANALYTICS,
    });
  }

  return NextResponse.json(MOCK_MAILBOXES);
}

/**
 * POST /api/mailboxes
 * Placeholder for future mailbox creation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // In a real implementation, this would create a new mailbox
    // For now, return a success response
    return NextResponse.json(
      { message: "Mailbox created successfully", data: body },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
