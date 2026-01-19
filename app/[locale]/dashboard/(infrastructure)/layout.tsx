"use client";

import AnalyticsProviderClient from "@/features/analytics/ui/components/AnalyticsProviderClient";
import OverviewCards from "@features/domains/ui/components/overview-cards";
import TabTrigger from "@features/domains/ui/components/TabTrigger";
import { Tabs, TabsList } from "@/components/ui/tabs";
import { infrastructureTabs as tabs } from "@/features/domains/data/mock";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

import { cva } from "class-variance-authority";

const tabTriggerVariants = cva(
  [
    "rounded-none px-0 pb-4 font-semibold text-muted-foreground transition-none",
    "border-b-2 border-transparent",
    "!border-x-0 !border-t-0",
    "!shadow-none !ring-0 !outline-none",
    "focus:ring-0 focus:outline-none",
    "!flex-none hover:text-foreground",
    "data-[state=active]:bg-transparent",
    "data-[state=active]:text-blue-600",
    "data-[state=active]:shadow-none",
    "data-[state=active]:border-b-blue-600",
  ].join(" "),
);

function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeTab = pathname.split("/").pop() || tabs[0].id;
  const t = useTranslations("Infrastructure.layout");

  return (
    <AnalyticsProviderClient>
      <div className="space-y-8 ">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground ">{t("description")}</p>
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
                  className={tabTriggerVariants()}
                >
                  <div className="flex items-center gap-2">
                    <tab.icon className="w-4 h-4" />
                    {t(`tabs.${tab.id}`)}
                    <span className="text-muted-foreground font-normal">
                      ({tab.count})
                    </span>
                  </div>
                </TabTrigger>
              ))}
            </TabsList>
          </div>

          <div className="mt-6">
            {activeTab === "domains" && (
              <div className="flex justify-end mb-4">
                <Button
                  asChild
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium h-9 px-4 text-sm shadow-sm"
                >
                  <Link
                    href="/dashboard/domains/new"
                    className="flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> {t("addDomainButton")}
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
