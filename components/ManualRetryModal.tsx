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

export function ManualRetryModal({
  isOpen,
  onClose,
  onRetry,
  retryInfo,
  isRetrying = false
}: ManualRetryModalProps) {
  const formatTime = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000);
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getRetryDelayDescription = (): string => {
    if (retryInfo.timeUntilNextRetry > 0) {
      return `Please wait ${formatTime(retryInfo.timeUntilNextRetry)} before trying again.`;
    }
    return 'You can try again manually or wait for automatic retry.';
  };

  return (
    <UnifiedModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <UnifiedModalContent>
        <UnifiedModalHeader>
          <UnifiedModalTitle>Connection Issue Detected</UnifiedModalTitle>
          <UnifiedModalDescription>
            The system health check has encountered repeated failures.
          </UnifiedModalDescription>
        </UnifiedModalHeader>
        
        <div className="space-y-4">
          {/* Status Information */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800">
                  Server Connection Failed
                </h4>
                <p className="text-sm text-red-700 mt-1">
                  Unable to connect to the server after {retryInfo.attempts} attempts.
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
                  Automatic Retry Protection
                </h4>
                <p className="text-sm text-gray-700 mt-1">
                  {getRetryDelayDescription()}
                </p>
                {retryInfo.timeUntilNextRetry > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Next automatic retry available in: {formatTime(retryInfo.timeUntilNextRetry)}
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
              Close
            </UnifiedButton>
            <UnifiedButton
              onClick={onRetry}
              disabled={isRetrying || retryInfo.timeUntilNextRetry > 0}
              className="flex-1"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Manual Retry
                </>
              )}
            </UnifiedButton>
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
            <p>
              This modal appears when the system detects repeated connection issues.
              You can manually retry or wait for automatic retry attempts.
            </p>
          </div>
        </div>
      </UnifiedModalContent>
    </UnifiedModal>
  );
}