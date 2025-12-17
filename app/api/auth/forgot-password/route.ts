import { NextRequest, NextResponse } from 'next/server';
import { nile } from '@/shared/config/nile';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

/**
 * POST /api/auth/forgot-password
 * 
 * Uses NileDB's native forgotPassword which:
 * 1. Generates a secure token
 * 2. Sends email via configured SMTP
 * 3. Token is stored in auth.verification_tokens table
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = forgotPasswordSchema.parse(body);
    
    // callbackUrl: where user lands after clicking email link (to set cookie)
    // redirectUrl: final destination after cookie is set
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/reset-callback`;
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;

    // Use NileDB's native forgotPassword - handles token generation and email sending
    const response = await nile.auth.forgotPassword({
      email: validatedData.email,
      callbackUrl,
      redirectUrl,
    });

    // Log response for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log('NileDB forgotPassword response:', response);
    }

    // Always return success for security reasons (don't reveal if email exists)
    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, you will receive a password reset link shortly.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email format', details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}


