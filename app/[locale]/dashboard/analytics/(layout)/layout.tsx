"use client";
import nextDynamic from "next/dynamic";

// Dynamically import all analytics components to prevent SSR issues
const AnalyticsHeaderActions = nextDynamic(
  () => import("@/features/analytics/ui/components/actions/AnalyticsHeaderActions"),
  { ssr: false, loading: () => null }
);

const ClientAnalyticsProvider = nextDynamic(
  () => import("@/features/analytics/ui/components/AnalyticsProviderClient").then(mod => ({ default: mod.ClientAnalyticsProvider })),
  { ssr: false, loading: () => <div>Loading...</div> }
);

export const dynamic = 'force-dynamic';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClientAnalyticsProvider>
      <div className="space-y-8 ">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Analytics Hub
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive performance insights and campaign analytics
            </p>
          </div>
          <div>
            <AnalyticsHeaderActions />
          </div>
        </div>
        <div>{children}</div>
      </div>
    </ClientAnalyticsProvider>
  );
}
export default Layout;
