import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/niledb/auth";
import { isDuplicateEmailError } from "@/lib/niledb/errors";

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
    console.error("Signup API error:", error);

    // Handle duplicate email errors
    if (isDuplicateEmailError(error)) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          i18nKey: error.isVerified
            ? "emailAlreadyExistsVerified"
            : "emailAlreadyExistsUnverified",
          actionType: error.isVerified ? "LOGIN" : "RESEND_VERIFICATION",
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
