import AnalyticsProviderClient from "@/features/analytics/ui/components/AnalyticsProviderClient";
import OverviewCards from "@features/domains/ui/components/overview-cards";
import TabTrigger from "@features/domains/ui/components/TabTrigger";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { domainTabs as tabs } from "@/features/domains/data/mock";
import { Suspense } from "react";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AnalyticsProviderClient>
      <div className="space-y-8 ">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Domains & IPS</h1>
          <p className="text-muted-foreground ">
            Manage your sending domains & IPs processes
          </p>
        </div>
        <Suspense>
          <OverviewCards />
        </Suspense>
        <Card>
          <Tabs defaultValue={tabs.at(0)?.id} className="w-full">
            <CardHeader>
              <TabsList className="tabs-list">
                {tabs.map((tab) => (
                  <TabTrigger
                    key={tab.id}
                    href={`/dashboard/${tab.id}`}
                    id={tab.id}
                  >
                    <tab.icon />
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 text-sm ">({tab.count})</span>
                    )}
                  </TabTrigger>
                ))}
              </TabsList>
            </CardHeader>
            <CardContent>{children}</CardContent>
          </Tabs>
        </Card>
      </div>
    </AnalyticsProviderClient>
  );
}
export default Layout;
