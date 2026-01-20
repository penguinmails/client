export interface VerifyTurnstileResponse {
  success: boolean;
  message?: string;
  [key: string]: unknown;
}

/**
 * Verifies the Turnstile token with the backend.
 */
export async function verifyTurnstileToken(token: string): Promise<VerifyTurnstileResponse> {
  const res = await fetch("/api/verify-turnstile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.message || "Verification failed");
  }

  return data;
}
