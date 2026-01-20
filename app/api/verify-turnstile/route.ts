// app/api/verify-turnstile/route.ts

import { NextRequest, NextResponse } from "next/server";
import { validateTurnstileToken } from "next-turnstile";
import { productionLogger, developmentLogger } from "@/lib/logger";
import { ApiErrorResponse, ApiSuccessResponse } from '@/types';
import { isFeatureEnabled } from "@/lib/features";

// Cloudflare test key that always passes (for dev/test environments)
const TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    // If Turnstile feature is disabled, return success immediately
    if (!isFeatureEnabled("turnstile")) {
      const successResponse: ApiSuccessResponse<object> = {
        success: true,
        data: {},
        message: "CAPTCHA verification disabled",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(successResponse);
    }

    const isDevOrTest =
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test";

    const envSecretKey = process.env.TURNSTILE_SECRET_KEY;
    const secretKey = envSecretKey || (isDevOrTest ? TEST_SECRET_KEY : undefined);

    if (!secretKey) {
      productionLogger.error("TURNSTILE_SECRET_KEY is not set.");
      const response: ApiErrorResponse = {
        success: false,
        error: "Server configuration error",
        code: "SERVER_CONFIG_ERROR",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 500 });
    }

    // IMPORTANT: Only use sandbox mode when using the test key.
    // Using sandbox: true with a real secret key causes "invalid-input-secret" errors.
    const result = await validateTurnstileToken({
      token,
      secretKey,
    });

    if (!result.success) {
      const errorCodes = (result as { "error-codes"?: string[] })["error-codes"] || [];
      developmentLogger.warn("Turnstile verification failed:", errorCodes);
      const response: ApiErrorResponse = {
        success: false,
        error: "Invalid CAPTCHA",
        code: "INVALID_CAPTCHA",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    const successResponse: ApiSuccessResponse<object> = {
      success: true,
      data: {},
      message: "CAPTCHA verification successful",
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(successResponse);
  } catch (error) {
    productionLogger.error("Turnstile verification error:", error);
    const response: ApiErrorResponse = {
      success: false,
      error: "An internal server error occurred.",
      code: "INTERNAL_ERROR",
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(response, { status: 500 });
  }
}
