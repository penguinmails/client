export async function verifyTurnstileToken(
  token: string,
  noTokenMessage: string,
  verificationFailedMessage: string
) {
  if (!token) throw new Error(noTokenMessage);

  const res = await fetch("/api/verify-turnstile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    // Throw the error with the message returned from server
    throw new Error(data.message || verificationFailedMessage);
  }

  return data;
}
