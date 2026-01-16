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
    
    if (!nileUser) return null;
    
    return {
      id: nileUser.id,
      email: nileUser.email,
      emailVerified: nileUser.emailVerified ? new Date(nileUser.emailVerified) : null,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    productionLogger.error("[AuthOps] Session check failed:", err);
    
    // Throw network errors to allow retry logic to handle them
    // Return null only for non-retryable errors (e.g., invalid session)
    if (isRetryableError(err)) {
      throw err;
    }
    
    return null;
  }
}

/**
 * Recover session with retry logic
 * 
 * Implements retry logic for network errors while treating null (no session) as a definitive state.
 * Only retries on network/retryable errors, not on "no session" conditions.
 */
export async function recoverSessionWithRetry(
  maxAttempts = 3, 
  delayMs = 1000
): Promise<{ id: string; email: string; emailVerified: Date | null } | null> {
  let attempt = 0;
  let lastError: Error | null = null;
  
  while (attempt < maxAttempts) {
    try {
      const session = await checkSession();
      
      // If we got a session, return it immediately
      if (session) return session;
      
      // If checkSession returned null, it means no session exists (not a network error)
      // This is a definitive state - don't retry
      return null;
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      lastError = err;
      
      // Only retry on retryable errors (network errors, server errors, etc.)
      if (isRetryableError(err)) {
        productionLogger.warn(`[AuthOps] Session recovery attempt ${attempt + 1}/${maxAttempts} failed (retryable):`, err);
        
        // Wait before retrying (exponential backoff)
        const backoffDelay = delayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
        attempt++;
      } else {
        // Non-retryable error - don't retry, just return null
        productionLogger.error("[AuthOps] Session recovery failed (non-retryable):", err);
        return null;
      }
    }
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
