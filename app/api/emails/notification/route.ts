/**
 * Email Notification Endpoint
 *
 * Handles sending notification emails using Loop service.
 * Accepts an email address and sends a notification message.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLoopService } from '@/lib/loop/client';
import { getCurrentUser } from '@/features/auth/queries';
import { z } from 'zod';
import { productionLogger } from '@/lib/logger';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '@/shared/types/api';

// Schema for notification email requests
const notificationEmailSchema = z.object({
  email: z.string().email(),
  message: z.string().min(1),
  subject: z.string().optional(),
  userName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Validate user session for security
    const user = await getCurrentUser();
    if (!user) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const body = await request.json();
    const validatedData = notificationEmailSchema.parse(body);

    const loopService = getLoopService();
    const result = await loopService.sendNotificationEmail(
      validatedData.email,
      validatedData.message,
      validatedData.subject,
      validatedData.userName
    );

    if (result.success) {
      const successResponse: ApiSuccessResponse<{
        message: string,
        contactId: string | undefined
      }> = {
        success: true,
        data: {
          message: 'Notification email sent successfully',
          contactId: result.contactId,
        },
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(successResponse);
    } else {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: result.message || 'Failed to send notification email',
        code: 'NOTIFICATION_EMAIL_FAILED',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }
  } catch (error) {
    productionLogger.error('Notification email error:', error);

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

// GET endpoint for testing notification email functionality
export async function GET(request: Request) {
  try {
    // Validate user session for security
    const user = await getCurrentUser();
    if (!user) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }
    const { searchParams } = new URL(request.url);

    // Validate email parameter with Zod for consistency
    const emailValidation = z.string().email({ message: "Valid email parameter is required" }).safeParse(searchParams.get('email'));
    if (!emailValidation.success) {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: emailValidation.error.issues[0].message,
        code: 'INVALID_EMAIL',
        details: emailValidation.error.issues,
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const email = emailValidation.data;
    const message = searchParams.get('message') ?? 'This is a test notification from PenguinMails';
    const subject = searchParams.get('subject') ?? 'Test Notification';
    const userName = searchParams.get('userName') ?? 'Test User';

    const loopService = getLoopService();
    const result = await loopService.sendNotificationEmail(email, message, subject, userName);

    const successResponse: ApiSuccessResponse<{
      message: string,
      contactId: string | undefined,
      testData: {
        email: string,
        message: string,
        subject: string,
        userName: string
      }
    }> = {
      success: true,
      data: {
        message: 'Notification email sent successfully',
        contactId: result.contactId,
        testData: {
          email,
          message,
          subject,
          userName,
        },
      },
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(successResponse);
  } catch (error) {
    productionLogger.error('Notification email error:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Failed to send notification email',
      code: 'NOTIFICATION_EMAIL_FAILED',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
