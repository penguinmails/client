import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface UnifiedSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Skeleton variant type */
  variant?: "default" | "card" | "list" | "table" | "stats" | "form";
  /** Number of skeleton items to render */
  count?: number;
  /** Show avatar/icon placeholder */
  showAvatar?: boolean;
  /** Show action buttons placeholder */
  showActions?: boolean;
  /** Custom height for skeleton items */
  height?: string;
  /** Custom width for skeleton items */
  width?: string;
  /** Animation type */
  animation?: "pulse" | "wave" | "none";
}

/**
 * Unified Skeleton component for consistent loading placeholders.
 * Consolidates all skeleton loading implementations across the application.
 *
 * @example
 * ```tsx
 * // Basic skeleton
 * <UnifiedSkeleton />
 *
 * // Card skeleton
 * <UnifiedSkeleton variant="card" />
 *
 * // List skeleton with multiple items
 * <UnifiedSkeleton variant="list" count={3} />
 *
 * // Stats card skeleton
 * <UnifiedSkeleton variant="stats" showAvatar />
 *
 * // Table skeleton
 * <UnifiedSkeleton variant="table" count={5} />
 * ```
 */
const UnifiedSkeleton = React.forwardRef<HTMLDivElement, UnifiedSkeletonProps>(
  ({ 
    className,
    variant = "default",
    count = 1,
    showAvatar = false,
    showActions = false,
    height,
    width,
    animation = "pulse",
    ...props 
  }, ref) => {
    
    const animationClass = animation === "pulse" ? "animate-pulse" : 
                          animation === "wave" ? "animate-bounce" : "";

    const renderBasicSkeleton = (index?: number) => (
      <Skeleton 
        key={index}
        className={cn(
          "bg-muted rounded",
          animationClass,
          height && `h-[${height}]`,
          width && `w-[${width}]`,
          !height && !width && "h-4 w-full"
        )}
      />
    );

    const renderCardSkeleton = (index?: number) => (
      <div key={index} className="border rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className={cn("h-6 w-32", animationClass)} />
          {showActions && <Skeleton className={cn("h-8 w-20", animationClass)} />}
        </div>
        <Skeleton className={cn("h-4 w-full", animationClass)} />
        <Skeleton className={cn("h-4 w-3/4", animationClass)} />
      </div>
    );

    const renderListSkeleton = (index?: number) => (
      <div key={index} className="flex items-center space-x-4 p-4">
        {showAvatar && (
          <Skeleton className={cn("h-10 w-10 rounded-full", animationClass)} />
        )}
        <div className="flex-1 space-y-2">
          <Skeleton className={cn("h-4 w-full", animationClass)} />
          <Skeleton className={cn("h-3 w-2/3", animationClass)} />
        </div>
        {showActions && (
          <div className="flex space-x-2">
            <Skeleton className={cn("h-8 w-16", animationClass)} />
            <Skeleton className={cn("h-8 w-16", animationClass)} />
          </div>
        )}
      </div>
    );

    const renderTableSkeleton = (index?: number) => (
      <div key={index} className="flex items-center space-x-4 p-4 border-b">
        <Skeleton className={cn("h-4 w-8", animationClass)} />
        <Skeleton className={cn("h-4 w-32", animationClass)} />
        <Skeleton className={cn("h-4 w-24", animationClass)} />
        <Skeleton className={cn("h-4 w-20", animationClass)} />
        <div className="flex-1" />
        {showActions && (
          <Skeleton className={cn("h-8 w-20", animationClass)} />
        )}
      </div>
    );

    const renderStatsSkeleton = (index?: number) => (
      <div key={index} className="border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className={cn("h-4 w-20", animationClass)} />
          {showAvatar && (
            <Skeleton className={cn("h-8 w-8 rounded", animationClass)} />
          )}
        </div>
        <Skeleton className={cn("h-8 w-16 mb-2", animationClass)} />
        <Skeleton className={cn("h-3 w-24", animationClass)} />
      </div>
    );

    const renderFormSkeleton = (index?: number) => (
      <div key={index} className="space-y-4">
        <div className="space-y-2">
          <Skeleton className={cn("h-4 w-20", animationClass)} />
          <Skeleton className={cn("h-10 w-full", animationClass)} />
        </div>
        <div className="space-y-2">
          <Skeleton className={cn("h-4 w-24", animationClass)} />
          <Skeleton className={cn("h-10 w-full", animationClass)} />
        </div>
        <div className="space-y-2">
          <Skeleton className={cn("h-4 w-28", animationClass)} />
          <Skeleton className={cn("h-20 w-full", animationClass)} />
        </div>
        {showActions && (
          <div className="flex justify-end space-x-2 pt-4">
            <Skeleton className={cn("h-10 w-20", animationClass)} />
            <Skeleton className={cn("h-10 w-24", animationClass)} />
          </div>
        )}
      </div>
    );

    const renderSkeleton = () => {
      switch (variant) {
        case "card":
          return renderCardSkeleton();
        case "list":
          return renderListSkeleton();
        case "table":
          return renderTableSkeleton();
        case "stats":
          return renderStatsSkeleton();
        case "form":
          return renderFormSkeleton();
        default:
          return renderBasicSkeleton();
      }
    };

    const skeletons = Array.from({ length: count }, (_, index) => {
      switch (variant) {
        case "card":
          return renderCardSkeleton(index);
        case "list":
          return renderListSkeleton(index);
        case "table":
          return renderTableSkeleton(index);
        case "stats":
          return renderStatsSkeleton(index);
        case "form":
          return renderFormSkeleton(index);
        default:
          return renderBasicSkeleton(index);
      }
    });

    return (
      <div
        ref={ref}
        className={cn(
          "space-y-2",
          variant === "table" && "space-y-0",
          variant === "stats" && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
          className
        )}
        role="status"
        aria-label="Loading content"
        {...props}
      >
        {count === 1 ? renderSkeleton() : skeletons}
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
);

UnifiedSkeleton.displayName = "UnifiedSkeleton";

export { UnifiedSkeleton };