"use client";

import AnalyticsProviderClient from "@/features/analytics/ui/components/AnalyticsProviderClient";
import OverviewCards from "@features/domains/ui/components/overview-cards";
import TabTrigger from "@features/domains/ui/components/TabTrigger";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { infrastructureTabs as tabs } from "@/features/domains/data/mock";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button/button";
import { Plus } from "lucide-react";
import Link from "next/link";

function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeTab = pathname.split("/").pop() || tabs[0].id;

  return (
    <AnalyticsProviderClient>
      <div className="space-y-8 ">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Domains & Mailboxes</h1>
          <p className="text-muted-foreground ">
            Manage your sending domains, mailboxes, and warmup processes
          </p>
        </div>
        <Suspense>
          <OverviewCards />
        </Suspense>
        
        <Tabs value={activeTab} className="w-full">
          <div className="pb-6 border-b border-gray-200">
            <TabsList className="bg-transparent justify-start h-auto p-0 gap-8">
              {tabs.map((tab) => (
                <TabTrigger
                  key={tab.id}
                  href={`/dashboard/${tab.id}`}
                  id={tab.id}
                  className="data-[state=active]:bg-transparent data-[state=active]:text-blue-600 data-[state=active]:shadow-none data-[state=active]:border-b-blue-600 rounded-none px-0 pb-4 font-semibold text-muted-foreground transition-none border-b-2 border-transparent !border-x-0 !border-t-0 !shadow-none !ring-0 !outline-none focus:ring-0 focus:outline-none !flex-none hover:text-foreground"
                >
                  <div className="flex items-center gap-2">
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      <span className="text-muted-foreground font-normal">({tab.count})</span>
                  </div>
                </TabTrigger>
              ))}
            </TabsList>
          </div>
          
          <div className="mt-6">
            {activeTab === "domains" && (
              <div className="flex justify-end mb-4">
                <Button asChild className="bg-[rgb(43,128,255)] hover:bg-[rgb(43,128,255)]/90 text-white rounded-md font-medium h-9 px-4 text-sm shadow-sm">
                  <Link href="/dashboard/domains/new" className="flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Add Domain
                  </Link>
                </Button>
              </div>
            )}
            {children}
          </div>
        </Tabs>
      </div>
    </AnalyticsProviderClient>
  );
}
export default Layout;
