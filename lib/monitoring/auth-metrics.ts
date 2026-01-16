import { productionLogger } from "@/lib/logger";
// Import PostHog if needed, or use a shared analytics/metrics wrapper if exists.
// Based on LoginForm, PostHog is used directly.
// We can centralize it here.

// If `initPostHog` is client-side only, we should be careful.
// Let's assume we can import it.
import { ph } from "@/lib/posthog";

export const authMetrics = {
  recordLoginAttempt: (email: string) => {
    try {
        ph().capture("login_attempt_start", { email });
    } catch {
        // ignore client side analytics errors in lib
    }
  },
  
  recordLoginSuccess: (userId: string, email: string) => {
    try {
        productionLogger.info("Login success", { userId });
        ph().identify(userId, { email });
        ph().capture("login_success", { userId, email });
    } catch (_e) {
        productionLogger.error("Metrics error", _e);
    }
  },

  recordLoginFailure: (email: string, error: string) => {
    try {
        productionLogger.warn("Login failure", { email, error });
        ph().capture("login_failure", { email, error });
    } catch (_e) {
        productionLogger.error("Metrics error", _e);
    }
  },

  recordSignupSuccess: (userId: string, email: string) => {
    try {
        productionLogger.info("Signup success", { userId });
        ph().identify(userId, { email });
        ph().capture("signup_success", { userId, email });
    } catch (_e) {
        productionLogger.error("Metrics error", _e);
    }
  },

  recordSessionRecovery: (success: boolean, durationMs: number) => {
      // High volume event, maybe just log debug or sample
      if (!success) {
          productionLogger.debug("Session recovery failed", { durationMs });
      }
      try {
          ph().capture("session_recovery", { success, durationMs });
      } catch {
        // ignore
      }
  }
};
