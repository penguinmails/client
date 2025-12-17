import { NextResponse } from "next/server";
import { checkLoginAttempts, incrementLoginAttempts, resetLoginAttempts } from "@/lib/auth/rate-limit";
import { validateTurnstileToken } from "@/lib/auth/turnstile";
import { nile } from "@/lib/niledb/client"; 

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password, turnstileToken } = body;

        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        }

        const identifier = String(email).trim().toLowerCase();

        // 1. Check Rate Limit
        const { requiresTurnstile } = await checkLoginAttempts(identifier);

        if (requiresTurnstile) {
            if (!turnstileToken) {
                return NextResponse.json(
                    {
                        message: "Missing Turnstile token",
                        requiresTurnstile: true,
                        userLockedBehindTurnstile: true,
                    },
                    { status: 403 }
                );
            }

            const turnstileResult = await validateTurnstileToken(turnstileToken);
            if (!turnstileResult.success) {
                return NextResponse.json(
                    {
                        message: "Invalid Turnstile token",
                        requiresTurnstile: true,
                        userLockedBehindTurnstile: true,
                    },
                    { status: 403 }
                );
            }
        }

        // 2. Authenticate with Nile SDK
        try {
            const user = await nile.auth.signIn("email", { email, password });

            
            await resetLoginAttempts(identifier);

            
            return NextResponse.json({ user });

        } catch (error) {
            
            const attempts = await incrementLoginAttempts(identifier);

            return NextResponse.json({
                message: "Invalid credentials",
                attempts,
                requiresTurnstile: (await checkLoginAttempts(identifier)).requiresTurnstile,
            }, { status: 401 });
        }

    } catch (error) {
        console.error("Login wrapper error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
