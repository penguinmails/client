import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";

export default function InboxLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 dark:text-foreground">
      <div className="rounded-tl-2xl overflow-hidden flex flex-col dark:bg-muted/50 dark:divide-border">
        {/* Smart Insights Skeleton */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-blue-50 dark:from-blue-500/10 to-purple-50 dark:to-purple-500/10">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-1">
                <div className="flex items-center space-x-3 p-4">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div>
                    <Skeleton className="h-4 w-12 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Filter Skeleton */}
        <div className="flex-1 p-4 overflow-y-auto">
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-1 mb-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Button
                key={i}
                variant="ghost"
                className="w-full justify-between h-auto py-2.5 px-3"
              >
                <div className="flex items-center space-x-3">
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-8 rounded-full" />
              </Button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <Skeleton className="h-4 w-20 mb-4" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conversations List Skeleton */}
      <div className="col-span-2 dark:bg-card">
        <div className="p-4 border-b border-border">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-6 border border-border rounded-lg">
                <div className="flex items-start space-x-4">
                  <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="w-4 h-4" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-16 rounded-full" />
                        <Skeleton className="h-4 w-12 rounded-full" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="w-8 h-8" />
                        <Skeleton className="w-8 h-8" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
