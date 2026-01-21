/**
 * Generic Metrics Infrastructure
 * 
 * Provides a generic interface for capturing metrics and events.
 * This is part of the shared layer and should remain domain-agnostic.
 */

import { productionLogger } from "@/lib/logger";
import { ph } from "@/lib/posthog";

export interface MetricsClient {
  capture(eventName: string, properties?: Record<string, unknown>): void;
  identify(userId: string, properties?: Record<string, unknown>): void;
}

/**
 * Generic metrics client that safely handles analytics operations
 * with proper error handling and logging.
 */
export const metricsClient: MetricsClient = {
  capture: (eventName: string, properties?: Record<string, unknown>) => {
    try {
      ph().capture(eventName, properties);
    } catch (error) {
      // Silently ignore client-side analytics errors
      productionLogger.debug("Metrics capture error", { eventName, error });
    }
  },

  identify: (userId: string, properties?: Record<string, unknown>) => {
    try {
      ph().identify(userId, properties);
    } catch (error) {
      productionLogger.error("Metrics identify error", { userId, error });
    }
  }
};

/**
 * Generic helper for safely executing metrics operations with logging
 */
export function safeMetricsOperation(
  operation: () => void,
  context: string,
  logData?: Record<string, unknown>
): void {
  try {
    operation();
  } catch (error) {
    productionLogger.error(`Metrics error in ${context}`, { ...logData, error });
  }
}
