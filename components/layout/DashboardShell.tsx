"use client";

import { ProtectedRoute } from "@/features/auth/ui/components/ProtectedRoute";
import AnalyticsProviderClient from "@/features/analytics/ui/components/AnalyticsProviderClient";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSideBar from "@/features/analytics/ui/components/layout/Sidebar";
import Header from "@/components/layout/DashboardHeader";
import { Suspense, useEffect, useState } from "react";
import { productionLogger } from "@/lib/logger";
import { MainContentSkeleton } from "@/components/skeletons/MainContentSkeleton";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

function ChunkErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const handleChunkError = (event: ErrorEvent) => {
      // Check if this is a chunk loading error
      if (
        event.message.includes("ChunkLoadError") ||
        event.message.includes("loading chunk")
      ) {
        productionLogger.error("Chunk loading error detected:", event.message);
        setHasError(true);
        setError(new Error(event.message));
      }
    };

    // Listen for chunk errors
    window.addEventListener("error", handleChunkError);

    return () => {
      window.removeEventListener("error", handleChunkError);
    };
  }, []);

  const handleReload = () => {
    productionLogger.info("Reloading page due to chunk error");
    window.location.reload();
  };

  if (hasError && error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading Error
          </h2>
          <p className="text-gray-600 mb-4">
            A chunk failed to load. This can happen after a deployment or
            network issue.
          </p>
          <button
            onClick={handleReload}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
          <p className="text-xs text-gray-500 mt-4">
            If this persists, try clearing your browser cache.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

interface DashboardShellProps {
  children: React.ReactNode;
}

/**
 * DashboardShell - Client wrapper for the dashboard layout.
 * Encapsulates all client-side providers (auth, analytics) and layout components
 * (sidebar, header) to enable stable navigation without full page refreshes.
 * 
 * Uses Suspense boundary around children so main content shows skeleton
 * while route content loads, keeping sidebar/header visible.
 */
export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <ProtectedRoute requireEnrichment={false}>
      <AnalyticsProviderClient>
        <ChunkErrorBoundary>
          <SidebarProvider>
            <AppSideBar />
            <SidebarInset className="md:peer-data-[variant=inset]:shadow-none gap-5 overflow-hidden bg-muted">
              <Header />
              <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 bg-background rounded-xl border shadow-sm">
                <ProtectedRoute requireEnrichment={true}>
                  <Suspense fallback={<MainContentSkeleton />}>
                    {children}
                  </Suspense>
                </ProtectedRoute>
              </main>
            </SidebarInset>
          </SidebarProvider>
        </ChunkErrorBoundary>
      </AnalyticsProviderClient>
    </ProtectedRoute>
  );
}

export default DashboardShell;
