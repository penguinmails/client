"use client";

/**
 * SessionStorage-based rate limiting for login attempts
 * This implementation stores login attempt data in sessionStorage,
 * allowing users to reset their attempts by opening a new tab
 */

const MAX_LOGIN_ATTEMPTS = parseInt(process.env.NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS || "3");
const LOGIN_ATTEMPT_WINDOW = parseInt(process.env.NEXT_PUBLIC_LOGIN_ATTEMPT_WINDOW || "900"); // 15 minutes in seconds

interface LoginAttemptStatus {
  attempts: number;
  requiresTurnstile: boolean;
  lockoutExpiresAt?: Date | null;
}

const STORAGE_KEY_PREFIX = "login_attempts_";

/**
 * Get the current login attempt status for an email
 */
export function getLoginAttemptStatus(email: string): LoginAttemptStatus {
  if (typeof window === "undefined") {
    return {
      attempts: 0,
      requiresTurnstile: false,
      lockoutExpiresAt: null,
    };
  }

  const storageKey = getStorageKey(email);
  const storedData = sessionStorage.getItem(storageKey);

  if (!storedData) {
    return {
      attempts: 0,
      requiresTurnstile: false,
      lockoutExpiresAt: null,
    };
  }

  try {
    const data = JSON.parse(storedData);

    // Check if lockout has expired
    if (data.lockoutExpiresAt && new Date(data.lockoutExpiresAt) <= new Date()) {
      // Lockout expired, reset attempts
      sessionStorage.removeItem(storageKey);
      return {
        attempts: 0,
        requiresTurnstile: false,
        lockoutExpiresAt: null,
      };
    }

    const attempts = data.attempts || 0;
    return {
      attempts,
      requiresTurnstile: attempts >= MAX_LOGIN_ATTEMPTS,
      lockoutExpiresAt: data.lockoutExpiresAt ? new Date(data.lockoutExpiresAt) : null,
    };
  } catch (error) {
    console.error("Error parsing login attempt data:", error);
    // Clear corrupted data
    sessionStorage.removeItem(storageKey);
    return {
      attempts: 0,
      requiresTurnstile: false,
      lockoutExpiresAt: null,
    };
  }
}

/**
 * Record a failed login attempt
 */
export function recordFailedLoginAttempt(email: string): LoginAttemptStatus {
  if (typeof window === "undefined") {
    return {
      attempts: 1,
      requiresTurnstile: false,
      lockoutExpiresAt: null,
    };
  }

  const storageKey = getStorageKey(email);
  const currentStatus = getLoginAttemptStatus(email);

  const newAttempts = currentStatus.attempts + 1;
  const requiresTurnstile = newAttempts >= MAX_LOGIN_ATTEMPTS;
  let lockoutExpiresAt: Date | null = null;

  if (requiresTurnstile) {
    // Set lockout expiration time
    lockoutExpiresAt = new Date();
    lockoutExpiresAt.setSeconds(lockoutExpiresAt.getSeconds() + LOGIN_ATTEMPT_WINDOW);
  }

  const data = {
    attempts: newAttempts,
    lockoutExpiresAt: lockoutExpiresAt ? lockoutExpiresAt.toISOString() : undefined,
  };

  sessionStorage.setItem(storageKey, JSON.stringify(data));

  return {
    attempts: newAttempts,
    requiresTurnstile,
    lockoutExpiresAt,
  };
}

/**
 * Reset login attempts (e.g., after successful login)
 */
export function resetLoginAttempts(email: string): void {
  if (typeof window !== "undefined") {
    const storageKey = getStorageKey(email);
    sessionStorage.removeItem(storageKey);
  }
}

/**
 * Get storage key for an email (normalized)
 */
function getStorageKey(email: string): string {
  return STORAGE_KEY_PREFIX + email.trim().toLowerCase();
}

/**
 * Initialize rate limiting configuration
 */
export function initRateLimiting() {
  // This function can be used to initialize any required configuration
  // For now, it just ensures the module is loaded
  return {
    MAX_LOGIN_ATTEMPTS,
    LOGIN_ATTEMPT_WINDOW,
  };
}
