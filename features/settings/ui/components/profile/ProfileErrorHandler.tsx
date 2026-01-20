"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button/button";
import { AlertTriangle, RefreshCw, WifiOff } from "lucide-react";
import { UIProfileError } from "../../../lib/hooks/use-profile-form";

interface ProfileErrorHandlerProps {
  profileError: UIProfileError | null;
  profileLoading: boolean;
  isRetryingProfile: boolean;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
}

export default function ProfileErrorHandler({
  profileError,
  profileLoading,
  isRetryingProfile,
  retryCount,
  maxRetries,
  onRetry,
}: ProfileErrorHandlerProps) {
  // Don't show error if we're currently loading or retrying
  if (profileLoading || isRetryingProfile) {
    return null;
  }

  // Don't show anything if there's no error
  if (!profileError) {
    return null;
  }

  const canRetry = retryCount < maxRetries;
  const isNetworkError = profileError.type === 'network';

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="space-y-3">
        <div>
          <p className="font-medium">Profile Error</p>
          <p className="text-sm mt-1">
            {profileError.message || 'An unexpected error occurred while loading your profile.'}
          </p>
        </div>

        {/* Additional context based on error type */}
        {isNetworkError && (
          <div className="flex items-center gap-2 text-sm">
            <WifiOff className="h-4 w-4" />
            <span>Check your internet connection and try again.</span>
          </div>
        )}

        {/* Show retry count if we've attempted retries */}
        {retryCount > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <RefreshCw className="h-4 w-4" />
            <span>Retry attempt {retryCount} of {maxRetries}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          {canRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isRetryingProfile}
              className="text-xs"
            >
              {isRetryingProfile ? (
                <>
                  <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Try Again
                </>
              )}
            </Button>
          )}

          {!canRetry && (
            <p className="text-xs text-muted-foreground">
              Maximum retry attempts reached. Please refresh the page or contact support.
            </p>
          )}
        </div>

        {/* Development error details */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-muted-foreground">
              Error Details (Dev)
            </summary>
            <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
              <div>Code: {profileError.code}</div>
              <div>Field: {profileError.field}</div>
              <div>Type: {profileError.type}</div>
              <div>Message: {profileError.message}</div>
            </div>
          </details>
        )}
      </AlertDescription>
    </Alert>
  );
}