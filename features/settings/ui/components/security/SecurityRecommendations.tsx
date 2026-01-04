"use client";
import { useState, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button/button";
import { SettingsLoadingSkeleton } from "@/shared/ui/components/settings-loading-skeleton";
import { SettingsErrorState } from "@/shared/ui/components/settings-error-state";
import { showSecurityUpdateSuccess } from "@/shared/ui/components/settings-success-notification";
import { useTwoAuthContext } from "./TwoFactorAuthSwitch";
import { AlertTriangle, Check, Shield, Loader2, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/shared/utils";
import { useServerAction } from "@/shared/hooks/use-server-action";
import { getSecurityRecommendations } from "@features/settings/actions";
import { productionLogger } from "@/lib/logger";

interface SecurityRecommendationUI {
  id: string;
  title: string;
  description: string;
  status: "enabled" | "recommended" | "warning";
  actionRequired: boolean;
}

function SecurityRecommendations() {
  const { isEnabled } = useTwoAuthContext();
  const [refreshing, setRefreshing] = useState(false);

  // Server action for fetching security recommendations
  const securityAction = useServerAction(() => getSecurityRecommendations(), {
    onError: (error) => {
      productionLogger.error("Failed to load security recommendations", error);
    },
  });

  // Load security data on mount
  useEffect(() => {
    securityAction.execute(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await securityAction.execute(undefined);
      showSecurityUpdateSuccess();
    } catch (error) {
      productionLogger.error("Failed to refresh security recommendations", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Show loading state
  if (securityAction.loading && !securityAction.data) {
    return <SettingsLoadingSkeleton variant="security" itemCount={3} />;
  }

  // Show error state
  if (securityAction.error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Security Recommendations</h3>
            <p className="text-sm text-muted-foreground">
              Review and improve your account security
            </p>
          </div>
          <Button
            onClick={() => securityAction.execute(undefined)}
            variant="outline"
            size="sm"
            disabled={securityAction.loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>

        <SettingsErrorState
          error={securityAction.error || "An error occurred"}
          errorType="network"
          onRetry={() => securityAction.execute(undefined)}
          retryLoading={securityAction.loading}
          canRetry={securityAction.canRetry ?? true}
          variant="card"
          showDetails
        />
      </div>
    );
  }

  const recommendations = (securityAction.data || []) as Array<{
    id: string;
    title: string;
    description: string;
    completed?: boolean;
  }>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Security Recommendations</h3>
          <p className="text-sm text-muted-foreground">
            Review and improve your account security
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          disabled={refreshing || securityAction.loading}
        >
          {refreshing || securityAction.loading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      <Alert
        className={cn(
          isEnabled
            ? "border-green-200 bg-green-50/50"
            : "border-orange-200 bg-orange-50/50"
        )}
      >
        <AlertTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-1 rounded-full",
                isEnabled ? "bg-green-100" : "bg-orange-100"
              )}
            >
              {isEnabled ? (
                <Check className="size-4 text-green-600" />
              ) : (
                <AlertTriangle className="size-4 text-orange-600" />
              )}
            </div>
            <span>Two-Factor Authentication</span>
          </div>
          <Badge
            variant="outline"
            className={cn(
              isEnabled
                ? "bg-green-100 text-green-700 border-green-300"
                : "bg-orange-100 text-orange-700 border-orange-300"
            )}
          >
            {isEnabled ? "Enabled" : "Recommended"}
          </Badge>
        </AlertTitle>
        <AlertDescription>
          {isEnabled
            ? "Great! Your account is protected with 2FA."
            : "Enable 2FA to add an extra layer of security to your account."}
        </AlertDescription>
      </Alert>

      <Alert className="border-green-200 bg-green-50/50">
        <AlertTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-green-100 rounded-full">
              <Check className="size-4 text-green-600" />
            </div>
            <span>Strong Password</span>
          </div>
          <Badge
            variant="outline"
            className="bg-green-100 text-green-700 border-green-300"
          >
            Active
          </Badge>
        </AlertTitle>
        <AlertDescription>
          Your password meets our security requirements.
        </AlertDescription>
      </Alert>

      <Alert className="border-green-200 bg-green-50/50">
        <AlertTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 bg-green-100 rounded-full">
              <Shield className="size-4 text-green-600" />
            </div>
            <span>Recent Activity Monitoring</span>
          </div>
          <Badge
            variant="outline"
            className="bg-green-100 text-green-700 border-green-300"
          >
            Active
          </Badge>
        </AlertTitle>
        <AlertDescription>
          We monitor your account for suspicious activity and will notify you of
          any concerns.
        </AlertDescription>
      </Alert>

      {/* Dynamic recommendations from server */}
      {recommendations.map((recommendation) => {
        // Map server recommendation to UI format
        const uiRecommendation: SecurityRecommendationUI = {
          id: recommendation.id,
          title: recommendation.title,
          description: recommendation.description,
          status: recommendation.completed ? "enabled" : "recommended",
          actionRequired: !recommendation.completed
        };
        return (
          <Alert
            key={uiRecommendation.id}
            className={cn(
              uiRecommendation.status === "enabled"
                ? "border-green-200 bg-green-50/50"
                : uiRecommendation.status === "warning"
                  ? "border-red-200 bg-red-50/50"
                  : "border-orange-200 bg-orange-50/50"
            )}
          >
            <AlertTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-1 rounded-full",
                    uiRecommendation.status === "enabled"
                      ? "bg-green-100"
                      : uiRecommendation.status === "warning"
                        ? "bg-red-100"
                        : "bg-orange-100"
                  )}
                >
                  {uiRecommendation.status === "enabled" ? (
                    <Check className="size-4 text-green-600" />
                  ) : uiRecommendation.status === "warning" ? (
                    <AlertTriangle className="size-4 text-red-600" />
                  ) : (
                    <AlertTriangle className="size-4 text-orange-600" />
                  )}
                </div>
                <span>{uiRecommendation.title}</span>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  uiRecommendation.status === "enabled"
                    ? "bg-green-100 text-green-700 border-green-300"
                    : uiRecommendation.status === "warning"
                      ? "bg-red-100 text-red-700 border-red-300"
                      : "bg-orange-100 text-orange-700 border-orange-300"
                )}
              >
                {uiRecommendation.status === "enabled"
                  ? "Active"
                  : uiRecommendation.status === "warning"
                    ? "Action Required"
                    : "Recommended"}
              </Badge>
            </AlertTitle>
            <AlertDescription>{uiRecommendation.description}</AlertDescription>
          </Alert>
        );
      })}

      {securityAction.data && (
        <div className="text-xs text-muted-foreground text-right">
          Last updated: {new Date().toLocaleString()}
        </div>
      )}
    </div>
  );
}
export default SecurityRecommendations;