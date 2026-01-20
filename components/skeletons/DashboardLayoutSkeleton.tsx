import { MainContentSkeleton } from "./MainContentSkeleton";

export function DashboardLayoutSkeleton() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar skeleton */}
      <div className="w-64 bg-muted/30 border-r p-4 space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded" />
          ))}
        </div>
      </div>
      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Header skeleton */}
        <div className="h-16 border-b bg-muted/20 animate-pulse" />
        {/* Content skeleton */}
        <div className="flex-1 p-6">
          <MainContentSkeleton />
        </div>
      </div>
    </div>
  );
}
