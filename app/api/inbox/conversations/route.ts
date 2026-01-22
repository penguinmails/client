import { NextRequest, NextResponse } from "next/server";
import { getFilteredConversations } from "@features/inbox/actions";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Convert URLSearchParams to Record<string, unknown>
    const params: Record<string, unknown> = {};
    searchParams.forEach((value, key) => {
      const existing = params[key];
      if (existing) {
        params[key] = Array.isArray(existing) 
          ? [...existing, value] 
          : [existing, value];
      } else {
        // Check if parameter appears multiple times
        const allValues = searchParams.getAll(key);
        params[key] = allValues.length > 1 ? allValues : value;
      }
    });

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
  } catch {
    return NextResponse.json({
      success: false,
      error: "Internal server error",
      data: [],
      count: 0,
    }, { status: 500 });
  }
}
