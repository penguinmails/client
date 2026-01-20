"use client";

import React, { useEffect, useState, useCallback } from "react";
import { productionLogger } from "@/lib/logger";
import { Button } from "@/components/ui/button/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ChunkErrorHandlerProps {
  children: React.ReactNode;
}

/**
 * Global error handler for chunk loading errors in Next.js
 * Handles the common ChunkLoadError that occurs during:
 * - Hot reload in development
 * - Deployments with old cached chunks
 * - Network issues during chunk loading
 * - Rapid navigation after authentication
 */
import { useTranslations } from "next-intl";

// ... existing code ...

export function ChunkErrorHandler({ children }: ChunkErrorHandlerProps) {
  const t = useTranslations("Components.ChunkErrorHandler");
  const [hasChunkError, setHasChunkError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string>("");

  const handleChunkError = useCallback(
    (event: ErrorEvent | PromiseRejectionEvent) => {
      let errorMessage = "";

      if ("message" in event) {
        // ErrorEvent
        errorMessage = event.message;
      } else if ("reason" in event) {
        // PromiseRejectionEvent
        errorMessage = String(event.reason);
      }

      // Check if this is a chunk loading error
      const isChunkError =
        errorMessage.includes("ChunkLoadError") ||
        errorMessage.includes("loading chunk") ||
        errorMessage.includes("Failed to fetch dynamically imported module") ||
        errorMessage.includes("Importing a module script failed");

      if (isChunkError) {
        productionLogger.error("Chunk loading error detected:", errorMessage);
        setHasChunkError(true);
        setErrorDetails(errorMessage);

        // Prevent default error handling
        event.preventDefault?.();
      }
    },
    []
  );

  const handleRecovery = useCallback(() => {
    productionLogger.info("Attempting to recover from chunk error");

    // Clear any service worker caches
    if ("caches" in window) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }

    // Clear Next.js cache
    if ("__NEXT_DATA__" in window) {
      // Force a hard reload
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    // Listen for chunk errors
    window.addEventListener("error", handleChunkError);
    window.addEventListener("unhandledrejection", handleChunkError);

    // Listen for Next.js navigation events
    const handleRouteChangeStart = () => {
      setHasChunkError(false);
    };

    // Note: We can't use next/navigation here directly, but we can monitor for navigation attempts
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      handleRouteChangeStart();
      return originalPushState.apply(this, args);
    };

    history.replaceState = function (...args) {
      handleRouteChangeStart();
      return originalReplaceState.apply(this, args);
    };

    return () => {
      window.removeEventListener("error", handleChunkError);
      window.removeEventListener("unhandledrejection", handleChunkError);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [handleChunkError]);

  if (hasChunkError) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="max-w-md w-full mx-4 p-6 bg-white rounded-lg shadow-xl border border-gray-200">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>

            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t("title")}
            </h2>

            <p className="text-gray-600 mb-4 text-sm">
              {t("description")}
            </p>

            {errorDetails && (
              <details className="mb-4 text-left">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                  {t("techDetails")}
                </summary>
                <code className="block mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                  {errorDetails}
                </code>
              </details>
            )}

            <div className="space-y-3">
              <Button onClick={handleRecovery} className="w-full" size="lg">
                <RefreshCw className="mr-2 h-4 w-4" />
                {t("reload")}
              </Button>

              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                {t("hardRefresh")}
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              {t("help")}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
