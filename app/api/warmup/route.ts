import { NextResponse } from "next/server";
import { MOCK_WARMUP_DATA } from "@features/domains/lib/mocks/warmup";

/**
 * GET /api/warmup
 * Returns mock warmup data with simulated delay
 */
export async function GET() {
  // Simulate network delay (500ms)
  await new Promise(resolve => setTimeout(resolve, 500));

  return NextResponse.json(MOCK_WARMUP_DATA);
}

/**
 * POST /api/warmup
 * Placeholder for future warmup configuration
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // In a real implementation, this would configure warmup settings
    return NextResponse.json(
      { message: "Warmup configuration updated successfully", data: body },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
