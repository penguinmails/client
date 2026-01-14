import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  validateVerificationToken,
  markTokenAsUsed,
  updateUserVerificationStatus,
  storeVerificationToken
} from '@features/auth/lib/email-verification';
import { productionLogger } from '@/lib/logger';
import { ApiErrorResponse, ApiSuccessResponse } from '@/shared/types/api';

// Schema for email verification requests
const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = verifyEmailSchema.parse(body);

    // Validate token using our utility
    const tokenValidation = await validateVerificationToken(validatedData.token);

    if (!tokenValidation.valid) {
      if (tokenValidation.expired) {
        const response: ApiErrorResponse = {
          success: false,
          error: 'This verification link has expired.',
          code: 'TOKEN_EXPIRED',
          details: { email: tokenValidation.email },
          timestamp: new Date().toISOString()
        };
        return NextResponse.json(response, { status: 400 });
      }
      
      if (tokenValidation.used) {
        const response: ApiErrorResponse = {
          success: false,
          error: 'This verification link has already been used.',
          code: 'TOKEN_ALREADY_USED',
          details: { email: tokenValidation.email },
          timestamp: new Date().toISOString()
        };
        return NextResponse.json(response, { status: 400 });
      }

      const response: ApiErrorResponse = {
        success: false,
        error: 'Invalid verification link. The token does not exist.',
        code: 'INVALID_TOKEN',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Token is valid, mark it as used
    const tokenMarked = await markTokenAsUsed(validatedData.token);
    if (!tokenMarked) {
      productionLogger.error(`Critical: Failed to mark token as used: ${validatedData.token}`);
      const response: ApiErrorResponse = {
        success: false,
        error: 'Verification process failed. Please try again.',
        code: 'TOKEN_MARKING_FAILED',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 500 });
    }

    // Update user verification status
    if (tokenValidation.email) {
      const userUpdated = await updateUserVerificationStatus(tokenValidation.email);
      if (!userUpdated) {
        productionLogger.error(`Critical: Failed to update verification status for email: ${tokenValidation.email}`);
        const response: ApiErrorResponse = {
          success: false,
          error: 'Verification process failed. Please try again.',
          code: 'USER_UPDATE_FAILED',
          timestamp: new Date().toISOString()
        };
        return NextResponse.json(response, { status: 500 });
      }
    }

    const successResponse: ApiSuccessResponse<{email?: string}> = {
      success: true,
      data: { email: tokenValidation.email },
      message: 'Email verified successfully',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(successResponse);

  } catch (error) {
    productionLogger.error('Email verification error:', error);

    if (error instanceof z.ZodError) {
      const response: ApiErrorResponse = {
        success: false,
        error: 'Invalid request data',
        code: 'VALIDATION_ERROR',
        details: error.issues,
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 400 });
    }

    const response: ApiErrorResponse = {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// GET endpoint for testing verification (development only)
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    const response: ApiErrorResponse = {
      success: false,
      error: 'Not available in production',
      code: 'ENDPOINT_NOT_AVAILABLE',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(response, { status: 404 });
  }

  try {
    // Generate a test verification token
    const testToken = crypto.randomUUID();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    // Store test token using our utility
    const tokenStored = await storeVerificationToken(
      'test@example.com',
      testToken,
      expiresAt
    );

    if (!tokenStored) {
      const response: ApiErrorResponse = {
        success: false,
        error: 'Failed to store test token',
        code: 'TOKEN_STORAGE_FAILED',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(response, { status: 500 });
    }

    const successResponse: ApiSuccessResponse<{
      token: string;
      testUrl: string;
      expiresAt: string;
    }> = {
      success: true,
      data: {
        token: testToken,
        testUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${testToken}`,
        expiresAt: new Date(expiresAt).toISOString(),
      },
      message: 'Test verification token created',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(successResponse);

  } catch (error) {
    productionLogger.error('Test verification error:', error);
    const response: ApiErrorResponse = {
      success: false,
      error: 'Failed to create test token',
      code: 'TEST_TOKEN_CREATION_FAILED',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(response, { status: 500 });
  }
}
