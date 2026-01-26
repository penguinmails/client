"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "./use-auth";
import { productionLogger } from "@/lib/logger";

// Default inactivity timeout: 15 minutes (B2B standard for sensitive data apps)
const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;
// Warning before logout: 2 minutes
const WARNING_BEFORE_LOGOUT_MS = 2 * 60 * 1000;

interface UseSessionTimeoutOptions {
  timeoutMs?: number;
  warningMs?: number;
  onWarning?: (remainingMs: number) => void;
  onTimeout?: () => void;
  enabled?: boolean;
}

interface SessionTimeoutState {
  isWarning: boolean;
  remainingSeconds: number;
  resetTimer: () => void;
}

/**
 * useSessionTimeout - Auto-logout after inactivity
 * 
 * Tracks user activity (mouse, keyboard, scroll) and auto-logs out
 * after a configurable timeout period. Shows warning before logout.
 * 
 * Default: 15 minutes timeout, 2 minutes warning
 */
export function useSessionTimeout({
  timeoutMs = DEFAULT_TIMEOUT_MS,
  warningMs = WARNING_BEFORE_LOGOUT_MS,
  onWarning,
  onTimeout,
  enabled = true,
}: UseSessionTimeoutOptions = {}): SessionTimeoutState {
  const { logout, user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(0);
  
  const [isWarning, setIsWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Handle timeout - logout user
  const handleTimeout = useCallback(async () => {
    productionLogger.info("[SessionTimeout] Session expired due to inactivity");
    
    if (onTimeout) {
      onTimeout();
    }
    
    try {
      await logout();
    } catch (error) {
      productionLogger.error("[SessionTimeout] Logout failed:", error);
    }
  }, [logout, onTimeout]);

  // Handle warning - notify user
  const handleWarning = useCallback(() => {
    setIsWarning(true);
    setRemainingSeconds(Math.floor(warningMs / 1000));
    
    if (onWarning) {
      onWarning(warningMs);
    }

    // Start countdown
    countdownRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) {
            clearInterval(countdownRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [warningMs, onWarning]);

  // Internal function to refresh timers without triggering state updates
  // This helps avoid lint warnings about setState in effects
  const refreshInternalTimers = useCallback(() => {
    lastActivityRef.current = Date.now();

    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }

    if (!enabled || !user) return;

    // Set warning timer
    const warningTime = timeoutMs - warningMs;
    warningRef.current = setTimeout(handleWarning, warningTime);

    // Set timeout timer
    timeoutRef.current = setTimeout(handleTimeout, timeoutMs);
  }, [enabled, user, timeoutMs, warningMs, handleWarning, handleTimeout]);

  // Public reset function that also clears UI warning states
  const resetTimer = useCallback(() => {
    setIsWarning(false);
    setRemainingSeconds(0);
    refreshInternalTimers();
  }, [refreshInternalTimers]);

  // Setup activity listeners
  useEffect(() => {
    if (!enabled || !user) return;

    const activityEvents = [
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "mousemove",
    ];

    // Throttle activity updates
    let lastThrottledUpdate = 0;
    const THROTTLE_MS = 1000;

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastThrottledUpdate < THROTTLE_MS) return;
      lastThrottledUpdate = now;
      resetTimer();
    };

    // Add listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Initial timer setup - call internal function only to avoid setState warning
    refreshInternalTimers();

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [enabled, user, resetTimer, refreshInternalTimers]);

  return {
    isWarning,
    remainingSeconds,
    resetTimer,
  };
}
