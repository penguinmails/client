/**
 * Admin System Health Model Layer
 * 
 * Admin-specific system health state management and business logic
 */

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { productionLogger, developmentLogger } from "@/lib/logger";
import { SystemHealthStatus } from "@/types";
import { fetchAdminSystemHealth, AdminSystemHealthData } from "../api/system-health";

export interface AdminSystemHealthContextType {
  systemHealth: AdminSystemHealthData;
  checkSystemHealth: () => Promise<void>;
  isChecking: boolean;
}

const AdminSystemHealthContext = createContext<AdminSystemHealthContextType | null>(null);

// Get check interval based on status for admin monitoring
const getAdminCheckInterval = (status: SystemHealthStatus["status"]): number => {
  switch (status) {
    case "healthy": return 5 * 60 * 1000;      // 5 minutes
    case "degraded": return 60 * 1000;          // 1 minute
    case "unhealthy":
    case "unknown": return 30 * 1000;           // 30 seconds
    default: return 5 * 60 * 1000;
  }
};

interface AdminSystemHealthProviderProps {
  children: React.ReactNode;
  enableToasts?: boolean;
  autoCheck?: boolean;
}

/**
 * Admin System Health Provider
 * 
 * Provides comprehensive system health monitoring for admin dashboard
 */
export function AdminSystemHealthProvider({ 
  children, 
  enableToasts = true,
  autoCheck = true 
}: AdminSystemHealthProviderProps) {
  const [systemHealth, setSystemHealth] = useState<AdminSystemHealthData>({ 
    status: "unknown" 
  });
  const [isChecking, setIsChecking] = useState(false);

  // Refs to avoid stale closures in intervals
  const isCheckingRef = useRef(false);
  const statusRef = useRef<SystemHealthStatus["status"]>("unknown");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs in sync
  useEffect(() => {
    statusRef.current = systemHealth.status;
  }, [systemHealth.status]);

  useEffect(() => {
    isCheckingRef.current = isChecking;
  }, [isChecking]);

  // Show toast on status change (admin-specific notifications)
  const showAdminStatusToast = useCallback((prev: SystemHealthStatus["status"], next: AdminSystemHealthData) => {
    if (!enableToasts || prev === next.status) return;

    const getDetailsString = (details: AdminSystemHealthData['details']): string => {
      if (typeof details === 'string') return details;
      if (typeof details === 'object' && details) {
        return Object.entries(details).map(([key, value]) => `${key}: ${value}`).join(', ');
      }
      return '';
    };

    switch (next.status) {
      case "healthy":
        if (prev !== "unknown") {
          toast.success("System Health Restored", {
            description: "All admin services are operating normally.",
            duration: 4000,
          });
        }
        break;
      case "degraded":
        toast.warning("System Performance Degraded", {
          description: getDetailsString(next.details) || "Some admin services may be experiencing issues.",
          duration: 6000,
        });
        break;
      case "unhealthy":
        toast.error("System Health Critical", {
          description: getDetailsString(next.details) || "Admin system is experiencing significant issues.",
          duration: 8000,
        });
        break;
    }
  }, [enableToasts]);

  // Main check function for admin health monitoring
  const checkSystemHealth = useCallback(async (): Promise<void> => {
    if (isCheckingRef.current) {
      developmentLogger.debug("[AdminSystemHealth] Skipping - already checking");
      return;
    }

    setIsChecking(true);
    const prevStatus = statusRef.current;

    try {
      const result = await fetchAdminSystemHealth();
      setSystemHealth(result);
      showAdminStatusToast(prevStatus, result);
      developmentLogger.debug(`[AdminSystemHealth] Check complete: ${result.status}`);
    } catch (error) {
      productionLogger.error("[AdminSystemHealth] Check failed:", error);
      const errorStatus: AdminSystemHealthData = {
        status: "unhealthy",
        lastCheck: new Date(),
        details: error instanceof Error ? error.message : "Network error",
      };
      setSystemHealth(errorStatus);
      showAdminStatusToast(prevStatus, errorStatus);
    } finally {
      setIsChecking(false);
    }
  }, [showAdminStatusToast]);

  // Schedule recurring checks for admin monitoring
  useEffect(() => {
    if (!autoCheck) return;

    // Initial check
    checkSystemHealth();

    const scheduleNext = () => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Only schedule if page is visible
      if (document.visibilityState !== "visible") {
        const onVisible = () => {
          if (document.visibilityState === "visible") {
            document.removeEventListener("visibilitychange", onVisible);
            checkSystemHealth();
            scheduleNext();
          }
        };
        document.addEventListener("visibilitychange", onVisible);
        return;
      }

      const interval = getAdminCheckInterval(statusRef.current);
      timeoutRef.current = setTimeout(() => {
        checkSystemHealth();
        scheduleNext();
      }, interval);
    };

    scheduleNext();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [checkSystemHealth, autoCheck]);

  return (
    <AdminSystemHealthContext.Provider value={{ systemHealth, checkSystemHealth, isChecking }}>
      {children}
    </AdminSystemHealthContext.Provider>
  );
}

/**
 * Hook to use admin system health context
 */
export function useAdminSystemHealth(): AdminSystemHealthContextType {
  const context = useContext(AdminSystemHealthContext);
  if (!context) {
    throw new Error("useAdminSystemHealth must be used within an AdminSystemHealthProvider");
  }
  return context;
}