import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/nile/auth";
import { isDuplicateEmailError } from "@/lib/nile/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const authService = new AuthService();
    const user = await authService.signUp({ email, password, name });

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {

    // Handle duplicate email errors
    if (isDuplicateEmailError(error)) {
      const duplicateError = error as {
        message: string;
        code: string;
        isVerified: boolean;
      };
      return NextResponse.json(
        {
          error: duplicateError.message,
          code: duplicateError.code,
          i18nKey: duplicateError.isVerified
            ? "emailAlreadyExistsVerified"
            : "emailAlreadyExistsUnverified",
          actionType: duplicateError.isVerified ? "LOGIN" : "RESEND_VERIFICATION",
        },
        { status: 409 } // Conflict status
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to sign up user",
      },
      { status: 500 }
    );
  }
}