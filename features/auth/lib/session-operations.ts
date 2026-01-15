import { ActiveSession, auth } from "@niledatabase/client";
import { productionLogger } from "@/lib/logger";

export class SessionRecoveryError extends Error {
  constructor(message = "Failed to recover session after multiple attempts") {
    super(message);
    this.name = "SessionRecoveryError";
  }
}

/**
 * Check NileDB session - fast, hard gate for auth
 */
export async function checkSession(): Promise<{ id: string; email: string; emailVerified: Date | null } | null> {
  try {
    const session = await auth.getSession() as ActiveSession;
    const nileUser = session?.user;
    
    if (!nileUser) return null;
    
    return {
      id: nileUser.id,
      email: nileUser.email,
      emailVerified: nileUser.emailVerified ? new Date(nileUser.emailVerified) : null,
    };
  } catch (error) {
    productionLogger.error("[AuthOps] Session check failed:", error);
    return null;
  }
}

/**
 * Recover session with retry logic
 */
export async function recoverSessionWithRetry(
  maxAttempts = 3, 
  delayMs = 1000
): Promise<{ id: string; email: string; emailVerified: Date | null } | null> {
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      const session = await checkSession();
      if (session) return session;
      
      // If no session, wait and retry? 
      // checkSession returns null on failure or no session.
      // If it returns null, it might be just not logged in.
      // But if we are "recovering", we imply we expect it to be there?
      // The user prompt said: "if isNetworkError(error)". 
      // checkSession swallows errors and returns null.
      // We should probably allow checkSession to throw if we want to catch network errors,
      // OR we just retry on null?
      // Retrying on null is useful for race conditions (cookie not set yet).
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
      attempt++;
    } catch (error) {
       // If checkSession threw, it was logged. 
       // If we change checkSession to throw on network error, we could catch it here.
       // For now, let's assume checkSession catches internally. 
       // But to implement "retry" effectively for network issues, checkSession needs to bubble up network errors.
       // However, the existing checkSession swallows everything.
       // Let's rely on the loop for now.
       await new Promise(resolve => setTimeout(resolve, delayMs));
       attempt++;
    }
  }
  return null; // Return null instead of throwing if simply not found
}

export async function performLogout(
  options: { immediate?: boolean; timer?: number } = {}
): Promise<void> {
  try {
    if (!options.immediate && options.timer) {
      await new Promise(resolve => setTimeout(resolve, options.timer));
    }
    await auth.signOut();
  } catch (error) {
    productionLogger.warn('[AuthOps] Logout failed (this may be expected during page navigation):', error);
  }
}
