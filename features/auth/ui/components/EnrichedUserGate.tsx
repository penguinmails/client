"use client";

import React from "react";
import Link from "next/link";
import { useEnrichment } from "../../hooks/use-enrichment";

import { AlertCircle, Mail, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ============================================================================
// Types
// ============================================================================

interface EnrichedUserGateProps {
  children: React.ReactNode;
  /** If true, shows skeleton instead of spinner during loading */
  showSkeleton?: boolean;
  /** Custom skeleton component to show during loading */
  skeleton?: React.ReactNode;
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function DashboardSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-4 w-96 bg-muted rounded" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-lg" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64 bg-muted rounded-lg" />
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    </div>
  );
}

// ============================================================================
// Alert Components
// ============================================================================

function EmailVerificationAlert({ email }: { email: string }) {
  const handleResend = async () => {
    try {
      await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "verification",
          email,
          token: "temp-token",
        }),
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to resend verification email", error);
    }
  };

  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-yellow-600" />
          <CardTitle className="text-yellow-800 dark:text-yellow-200">
            Email Verification Required
          </CardTitle>
        </div>
        <CardDescription className="text-yellow-700 dark:text-yellow-300">
          Please verify your email address to access all features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
          We sent a verification email to <strong>{email}</strong>. Check your
          inbox and click the verification link to continue.
        </p>
        <Button variant="outline" onClick={handleResend} size="sm">
          Resend Verification Email
        </Button>
      </CardContent>
    </Card>
  );
}

function PaymentRequiredAlert() {
  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-red-600" />
          <CardTitle className="text-red-800 dark:text-red-200">
            Payment Required
          </CardTitle>
        </div>
        <CardDescription className="text-red-700 dark:text-red-300">
          Your subscription is inactive or payment is overdue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-red-700 dark:text-red-300 mb-4">
          Please update your payment information to continue using PenguinMails.
        </p>
        <Link href="/dashboard/settings/billing">
          <Button variant="destructive" size="sm">
            Go to Billing
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

function EnrichmentErrorAlert({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          <CardTitle className="text-orange-800 dark:text-orange-200">
            Failed to Load Profile
          </CardTitle>
        </div>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          We couldn&apos;t load your profile information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={onRetry} size="sm">
          Try Again
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * EnrichedUserGate
 *
 * Wraps dashboard content and shows appropriate states:
 * - Loading skeleton while enrichment is in progress
 * - Email verification alert if email not verified
 * - Payment required alert if subscription inactive
 * - Enrichment error alert if loading failed
 * - Children if all checks pass
 */
export function EnrichedUserGate({
  children,
  showSkeleton = true,
  skeleton,
}: EnrichedUserGateProps) {
  const {
    enrichedUser,
    isLoadingEnrichment,
    enrichmentError,
    refreshEnrichment,
  } = useEnrichment();

  // Show loading state
  if (isLoadingEnrichment && !enrichedUser?.role) {
    if (showSkeleton) {
      return skeleton ? <>{skeleton}</> : <DashboardSkeleton />;
    }
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show error state
  if (enrichmentError && !enrichedUser?.role) {
    return (
      <div className="container mx-auto p-6">
        <EnrichmentErrorAlert onRetry={refreshEnrichment} />
      </div>
    );
  }

  // Check email verification (soft pester per AUTH_FLOW.md)
  const emailNotVerified = enrichedUser && !enrichedUser.emailVerified;

  // Check payment status (would need to be added to enrichment)
  // For now, this is a placeholder that checks if the user has a subscription claim
  const paymentRequired = false; // TODO: Check actual subscription status

  return (
    <>
      {/* Show alerts at top of content, not blocking */}
      {emailNotVerified && (
        <div className="container mx-auto px-6 pt-6">
          <EmailVerificationAlert email={enrichedUser.email} />
        </div>
      )}
      {paymentRequired && (
        <div className="container mx-auto px-6 pt-6">
          <PaymentRequiredAlert />
        </div>
      )}
      {children}
    </>
  );
}

export default EnrichedUserGate;
