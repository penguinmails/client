import { NextRequest, NextResponse } from 'next/server';
import { nile } from '@/app/api/[...nile]/nile';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8),
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  },
);

/**
 * POST /api/auth/reset-password
 * 
 * Uses NileDB's native resetPassword API.
 * Requires the reset cookie to be set (done when user clicked email link).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    // Use NileDB's native resetPassword - requires cookie from email link click
    const response = await nile.auth.resetPassword({
      email: validatedData.email,
      password: validatedData.newPassword,
    });

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('NileDB resetPassword response:', response);
    }

    // Check if response indicates an error
    if (response && typeof response === 'object') {
      if ('status' in response) {
        const status = (response as Response).status;
        if (status >= 400) {
          const errorText = await (response as Response).text().catch(() => '');
          console.error('NileDB resetPassword error:', status, errorText);
          
          if (status === 404) {
            return NextResponse.json(
              { 
                error: 'Reset session expired. Please request a new password reset link.',
                code: 'SESSION_EXPIRED'
              },
              { status: 400 },
            );
          }
          
          return NextResponse.json(
            { error: 'Failed to reset password. Please try again.', code: 'RESET_FAILED' },
            { status: 400 },
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.issues, code: 'VALIDATION_ERROR' },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 },
    );
  }
}


