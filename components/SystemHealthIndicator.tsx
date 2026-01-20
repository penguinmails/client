"use client";

import React, { useState, useEffect } from "react";
import { useSystemHealthContext } from "@/context/system-health-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/button";
import { ManualRetryModal } from "./ManualRetryModal";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  HelpCircle,
  RefreshCw,
  Clock,
  AlertCircle
} from "lucide-react";

interface SystemHealthIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

/**
 * SystemHealthIndicator component that displays the current system health status
 * and allows manual health checks.
 */
import { useTranslations } from "next-intl";

// ... existing code ...

export function SystemHealthIndicator({ 
  showDetails = false, 
  className = "" 
}: SystemHealthIndicatorProps) {
  const t = useTranslations("Components.SystemHealth");
  const { systemHealth, checkSystemHealth, isChecking, retryInfo, manualReset } = useSystemHealthContext();
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // ... useEffect and handlers ...

  // Keep logic handlers same...
  // Just replacing rendered output

  // This part needs careful replacement to keep handlers
  // Logic remains same, only JSX changes
  
  // Show retry modal when retry limit is reached
  useEffect(() => {
    if (retryInfo?.isAtRetryLimit && systemHealth.status === "unhealthy") {
      setShowRetryModal(true);
    }
  }, [retryInfo?.isAtRetryLimit, systemHealth.status]);

  const handleManualRetry = async () => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    try {
      await checkSystemHealth();
      setShowRetryModal(false);
    } catch {
      // Keep modal open if retry still fails
    } finally {
      setIsRetrying(false);
    }
  };

  const handleManualReset = () => {
    manualReset();
    setShowRetryModal(false);
  };
  
  const handleManualCheck = () => {
    checkSystemHealth();
  };

  const getStatusIcon = () => {
    switch (systemHealth.status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "unhealthy":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (systemHealth.status) {
      case "healthy":
        return "bg-green-50 border-green-200 text-green-800";
      case "degraded":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "unhealthy":
        return retryInfo?.isAtRetryLimit 
          ? "bg-red-100 border-red-300 text-red-900" 
          : "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getRetryStatusDisplay = () => {
    if (!retryInfo || retryInfo.attempts === 0) return null;
    
    const attempts = retryInfo.attempts;
    const maxAttempts = retryInfo.maxAttempts;
    
    if (attempts >= maxAttempts) {
      return (
        <div className="flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3 w-3" />
          <span>{t("retryLimit")}</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-1 text-xs text-yellow-600">
        <Clock className="h-3 w-3" />
        <span>{t("attempts", { current: attempts, max: maxAttempts })}</span>
      </div>
    );
  };

  const formatBackoffTime = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    switch (systemHealth.status) {
      case "healthy":
        return "default";
      case "degraded":
        return "outline";
      case "unhealthy":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (!showDetails && systemHealth.status === "healthy") {
    return null; // Don't show anything when healthy and details not requested
  }

  const statusLabel = systemHealth.status === "healthy" ? t("healthy") :
                      systemHealth.status === "degraded" ? t("degraded") :
                      systemHealth.status === "unhealthy" ? t("unhealthy") : systemHealth.status;

  return (
    <div className={`space-y-2 ${className}`}>
      <Alert className={getStatusColor()}>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium capitalize">
                  {t("system", { status: statusLabel })}
                </span>
                <Badge variant={getStatusVariant()}>
                  {statusLabel}
                </Badge>
                {getRetryStatusDisplay()}
              </div>
              {systemHealth.lastCheck && (
                <span className="text-xs opacity-75">
                  {t("lastChecked", { time: systemHealth.lastCheck.toLocaleTimeString() })}
                </span>
              )}
              {retryInfo?.isAtRetryLimit && retryInfo.timeUntilNextRetry > 0 && (
                <span className="text-xs text-red-600">
                  {t("nextRetry", { time: formatBackoffTime(retryInfo.timeUntilNextRetry) })}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualCheck}
              disabled={isChecking || retryInfo?.isAtRetryLimit}
              className="text-xs"
            >
              <RefreshCw className={`h-3 w-3 ${isChecking ? "animate-spin" : ""}`} />
              {isChecking ? t("checking") : t("checkNow")}
            </Button>
            {retryInfo?.isAtRetryLimit && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleManualReset}
                disabled={isRetrying}
                className="text-xs px-2"
                title={t("manualReset")}
              >
                <AlertCircle className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        {showDetails && systemHealth.details && (
          <AlertDescription className="mt-2 text-sm">
            {systemHealth.details}
          </AlertDescription>
        )}
      </Alert>

      {/* Manual Retry Modal */}
      {retryInfo && (
        <ManualRetryModal
          isOpen={showRetryModal}
          onClose={() => setShowRetryModal(false)}
          onRetry={handleManualRetry}
          retryInfo={retryInfo}
          isRetrying={isRetrying}
        />
      )}
    </div>
  );
}

/**
 * Simple hook to get system health status for use in other components
 */
export function useSystemHealthStatus() {
  const { systemHealth, checkSystemHealth } = useSystemHealthContext();
  
  return {
    status: systemHealth.status,
    isHealthy: systemHealth.status === "healthy",
    isDegraded: systemHealth.status === "degraded", 
    isUnhealthy: systemHealth.status === "unhealthy",
    lastCheck: systemHealth.lastCheck,
    details: systemHealth.details,
    checkHealth: checkSystemHealth,
  };
}
