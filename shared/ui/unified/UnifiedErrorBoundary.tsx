"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/shared/utils";
import { developmentLogger } from "@/lib/logger";

interface UnifiedErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback component */
  fallback?: ReactNode;
  /** Error boundary variant */
  variant?: "default" | "minimal" | "detailed";
  /** Show retry button */
  showRetry?: boolean;
  /** Show home button */
  showHome?: boolean;
  /** Show reload button */
  showReload?: boolean;
  /** Custom error title */
  title?: string;
  /** Custom error message */
  message?: string;
  /** Callback when retry is clicked */
  onRetry?: () => void;
  /** Callback when error occurs */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Additional CSS classes */
  className?: string;
}

interface UnifiedErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

/**
 * Unified Error Boundary component for consistent error handling.
 * Consolidates all error boundary implementations across the application.
 *
 * @example
 * ```tsx
 * // Basic error boundary
 * <UnifiedErrorBoundary>
 *   <MyComponent />
 * </UnifiedErrorBoundary>
 *
 * // Minimal variant
 * <UnifiedErrorBoundary variant="minimal">
 *   <MyComponent />
 * </UnifiedErrorBoundary>
 *
 * // With custom actions
 * <UnifiedErrorBoundary 
 *   showRetry 
 *   showHome 
 *   onRetry={() => window.location.reload()}
 * >
 *   <MyComponent />
 * </UnifiedErrorBoundary>
 * ```
 */
export class UnifiedErrorBoundary extends Component<
  UnifiedErrorBoundaryProps,
  UnifiedErrorBoundaryState
> {
  constructor(props: UnifiedErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): UnifiedErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    developmentLogger.error("UnifiedErrorBoundary caught an error:", error, errorInfo);
    
    this.setState({
      error,
      errorInfo: errorInfo.componentStack || null,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    this.props.onRetry?.();
  };

  handleHome = () => {
    window.location.href = "/dashboard";
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const {
        variant = "default",
        showRetry = true,
        showHome = false,
        showReload = false,
        title = "Something went wrong",
        message,
        className,
      } = this.props;

      const errorMessage = message || 
        this.state.error?.message || 
        "An unexpected error occurred. Please try again.";

      // Minimal variant - just an alert
      if (variant === "minimal") {
        return (
          <Alert variant="destructive" className={className}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{errorMessage}</span>
              {showRetry && (
                <Button 
                  onClick={this.handleRetry} 
                  variant="outline" 
                  size="sm"
                  className="ml-2"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        );
      }

      // Default and detailed variants
      return (
        <Card className={cn("border-destructive/50 max-w-2xl mx-auto", className)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              {showRetry && (
                <Button onClick={this.handleRetry} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}
              
              {showHome && (
                <Button onClick={this.handleHome} variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              )}
              
              {showReload && (
                <Button onClick={this.handleReload} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
              )}
            </div>

            {/* Development error details */}
            {variant === "detailed" && 
             process.env.NODE_ENV === "development" && 
             this.state.errorInfo && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-3 rounded overflow-auto max-h-64">
                  {this.state.error?.stack}
                  {this.state.errorInfo}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

/**
 * Simple error fallback component for inline error states
 */
export function UnifiedErrorFallback({
  error,
  retry,
  className,
  variant = "default",
}: {
  error: string;
  retry?: () => void;
  className?: string;
  variant?: "default" | "minimal";
}) {
  if (variant === "minimal") {
    return (
      <div className={cn("text-center py-4", className)}>
        <p className="text-sm text-muted-foreground">{error}</p>
        {retry && (
          <Button onClick={retry} variant="ghost" size="sm" className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{error}</span>
        {retry && (
          <Button onClick={retry} variant="outline" size="sm" className="ml-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

export default UnifiedErrorBoundary;