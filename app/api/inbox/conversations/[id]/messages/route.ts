import { NextRequest, NextResponse } from "next/server";
import { getMessages } from "@features/inbox/actions";
import { productionLogger } from "@/lib/logger";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await getMessages(id);

    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        data: result.data,
        count: result.data.length,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch messages",
        data: [],
        count: 0,
      },
      { status: 500 }
    );
  } catch (error) {
    productionLogger.error("Failed to fetch messages:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        data: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
