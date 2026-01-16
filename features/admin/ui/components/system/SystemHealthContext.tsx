/**
 * Admin System Health Context (UI Layer)
 * 
 * Re-exports admin system health functionality for UI components
 * This maintains backward compatibility while using the proper FSD structure
 */

"use client";

// Re-export from shared context to maintain backward compatibility
export { 
  SystemHealthProvider,
  useSystemHealthContext as useSystemHealth
} from "@/context/system-health-context";

// Re-export types for backward compatibility
export type { SystemHealthStatus } from "@/types";