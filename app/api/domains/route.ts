import { NextRequest, NextResponse } from "next/server";
import { getDomainsData } from "@features/domains/actions";
import { productionLogger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const result = await getDomainsData(request);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    productionLogger.error("Failed to fetch domains data:", error);
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
