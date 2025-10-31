import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { getAuthService } from '@/lib/niledb/auth';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    // Validate token
    const tokenInfo = await (convex as any).query('passwordResetTokens:validateToken', {
      token: validatedData.token,
    });

    if (!tokenInfo) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      );
    }

    if (tokenInfo.expired) {
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    if (tokenInfo.used) {
      return NextResponse.json(
        { error: 'Reset token has already been used' },
        { status: 400 }
      );
    }

    // Update password using NileDB auth service
    const authService = getAuthService();
    // Use a type assertion and runtime check because AuthService type may not declare updatePassword
    if (typeof (authService as any).updatePassword !== 'function') {
      throw new Error('Auth service does not implement updatePassword');
    }
    await (authService as any).updatePassword(tokenInfo.email, validatedData.newPassword);

    // Mark token as used (only if _id exists)
    if (tokenInfo._id) {
      await (convex as any).mutation('passwordResetTokens:markTokenAsUsed', {
        tokenId: tokenInfo._id,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully',
    });

  } catch (error) {
    console.error('Reset password error:', error);

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
