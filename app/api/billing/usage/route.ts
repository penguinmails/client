import { NextRequest, NextResponse } from "next/server";
import { getUsageWithCalculations } from "@features/billing/actions";
import { productionLogger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const result = await getUsageWithCalculations(request);

    if (result.success && result.data) {
      return NextResponse.json({
        success: true,
        data: result.data,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch usage data",
        data: null,
      },
      { status: 500 }
    );
  } catch (error) {
    productionLogger.error("Failed to fetch usage data:", error);
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
