/**
 * Test Auth API Route - Validates session using NileDB SDK
 *
 * Used by AuthContext to check if the current session is still valid
 */

import { NextRequest, NextResponse } from "next/server";
import { validateSession, getCurrentUser } from "@/features/auth/queries";
import { productionLogger } from "@/lib/logger";
import {
  ApiSuccessResponse,
  ApiErrorResponse
} from '@/types';

export async function GET(req: NextRequest) {
  try {
    // Use NileDB SDK to validate session
    const isValid = await validateSession(req);
    
    if (!isValid) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: "No valid session",
        code: "SESSION_INVALID",
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Get basic user info for confirmation
    const user = await getCurrentUser(req);
    
    const successResponse: ApiSuccessResponse<{
        authenticated: boolean;
        message: string;
        user: { id: string; email: string; name: string | null | undefined } | null;
    }> = {
        success: true,
        data: {
            authenticated: true,
            message: "Session is valid",
            user: user ? {
                id: user.id,
                email: user.email,
                name: user.name,
            } : null,
        },
        timestamp: new Date().toISOString()
    };
    return NextResponse.json(successResponse);
  } catch (error) {
    productionLogger.error("[API/Test/Auth] Error validating session:", error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: "Session validation failed",
      code: "SESSION_VALIDATION_FAILED",
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }
}
