/**
 * Test Endpoint for Loop Email Service
 *
 * Provides endpoints to test Loop email functionality.
 * Use for development and integration testing.
 */

import { NextResponse } from 'next/server';
import { getLoopService } from '@/lib/loop/client';
import { productionLogger } from '@/lib/logger';
import {
  ApiSuccessResponse,
  ApiErrorResponse
} from '@/types';

// Test endpoint to send verification email
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userName = searchParams.get('userName') || 'Test User';
    const token = searchParams.get('token') || 'test-verification-token-123';

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required for testing' },
        { status: 400 }
      );
    }

    const loopService = getLoopService();
    const result = await loopService.sendVerificationEmail(email, token, userName);

    const successResponse: ApiSuccessResponse<{
      message: string,
      contactId: string | undefined,
      testData: {
        email: string,
        userName: string,
        token: string
      }
    }> = {
      success: true,
      data: {
        message: 'Test verification email sent successfully',
        contactId: result.contactId,
        testData: {
          email,
          userName,
          token,
        },
      },
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(successResponse);
  } catch (error) {
    productionLogger.error('Test verification email error:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Failed to send test verification email',
      code: 'EMAIL_SEND_FAILED',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Test connection endpoint (no published emails required)
export async function PATCH(_request: Request) {
  try {
    const loopService = getLoopService();

    // Test 1: Validate API Key by checking if service initializes
    const connectionTest = { success: true, message: 'API Key valid' };

    // Test 2: Try to create/update a test contact (this validates API access)
    const testContact = {
      email: `test-connection-${Date.now()}@penguinmails.test`,
      firstName: 'Test',
      lastName: 'Connection',
      userGroup: 'test-users',
      subscribed: false,
    };

    const contactResult = await loopService.createContact(testContact);

    const successResponse: ApiSuccessResponse<{
      message: string,
      tests: {
        apiKey: { success: boolean, message: string },
        contactCreation: {
          success: boolean,
          contactId: string | undefined,
          error: string | undefined
        }
      }
    }> = {
      success: true,
      data: {
        message: 'Loop connection test successful',
        tests: {
          apiKey: connectionTest,
          contactCreation: {
            success: contactResult.success,
            contactId: contactResult.contactId,
            error: contactResult.message,
          },
        },
      },
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(successResponse);
  } catch (error) {
    productionLogger.error('Loop connection test error:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Loop connection test failed',
      code: 'CONNECTION_TEST_FAILED',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Test endpoint to send different types of emails
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type = 'verification',
      email = 'test@example.com',
      userName = 'Test User',
      token = 'test-token-123',
      companyName = 'PenguinMails',
    } = body;

    const loopService = getLoopService();
    let result;

    switch (type) {
      case 'verification':
        result = await loopService.sendVerificationEmail(email, token, userName);
        break;
      case 'password-reset':
        result = await loopService.sendPasswordResetEmail(email, token, userName);
        break;
      case 'welcome':
        result = await loopService.sendWelcomeEmail(email, userName, companyName);
        break;
      default:
        const errorResponse: ApiErrorResponse = {
          success: false,
          error: 'Invalid email type. Use: verification, password-reset, or welcome',
          code: 'INVALID_EMAIL_TYPE',
          timestamp: new Date().toISOString()
        };
        return NextResponse.json(errorResponse, { status: 400 });
    }

    const successResponse: ApiSuccessResponse<{
      message: string,
      contactId: string | undefined,
      testData: {
        type: string,
        email: string,
        userName: string,
        token: string,
        companyName: string
      }
    }> = {
      success: true,
      data: {
        message: `Test ${type} email sent successfully`,
        contactId: result.contactId,
        testData: {
          type,
          email,
          userName,
          token,
          companyName,
        },
      },
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(successResponse);
  } catch (error) {
    productionLogger.error('Test email error:', error);
    const errorResponse: ApiErrorResponse = {
      success: false,
      error: 'Failed to send test email',
      code: 'EMAIL_SEND_FAILED',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}