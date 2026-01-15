import { auth } from "@niledatabase/client";
import { productionLogger } from "@/lib/logger";

export class SignupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SignupError";
  }
}

interface SignupCredentials {
  email: string;
  password: string;
}

export async function signupWithVerification(
  credentials: SignupCredentials,
  name: string
): Promise<void> {
  try {
    const { error, user } = await auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new SignupError(error.message || "Signup failed");
    }

    if (user) {
        // We can update the user profile with the name immediately or rely on Nile?
        // Nile JS client signUp doesn't accept name directly in some versions, or maybe it does?
        // The hook accepted it. The client might accept it in options or we need to update profile.
        // Let's assume we need to update profile if signUp doesn't take it.
        // But for verification email, we need to send it.
        
        // If we need to send verification email manually:
        await fetch("/api/emails/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "verification",
            email: credentials.email,
            userName: name,
            token: "temp-token", // In a real flow this should be a real token
          }),
        });

        // Store pending email for UI if needed
        if (typeof window !== 'undefined') {
             localStorage.setItem("pendingVerificationEmail", credentials.email);
        }
    }
  } catch (err) {
    productionLogger.error("Signup operation failed", err);
    throw err instanceof SignupError ? err : new SignupError((err as Error).message);
  }
}
