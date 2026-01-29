"use client";

import { useEffect, useCallback, useState } from "react";
import { useAuth } from "./use-auth";
import { productionLogger } from "@/lib/logger";

const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;
const WARNING_BEFORE_LOGOUT_MS = 2 * 60 * 1000;
const STORAGE_KEY = "session_timeout_expiry";

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

export function useSessionTimeout({
  timeoutMs = DEFAULT_TIMEOUT_MS,
  warningMs = WARNING_BEFORE_LOGOUT_MS,
  onWarning,
  onTimeout,
  enabled = true,
}: UseSessionTimeoutOptions = {}): SessionTimeoutState {
  const { logout, user } = useAuth();
  const [isWarning, setIsWarning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const setExpiryTime = useCallback(() => {
    const expiryTime = Date.now() + timeoutMs;
    localStorage.setItem(STORAGE_KEY, expiryTime.toString());
  }, [timeoutMs]);

  const checkTimeRemaining = useCallback(() => {
    const expiryTime = localStorage.getItem(STORAGE_KEY);
    if (!expiryTime) return;

    const now = Date.now();
    const expiry = parseInt(expiryTime);
    const remaining = expiry - now;

    if (remaining <= 0) {
      localStorage.removeItem(STORAGE_KEY);
      setIsWarning(false);
      
      if (onTimeout) {
        onTimeout();
      }
      
      logout().catch((error) => {
        productionLogger.error("[SessionTimeout] Logout failed:", error);
      });
      return;
    }

    if (remaining <= warningMs) {
      if (!isWarning) {
        setIsWarning(true);
        if (onWarning) {
          onWarning(remaining);
        }
      }
      setRemainingSeconds(Math.ceil(remaining / 1000));
    } else {
      setIsWarning(false);
      setRemainingSeconds(0);
    }
  }, [warningMs, onWarning, onTimeout, logout, isWarning]);

  const resetTimer = useCallback(() => {
    setIsWarning(false);
    setRemainingSeconds(0);
    setExpiryTime();
  }, [setExpiryTime]);

  useEffect(() => {
    if (!enabled || !user) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }

    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];
    let lastActivity = 0;
    const THROTTLE_MS = 1000;

    const handleActivity = () => {
      if (isWarning) return;
      const now = Date.now();
      if (now - lastActivity < THROTTLE_MS) return;
      lastActivity = now;
      resetTimer();
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    setExpiryTime();
    const interval = setInterval(checkTimeRemaining, 1000);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(interval);
    };
  }, [enabled, user, isWarning, resetTimer, setExpiryTime, checkTimeRemaining]);

  return { isWarning, remainingSeconds, resetTimer };
}
