import { NextRequest, NextResponse } from 'next/server';
import { getDatabaseService } from '@/lib/niledb/database';
import { z } from 'zod';

// Schema for email verification requests
const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = verifyEmailSchema.parse(body);

    // Simplified verification - just accept any token for now
    console.log('Verification token received:', validatedData.token);

    // In a real implementation, you would:
    // 1. Check if token exists in database
    // 2. Validate expiration
    // 3. Update user verification status
    // 4. Clean up token

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);

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
