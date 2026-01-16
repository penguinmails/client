"use client";

import React from 'react';
import { 
  UnifiedModal, 
  UnifiedModalContent, 
  UnifiedModalHeader, 
  UnifiedModalTitle, 
  UnifiedModalDescription 
} from '@/components/unified/UnifiedModal';
import { UnifiedButton } from '@/components/unified/UnifiedButton';
import { AlertTriangle, RefreshCw, Clock } from 'lucide-react';

interface ManualRetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  retryInfo: {
    attempts: number;
    maxAttempts: number;
    timeUntilNextRetry: number;
    backoffDelay: number;
  };
  isRetrying?: boolean;
}

import { useTranslations } from "next-intl";
// ... existing imports

export function ManualRetryModal({
  isOpen,
  onClose,
  onRetry,
  retryInfo,
  isRetrying = false
}: ManualRetryModalProps) {
  const t = useTranslations("Components.ManualRetryModal");

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) {
      return `${seconds} ${seconds !== 1 ? t("seconds") : t("second")}`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getRetryDelayDescription = (): string => {
    if (retryInfo.timeUntilNextRetry > 0) {
      return t("wait", { time: formatTime(retryInfo.timeUntilNextRetry) });
    }
    return t("manualOrWait");
  };

  return (
    <UnifiedModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <UnifiedModalContent>
        <UnifiedModalHeader>
          <UnifiedModalTitle>{t("title")}</UnifiedModalTitle>
          <UnifiedModalDescription>
            {t("description")}
          </UnifiedModalDescription>
        </UnifiedModalHeader>
        
        <div className="space-y-4">
          {/* Status Information */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800">
                  {t("serverFailed")}
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  {t("serverFailedDesc", { attempts: retryInfo.attempts })}
                </p>
              </div>
            </div>
          </div>

          {/* Retry Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-800">
                  {t("retryProtection")}
                </h4>
                <p className="text-sm text-gray-700 mt-1">
                  {getRetryDelayDescription()}
                </p>
                {retryInfo.timeUntilNextRetry > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    {t("nextRetry", { time: formatTime(retryInfo.timeUntilNextRetry) })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <UnifiedButton
              variant="outline"
              onClick={onClose}
              disabled={isRetrying}
              className="flex-1"
            >
              {t("close")}
            </UnifiedButton>
            <UnifiedButton
              onClick={onRetry}
              disabled={isRetrying || retryInfo.timeUntilNextRetry > 0}
              className="flex-1"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {t("checking")}
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("manualRetry")}
                </>
              )}
            </UnifiedButton>
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
            <p>
              {t("help")}
            </p>
          </div>
        </div>
      </UnifiedModalContent>
    </UnifiedModal>
  );
}
