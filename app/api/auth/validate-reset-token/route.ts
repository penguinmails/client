import { NextRequest, NextResponse } from 'next/server';
import { api } from '@/convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import { z } from 'zod';

const validateTokenSchema = z.object({
  token: z.string().min(1),
});

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateTokenSchema.parse(body);

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

    // Token is valid
    return NextResponse.json({
      valid: true,
      message: 'Token is valid',
    });

  } catch (error) {
    console.error('Validate reset token error:', error);

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
