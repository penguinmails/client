export function MainContentSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-64 bg-muted rounded" />
        <div className="h-4 w-96 bg-muted rounded" />
      </div>
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg" />
        ))}
      </div>
      {/* Main content skeleton */}
      <div className="h-64 bg-muted rounded-lg" />
      <div className="h-48 bg-muted rounded-lg" />
    </div>
  );
}
