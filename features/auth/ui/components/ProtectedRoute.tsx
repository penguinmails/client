"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "../../hooks/use-session";
import { useEnrichment } from "../../hooks/use-enrichment";
import { Loader2 } from "lucide-react";
import { SessionErrorView, EnrichmentErrorView } from "./ErrorViews";
import { UserRole } from "../../types/base";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | string; // Allow flexible roles
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireEnrichment?: boolean;
}

export const ProtectedRoute = ({
  children,
  requiredRole,
  fallback,
  redirectTo = "/",
  requireEnrichment = true,
}: ProtectedRouteProps) => {
  const { session, isLoading: isSessionLoading, error: sessionError } = useSession();
  const { enrichedUser, isLoadingEnrichment, enrichmentError } = useEnrichment();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect if no session (and not loading)
  useEffect(() => {
    if (!isSessionLoading && !session && !sessionError) {
        // preserve destination
        const currentPath = window.location.pathname;
        const params = new URLSearchParams(searchParams.toString());
        if (currentPath !== '/login' && currentPath !== '/') {
             params.set("next", currentPath);
        }
        
        const nextUrl = params.toString() ? `${redirectTo}?${params.toString()}` : redirectTo;
        router.push(nextUrl);
    }
  }, [isSessionLoading, session, sessionError, router, redirectTo, searchParams]);

  // 1. Session Loading / Checking
  if (isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 2. Session Error
  if (sessionError) {
    return <SessionErrorView error={sessionError} />;
  }

  // 3. No Session (Redirecting in effect, but render null/fallback meanwhile)
  if (!session) {
    return null; 
  }

  // If enrichment is not required, we can skip the rest of the checks
  if (!requireEnrichment) {
    return <>{children}</>;
  }

  // 4. Enrichment Loading
  if (isLoadingEnrichment) {
       // Optional: show loading with user context ("Loading profile...")
       return (
      <div className="flex items-center justify-center min-h-[50vh] flex-col gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  // 5. Enrichment Error
  if (enrichmentError) {
    return <EnrichmentErrorView error={enrichmentError} />;
  }

  // 6. Role Check (if required)
  if (requiredRole && enrichedUser) {
      const userRoles = enrichedUser.roles || [];
      if (enrichedUser.role) userRoles.push(enrichedUser.role);
      
      const hasRole = userRoles.includes(requiredRole);
      
      if (!hasRole) {
          return fallback ? <>{fallback}</> : (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                 <h1 className="text-2xl font-bold">Access Denied</h1>
                 <p className="text-muted-foreground">You do not have the required permissions to view this page.</p>
            </div>
          );
      }
  }

  return <>{children}</>;
};
