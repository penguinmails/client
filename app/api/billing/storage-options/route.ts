import { NextRequest, NextResponse } from "next/server";
import { getStorageOptions } from "@features/billing/actions";
import { productionLogger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const result = await getStorageOptions(request);

    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        data: result.data,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch storage options",
        data: null,
      },
      { status: 500 }
    );
  } catch (error) {
    productionLogger.error("Failed to fetch storage options:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        data: null,
      },
      { status: 500 }
    );
  }
}
