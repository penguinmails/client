/**
 * Shared System Health Hook
 * 
 * Provides system health functionality without depending on admin feature
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { SystemHealthStatus } from '@/types';
import { productionLogger } from '@/lib/logger';

// Global window interface for debug features
interface GlobalHealthDebug {
  getStats: () => {
    isChecking: boolean;
    pendingRequests: number;
    lastCheckTime: number;
    hasCachedResult: boolean;
    retryAttempts: number;
    maxRetries: number;
    backoffDelay: number;
    isAtRetryLimit: boolean;
  };
  checkHealth: (force?: boolean) => Promise<SystemHealthStatus>;
  reset: () => void;
  manualReset: () => void;
  getRetryInfo: () => {
    attempts: number;
    maxAttempts: number;
    backoffDelay: number;
    isAtRetryLimit: boolean;
    timeUntilNextRetry: number;
  };
}

interface UseSystemHealthOptions {
  autoCheck?: boolean;
  checkInterval?: number;
}

interface UseSystemHealthReturn {
  systemHealth: SystemHealthStatus;
  checkSystemHealth: () => Promise<void>;
  isChecking: boolean;
  retryInfo?: {
    attempts: number;
    maxAttempts: number;
    backoffDelay: number;
    isAtRetryLimit: boolean;
    timeUntilNextRetry: number;
  };
  manualReset: () => void;
}

// Global Health Manager to prevent multiple concurrent requests
class GlobalHealthManager {
  private static instance: GlobalHealthManager;
  private isChecking = false;
  private pendingRequests: Array<{ resolve: (value: SystemHealthStatus) => void; reject: (error: Error) => void }> = [];
  private lastCheckTime = 0;
  private lastResult: SystemHealthStatus | null = null;
  private retryAttempts = 0;
  private maxRetries = 5;
  private backoffMultiplier = 2;
  private baseBackoffTime = 1000; // 1 second
  private lastRetryTime = 0;
  private sessionId = Date.now().toString(); // Track session for retry limits

  public static getInstance(): GlobalHealthManager {
    if (!GlobalHealthManager.instance) {
      GlobalHealthManager.instance = new GlobalHealthManager();
    }
    return GlobalHealthManager.instance;
  }

  private getBackoffDelay(): number {
    if (this.retryAttempts === 0) return 0;
    return Math.min(
      this.baseBackoffTime * Math.pow(this.backoffMultiplier, this.retryAttempts - 1),
      30000 // Max 30 seconds backoff
    );
  }

  private shouldResetRetries(): boolean {
    // Reset retry count if last successful check was more than 5 minutes ago
    const fiveMinutes = 5 * 60 * 1000;
    return !this.lastResult || (Date.now() - this.lastCheckTime) > fiveMinutes;
  }

  public async checkHealth(): Promise<SystemHealthStatus> {
    const now = Date.now();
    const cacheTimeout = 10 * 1000; // 10 second client-side cache

    // Return cached result if recent enough
    if (this.lastResult && (now - this.lastCheckTime) < cacheTimeout) {
      productionLogger.debug('[GlobalHealth] Returning cached result');
      return this.lastResult;
    }

    // Queue request if check is in progress
    if (this.isChecking) {
      productionLogger.debug('[GlobalHealth] Queueing request, check in progress');
      return new Promise((resolve, reject) => {
        this.pendingRequests.push({ resolve, reject });
      });
    }

    // Check retry limits
    if (this.retryAttempts >= this.maxRetries) {
      const timeSinceLastRetry = now - this.lastRetryTime;
      const backoffDelay = this.getBackoffDelay();
      
      if (timeSinceLastRetry < backoffDelay) {
        const error = new Error(`Health check retry limit exceeded. Please wait ${Math.ceil((backoffDelay - timeSinceLastRetry) / 1000)} seconds before trying again.`);
        productionLogger.warn('[GlobalHealth] Retry limit exceeded:', error.message);
        throw error;
      }
      // Reset retries if backoff period has passed
      if (timeSinceLastRetry >= backoffDelay) {
        this.retryAttempts = 0;
        productionLogger.debug('[GlobalHealth] Resetting retry count after backoff period');
      }
    }

    // Reset retry count if enough time has passed since last success
    if (this.shouldResetRetries()) {
      this.retryAttempts = 0;
      productionLogger.debug('[GlobalHealth] Resetting retry count due to time elapsed');
    }

    // Perform health check
    this.isChecking = true;
    this.retryAttempts++;
    this.lastRetryTime = now;
    productionLogger.debug(`[GlobalHealth] Starting health check, attempt ${this.retryAttempts}/${this.maxRetries}`);

    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      let healthData: SystemHealthStatus;
      
      if (response.ok) {
        const data = await response.json();
        healthData = {
          status: data.status || "healthy",
          lastCheck: new Date(),
          details: data.details
        };
        // Reset retry count on successful check
        this.retryAttempts = 0;
      } else {
        healthData = {
          status: "unhealthy",
          lastCheck: new Date(),
          details: `Health check failed with status ${response.status}`
        };
      }

      // Cache the result
      this.lastResult = healthData;
      this.lastCheckTime = now;

      // Resolve all pending requests
      this.pendingRequests.forEach(({ resolve }) => resolve(healthData));
      this.pendingRequests = [];

      return healthData;
    } catch (error) {
      productionLogger.error('[GlobalHealth] Health check failed:', error);

      // Reject all pending requests
      this.pendingRequests.forEach(({ reject }) => reject(error instanceof Error ? error : new Error('Unknown error')));
      this.pendingRequests = [];

      throw error;
    } finally {
      this.isChecking = false;
    }
  }

  public getStats() {
    return {
      isChecking: this.isChecking,
      pendingRequests: this.pendingRequests.length,
      lastCheckTime: this.lastCheckTime,
      hasCachedResult: !!this.lastResult,
      retryAttempts: this.retryAttempts,
      maxRetries: this.maxRetries,
      backoffDelay: this.getBackoffDelay(),
      isAtRetryLimit: this.retryAttempts >= this.maxRetries
    };
  }

  public reset() {
    this.lastResult = null;
    this.lastCheckTime = 0;
    this.pendingRequests = [];
    this.isChecking = false;
    this.retryAttempts = 0;
    this.lastRetryTime = 0;
    this.sessionId = Date.now().toString();
    productionLogger.debug('[GlobalHealth] Reset all state');
  }

  public manualReset() {
    this.reset();
    productionLogger.debug('[GlobalHealth] Manual reset requested');
  }

  public getRetryInfo() {
    return {
      attempts: this.retryAttempts,
      maxAttempts: this.maxRetries,
      backoffDelay: this.getBackoffDelay(),
      isAtRetryLimit: this.retryAttempts >= this.maxRetries,
      timeUntilNextRetry: this.retryAttempts >= this.maxRetries ? 
        Math.max(0, this.getBackoffDelay() - (Date.now() - this.lastRetryTime)) : 0
    };
  }
}

// Global instance
const globalHealthManager = GlobalHealthManager.getInstance();

// Add debug features to global window for development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as Window & typeof globalThis & { globalHealthDebug?: GlobalHealthDebug }).globalHealthDebug = {
    getStats: () => globalHealthManager.getStats(),
    checkHealth: (force = false) => {
      if (force) {
        globalHealthManager.reset();
      }
      return globalHealthManager.checkHealth();
    },
    reset: () => globalHealthManager.reset(),
    manualReset: () => globalHealthManager.manualReset(),
    getRetryInfo: () => globalHealthManager.getRetryInfo()
  };
  productionLogger.debug('[GlobalHealth] Debug features available at window.globalHealthDebug');
}

/**
 * Hook for managing system health state and checks
 * This is a shared abstraction that can be used by any feature
 */
export function useSystemHealth(options: UseSystemHealthOptions = {}): UseSystemHealthReturn {
  const { autoCheck = false } = options;
  
  const [systemHealth, setSystemHealth] = useState<SystemHealthStatus>({
    status: "unknown",
    lastCheck: undefined,
    details: undefined
  });
  
  const [isChecking, setIsChecking] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Adaptive check intervals based on system status
  const getCheckInterval = (status: string): number => {
    switch (status) {
      case 'healthy':
        return 5 * 60 * 1000; // 5 minutes
      case 'degraded':
        return 60 * 1000; // 1 minute
      case 'unhealthy':
      case 'unknown':
      default:
        return 30 * 1000; // 30 seconds
    }
  };

  const checkSystemHealth = useCallback(async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    
    try {
      const healthData = await globalHealthManager.checkHealth();
      setSystemHealth(healthData);
    } catch (error) {
      productionLogger.error('[SystemHealth] Health check failed:', error);
      setSystemHealth({
        status: "unhealthy",
        lastCheck: new Date(),
        details: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  // Auto-check functionality with adaptive intervals
  useEffect(() => {
    if (autoCheck) {
      // Initial check
      checkSystemHealth();
      
      // Set up interval with adaptive timing based on current status
      const scheduleNextCheck = () => {
        const interval = getCheckInterval(systemHealth.status);
        intervalRef.current = setTimeout(() => {
          checkSystemHealth().then(scheduleNextCheck);
        }, interval);
      };
      
      scheduleNextCheck();
      
      return () => {
        if (intervalRef.current) {
          clearTimeout(intervalRef.current);
        }
      };
    }
  }, [autoCheck, checkSystemHealth, systemHealth.status]);

  return {
    systemHealth,
    checkSystemHealth,
    isChecking,
    retryInfo: globalHealthManager.getRetryInfo(),
    manualReset: globalHealthManager.manualReset
  };
}

/**
 * Simple hook to get just the health status
 */
export function useSystemHealthStatus() {
  const { systemHealth } = useSystemHealth();
  
  return {
    status: systemHealth.status,
    isHealthy: systemHealth.status === "healthy",
    isDegraded: systemHealth.status === "degraded",
    isUnhealthy: systemHealth.status === "unhealthy",
    lastCheck: systemHealth.lastCheck,
    details: systemHealth.details
  };
}