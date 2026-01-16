
import { verifyTurnstileToken as apiVerifyTurnstileToken } from "../api/security";

export async function verifyTurnstileToken(
  token: string,
  noTokenMessage: string,
  verificationFailedMessage: string
) {
  if (!token) throw new Error(noTokenMessage);

  try {
    return await apiVerifyTurnstileToken(token);
  } catch (error) {
    throw new Error((error as Error).message || verificationFailedMessage);
  }
}
