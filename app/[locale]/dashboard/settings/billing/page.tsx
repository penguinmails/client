import Icon from "@/components/ui/custom/Icon";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, CreditCard } from "lucide-react";
import BillingTab from "./Billing-Tab";
import UsageTab from "./usage-tab";
import { useTranslations } from "next-intl";

function BillingUsagePage() {
  const t = useTranslations();

  const tabs = [
    {
      id: "billing",
      label: t("Settings.billing.billingTab"),
      icon: CreditCard,
      Children: BillingTab,
    },
    {
      id: "usage",
      label: t("Settings.billing.usageTab"),
      icon: BarChart3,
      Children: UsageTab,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("Settings.billing.title")}</h1>
        <p className="text-muted-foreground">
          {t("Settings.billing.description")}
        </p>
      </div>
      <Tabs defaultValue={tabs[0].id}>
        <TabsList className="tabs-list">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} className="tabs-trigger" value={tab.id}>
              <Icon icon={tab.icon} />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <tab.Children />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
export default BillingUsagePage;
