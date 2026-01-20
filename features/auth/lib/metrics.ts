/**
 * Auth Feature Metrics
 * 
 * Authentication-specific metrics and event tracking.
 * Uses the generic metrics infrastructure from the shared layer.
 */

import { productionLogger } from "@/lib/logger";
import { metricsClient, safeMetricsOperation } from "@/lib/utils/metrics";

export const authMetrics = {
  recordLoginAttempt: (email: string) => {
    safeMetricsOperation(
      () => metricsClient.capture("login_attempt_start", { email }),
      "recordLoginAttempt",
      { email }
    );
  },
  
  recordLoginSuccess: (userId: string, email: string) => {
    safeMetricsOperation(
      () => {
        productionLogger.info("Login success", { userId });
        metricsClient.identify(userId, { email });
        metricsClient.capture("login_success", { userId, email });
      },
      "recordLoginSuccess",
      { userId, email }
    );
  },

  recordLoginFailure: (email: string, error: string) => {
    safeMetricsOperation(
      () => {
        productionLogger.warn("Login failure", { email, error });
        metricsClient.capture("login_failure", { email, error });
      },
      "recordLoginFailure",
      { email, error }
    );
  },

  recordSignupSuccess: (userId: string, email: string) => {
    safeMetricsOperation(
      () => {
        productionLogger.info("Signup success", { userId });
        metricsClient.identify(userId, { email });
        metricsClient.capture("signup_success", { userId, email });
      },
      "recordSignupSuccess",
      { userId, email }
    );
  },

  recordSessionRecovery: (success: boolean, durationMs: number) => {
    safeMetricsOperation(
      () => {
        // High volume event, maybe just log debug or sample
        if (!success) {
          productionLogger.debug("Session recovery failed", { durationMs });
        }
        metricsClient.capture("session_recovery", { success, durationMs });
      },
      "recordSessionRecovery",
      { success, durationMs }
    );
  }
};
