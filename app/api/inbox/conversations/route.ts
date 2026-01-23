import { NextRequest, NextResponse } from "next/server";
import { getFilteredConversations } from "@features/inbox/actions";
import { productionLogger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Convert URLSearchParams to Record<string, unknown>
    const params: Record<string, unknown> = {};
    for (const key of new Set(searchParams.keys())) {
      const allValues = searchParams.getAll(key);
      params[key] = allValues.length > 1 ? allValues : allValues[0];
    }

    const conversationsResult = await getFilteredConversations(params, request);

    if (conversationsResult.success && conversationsResult.data) {
      return NextResponse.json({
        success: true,
        data: conversationsResult.data,
        count: conversationsResult.data.length,
      });
    }

    return NextResponse.json({
      success: false,
      error: "Failed to fetch conversations",
      data: [],
      count: 0,
    }, { status: 500 });
  } catch (error) {
    productionLogger.error("Failed to fetch conversations:", error);
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      data: [],
      count: 0,
    }, { status: 500 });
  }
}
