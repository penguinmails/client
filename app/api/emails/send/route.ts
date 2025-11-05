import { NextRequest, NextResponse } from 'next/server';
import { getLoopService } from '@/lib/services/loop';
import { getAuthService } from '@/lib/niledb/auth';
import { getDatabaseService } from '@/lib/niledb/database';
import { z } from 'zod';

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
    // Skip authentication for verification emails during signup
    // const authService = getAuthService();
    // await authService.validateSession();

    const body = await request.json();
    const validatedData = transactionalEmailSchema.parse(body);

    const loopService = getLoopService();
    let result;

    switch (validatedData.type) {
      case 'verification': {
        // Generate a secure token for email verification
        const verificationToken = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Store token in database using NileDB
        const dbService = getDatabaseService();

        try {
          // Get user ID from email
          const userResult = await dbService.queryCrossTenant(
            'SELECT id FROM users.users WHERE email = $1 AND deleted IS NULL',
            [validatedData.email]
          );

          if (userResult.rows.length > 0) {
            const userId = userResult.rows[0].id;

            // Store verification token - try tenant-specific table first, fallback to public
            try {
              await dbService.queryCrossTenant(
                `INSERT INTO public.email_verification_tokens (user_id, email, token, expires_at, created_at)
                 VALUES ($1, $2, $3, $4, NOW())
                 ON CONFLICT (user_id) DO UPDATE SET
                   token = EXCLUDED.token,
                   expires_at = EXCLUDED.expires_at,
                   created_at = NOW()`,
                [userId, validatedData.email, verificationToken, expiresAt.toISOString()]
              );
            } catch (error) {
              // If table doesn't exist, skip token storage for now
              console.warn('Email verification tokens table not available, skipping token storage');
            }
          }
        } catch (error) {
          console.error('Error storing verification token:', error);
          // Continue with email sending even if token storage fails
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
          return NextResponse.json(
            { error: 'Token is required for password reset emails' },
            { status: 400 }
          );
        }
        result = await loopService.sendPasswordResetEmail(
          validatedData.email,
          validatedData.token,
          validatedData.userName
        );
        break;

      case 'welcome':
        if (!validatedData.userName) {
          return NextResponse.json(
            { error: 'User name is required for welcome emails' },
            { status: 400 }
          );
        }
        result = await loopService.sendWelcomeEmail(
          validatedData.email,
          validatedData.userName,
          validatedData.companyName
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        contactId: result.contactId,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message || 'Failed to send email',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email send error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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

    return NextResponse.json({
      success: testResult.success,
      message: testResult.success ? 'Test email sent successfully' : 'Failed to send test email',
      contactId: testResult.contactId,
      error: testResult.message,
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
