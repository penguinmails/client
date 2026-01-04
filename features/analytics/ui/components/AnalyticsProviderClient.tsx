"use client";

import dynamic from "next/dynamic";

// Dynamically import the real provider with SSR disabled
const AnalyticsProvider = dynamic(
  () => import("@features/analytics/ui/context/analytics-context").then(mod => ({ default: mod.AnalyticsProvider })),
  {
    ssr: false,
    loading: () => null
  }
);

interface ClientAnalyticsProviderProps {
  children: React.ReactNode;
}

export function ClientAnalyticsProvider({ children }: ClientAnalyticsProviderProps) {
  return <AnalyticsProvider>{children}</AnalyticsProvider>;
}

export default ClientAnalyticsProvider;
