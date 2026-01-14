import { NextRequest, NextResponse } from 'next/server';
import { getLoopService } from '@/lib/loop/client';
import { z } from 'zod';
import {
  generateVerificationToken,
  getVerificationTokenExpiry,
  storeVerificationToken
} from '@features/auth/lib/email-verification';
import { productionLogger, developmentLogger } from '@/lib/logger';
import {
  ApiSuccessResponse,
  ApiErrorResponse
} from '@/shared/types/api';

// Schema for transactional email requests
const transactionalEmailSchema = z.object({
  type: z.enum(['verification', 'password-reset', 'welcome']),
  email: z.string().email(),
  userName: z.string().optional(),
  token: z.string().optional(),
  companyName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // For verification emails, we might not have a valid session yet
    // So we'll skip session validation for verification emails
    const body = await request.json();
    const validatedData = transactionalEmailSchema.parse(body);

    const loopService = getLoopService();
    let result;

    switch (validatedData.type) {
      case 'verification': {
        // Generate a secure token for email verification
        const verificationToken = generateVerificationToken();
        const expiresAt = getVerificationTokenExpiry();

        // Store token in database for reliable verification
        const tokenStored = await storeVerificationToken(
          validatedData.email,
          verificationToken,
          expiresAt
        );
        
        if (!tokenStored) {
          developmentLogger.warn('Failed to store verification token, but continuing with email');
        }

        result = await loopService.sendVerificationEmail(
          validatedData.email,
          verificationToken,
          validatedData.userName
        );
        break;
      }

      case 'password-reset':
        if (!validatedData.token) {
          const errorResponse: ApiErrorResponse = {
            success: false,
            error: 'Token is required for password reset emails',
            code: 'MISSING_TOKEN',
            timestamp: new Date().toISOString()
          };
          return NextResponse.json(errorResponse, { status: 400 });
        }
        result = await loopService.sendPasswordResetEmail(
          validatedData.email,
          validatedData.token,
          validatedData.userName
        );
        break;

      case 'welcome':
        if (!validatedData.userName) {
          const errorResponse: ApiErrorResponse = {
            success: false,
            error: 'User name is required for welcome emails',
            code: 'MISSING_USER_NAME',
            timestamp: new Date().toISOString()
          };
          return NextResponse.json(errorResponse, { status: 400 });
        }
        result = await loopService.sendWelcomeEmail(
          validatedData.email,
          validatedData.userName,
          validatedData.companyName
        );
        break;

      default:
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: 'Invalid email type',
          code: 'INVALID_EMAIL_TYPE',
          timestamp: new Date().toISOString()
        };
        return NextResponse.json(errorResponse, { status: 400 });
    }

    if (result.success) {
      const successResponse: ApiSuccessResponse<{
        message: string,
        contactId: string | undefined
      }> = {
        success: true,
        data: {
          message: 'Email sent successfully',
          contactId: result.contactId,
        },
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(successResponse);
    } else {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: result.message || 'Failed to send email',
        code: 'EMAIL_SEND_FAILED',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }
  } catch (error) {
    productionLogger.error('Email send error:', error);

    if (error instanceof z.ZodError) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Invalid request data',
        code: 'VALIDATION_ERROR',
        details: error.issues,
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// GET endpoint for testing email functionality
export async function GET() {
  try {
    const loopService = getLoopService();

    // Send a test verification email
    const testResult = await loopService.sendVerificationEmail(
      'test@example.com',
      'test-verification-token-123',
      'Test User'
    );

    const successResponse: ApiSuccessResponse<{
      message: string,
      contactId: string | undefined
    }> = {
      success: true,
      data: {
        message: 'Test email sent successfully',
        contactId: testResult.contactId,
      },
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(successResponse);
  } catch (error) {
    productionLogger.error('Test email error:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Failed to send test email',
      code: 'TEST_EMAIL_FAILED',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
