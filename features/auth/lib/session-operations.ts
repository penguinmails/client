import { ActiveSession, auth } from "@niledatabase/client";
import { productionLogger } from "@/lib/logger";
import { isRetryableError } from "@/lib/utils/errors";

export class SessionRecoveryError extends Error {
  constructor(message = "Failed to recover session after multiple attempts") {
    super(message);
    this.name = "SessionRecoveryError";
  }
}

/**
 * Check NileDB session - fast, hard gate for auth
 * 
 * @throws {Error} On network errors (retryable) - allows callers to distinguish network failures from "no session"
 * @returns {Object|null} Session data if valid session exists, null if no session (not an error condition)
 */
export async function checkSession(): Promise<{ id: string; email: string; emailVerified: Date | null } | null> {
  try {
    const session = await auth.getSession() as ActiveSession;
    const nileUser = session?.user;
    
    if (!nileUser) {
      return null;
    }
    
    return {
      id: nileUser.id,
      email: nileUser.email,
      emailVerified: nileUser.emailVerified ? new Date(nileUser.emailVerified) : null,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    productionLogger.error("[AuthOps] Session check failed:", err);
    
    if (isRetryableError(err)) {
      throw err;
    }
    
    return null;
  }
}

/**
 * Recover session with retry logic
 * 
 * Implements retry logic for network errors while treating null (no session) as a definitive state (unless retryOnNull is true).
 */
export async function recoverSessionWithRetry(
  maxAttempts = 3, 
  delayMs = 1000,
  retryOnNull = false
): Promise<{ id: string; email: string; emailVerified: Date | null } | null> {
  let attempt = 0;
  let lastError: Error | null = null;
  

  while (attempt < maxAttempts) {
    try {
      const session = await checkSession();
      
      // If we got a session, return it immediately
      if (session) {
        return session;
      }
      
      // If checkSession returned null
      if (!retryOnNull) {
        return null;
      }
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      lastError = err;
      
      if (!isRetryableError(err)) {
        return null;
      }
    }

    const backoffDelay = delayMs * Math.pow(1.5, attempt); // Slightly less aggressive backoff
    await new Promise(resolve => setTimeout(resolve, backoffDelay));
    attempt++;
  }
  
  // All retries exhausted
  if (lastError) {
    productionLogger.error("[AuthOps] Session recovery failed after all retries:", lastError);
    throw new SessionRecoveryError(`Failed to recover session after ${maxAttempts} attempts: ${lastError.message}`);
  }
  
  return null;
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
