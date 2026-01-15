export interface VerificationEmailData {
  email: string;
  name?: string;
}

/**
 * Sends a verification email to the user.
 */
export async function sendVerificationEmail(data: VerificationEmailData): Promise<boolean> {
  try {
    const response = await fetch("/api/emails/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "verification",
        email: data.email,
        userName: data.name,
        token: "temp-token", // This seems to be a placeholder in the original code as well
      }),
    });

    return response.ok;
  } catch (error) {
    // In the original code, it swallows the error and purely returns success (or implied success via UI toast catch).
    // We'll return false here to let the caller decide, or just swallow if strict parity is needed.
    // The original code in BaseAuthProvider actually swallows the error and toasts "success" anyway in the catch block! 
    // We will throw specifically so the caller knows, BUT noting the original logic was very permissive.
    throw error;
  }
}
