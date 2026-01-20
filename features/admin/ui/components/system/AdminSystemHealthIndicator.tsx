/**
 * Admin System Health Indicator
 * 
 * Admin-specific system health monitoring component with detailed information
 */

"use client";

import { useAdminSystemHealth } from "../../../model/system-health-context";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  HelpCircle,
  RefreshCw,
  Database,
  Shield,
  Server
} from "lucide-react";

interface AdminSystemHealthIndicatorProps {
  showDetails?: boolean;
  showServices?: boolean;
  className?: string;
}

/**
 * AdminSystemHealthIndicator component for admin dashboard
 * Provides comprehensive system health monitoring with service details
 */
export function AdminSystemHealthIndicator({ 
  showDetails = true, 
  showServices = true,
  className = "" 
}: AdminSystemHealthIndicatorProps) {
  const { systemHealth, checkSystemHealth, isChecking } = useAdminSystemHealth();

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
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
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

  const getServiceIcon = (service: string) => {
    switch (service) {
      case "database":
        return <Database className="h-3 w-3" />;
      case "auth":
        return <Shield className="h-3 w-3" />;
      default:
        return <Server className="h-3 w-3" />;
    }
  };

  const getServiceStatus = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "unhealthy":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const handleManualCheck = () => {
    checkSystemHealth();
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span>System Health</span>
            <Badge variant={getStatusVariant()}>
              {systemHealth.status}
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualCheck}
            disabled={isChecking}
          >
            <RefreshCw className={`h-3 w-3 ${isChecking ? "animate-spin" : ""}`} />
            {isChecking ? "Checking..." : "Refresh"}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert className={getStatusColor()}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-medium capitalize">
                System {systemHealth.status}
              </span>
              {systemHealth.lastCheck && (
                <span className="text-xs opacity-75">
                  Last checked: {systemHealth.lastCheck.toLocaleTimeString()}
                </span>
              )}
            </div>
            
            {showDetails && systemHealth.details && typeof systemHealth.details === 'string' && (
              <AlertDescription className="text-sm">
                {systemHealth.details}
              </AlertDescription>
            )}
          </div>
        </Alert>

        {showServices && systemHealth.services && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Service Status</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(systemHealth.services).map(([service, status]) => (
                <div key={service} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  {getServiceIcon(service)}
                  <span className="text-sm capitalize">{service}</span>
                  <span className={`text-xs font-medium ml-auto ${getServiceStatus(String(status))}`}>
                    {String(status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {systemHealth.details && typeof systemHealth.details === 'object' && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">System Details</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              {Object.entries(systemHealth.details).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {systemHealth.details && typeof systemHealth.details === 'string' && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">System Details</h4>
            <div className="text-xs text-muted-foreground">
              <p>{systemHealth.details}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact admin system health status for use in headers/navigation
 */
export function AdminSystemHealthBadge({ className = "" }: { className?: string }) {
  const { systemHealth, checkSystemHealth, isChecking } = useAdminSystemHealth();

  if (systemHealth.status === "healthy") {
    return null; // Don't show when healthy
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={checkSystemHealth}
      disabled={isChecking}
      className={`gap-2 ${className}`}
    >
      {systemHealth.status === "degraded" && (
        <AlertTriangle className="h-3 w-3 text-yellow-500" />
      )}
      {systemHealth.status === "unhealthy" && (
        <XCircle className="h-3 w-3 text-red-500" />
      )}
      {systemHealth.status === "unknown" && (
        <HelpCircle className="h-3 w-3 text-gray-500" />
      )}
      <span className="text-xs">
        {isChecking ? "Checking..." : `System ${systemHealth.status}`}
      </span>
    </Button>
  );
}