import { UnifiedSkeleton } from "@/shared/ui/unified";

export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Summary Cards Skeleton */}
      <UnifiedSkeleton variant="stats" count={4} showAvatar />

      {/* Filters Skeleton */}
      <div className="bg-white dark:bg-card shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <UnifiedSkeleton height="40px" className="flex-1" />
            <UnifiedSkeleton height="40px" width="128px" />
            <UnifiedSkeleton height="40px" width="96px" />
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white dark:bg-card shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <UnifiedSkeleton variant="list" count={10} showAvatar showActions />
        </div>
      </div>
    </div>
  );
}