import { NextResponse } from "next/server";
import { campaignsData } from "@/features/campaigns/lib/mocks";

/**
 * GET /api/campaigns
 * Returns mock campaigns data with simulated delay
 */
export async function GET() {
  // Simulate network delay (500ms)
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json(campaignsData);
}

/**
 * POST /api/campaigns
 * Placeholder for future campaign creation
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // In a real implementation, this would create a new campaign
    return NextResponse.json(
      { message: "Campaign created successfully", data: body },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
