import StatsCardSkeleton from "@/features/analytics/ui/components/dashboard/cards/StatsCardSkeleton";

/**
 * Campaigns route loading skeleton.
 * Shows campaign-specific skeleton while page content loads.
 */
export default function CampaignsLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="animate-pulse space-y-2">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-4 w-80 bg-muted rounded" />
        </div>
        <div className="h-10 w-36 bg-muted rounded animate-pulse" />
      </div>
      
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <StatsCardSkeleton key={i} className="flex-row-reverse justify-end gap-2" />
        ))}
      </div>
      
      {/* Filter skeleton */}
      <div className="h-10 w-full bg-muted rounded animate-pulse" />
      
      {/* Table skeleton */}
      <div className="space-y-2 animate-pulse">
        <div className="h-12 bg-muted rounded" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted/50 rounded" />
        ))}
      </div>
    </div>
  );
}
