import ListsTab from "@features/leads/ui/components/listsTab";
import StatsCardSkeleton from "@/features/analytics/ui/components/dashboard/cards/StatsCardSkeleton";
import Icon from "@/components/ui/custom/Icon";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLeadsStats, getLeadLists } from "@features/leads/actions/stats";
import { Suspense } from "react";
import CSVUploadTab from "@features/leads/ui/components/CSVUploadTab";
import ContactsTab from "@features/leads/ui/components/ContactsTab";
import { FileText, Upload, Users } from "lucide-react";
import LeadsStats from "@features/leads/ui/components/LeadsStats";

// Force dynamic rendering since this page uses authentication and headers
export const dynamic = "force-dynamic";

// Server Component
async function LeadsPage() {
  const leadsStatsData = await getLeadsStats();
  const leadListsData = await getLeadLists();

  const totalContacts = leadListsData.reduce(
    (sum, list) => sum + list.contacts,
    0
  );

  const leadsTabs = [
    {
      id: "lists",
      label: "Lead Lists",
      count: leadListsData.length,
      icon: FileText,
    },
    { id: "upload", label: "Upload CSV", icon: Upload },
    {
      id: "contacts",
      label: "All Contacts",
      count: totalContacts,
      icon: Users,
    },
  ];
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lead Hub</h1>
          <p className="text-muted-foreground mt-1">
            Manage your lead lists, imports, and contact database
          </p>
        </div>
      </div>
      <Suspense
        fallback={
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <LeadsStats stats={leadsStatsData} />
        </div>
      </Suspense>
      <Card>
        <Tabs defaultValue={leadsTabs[0].id}>
          <Suspense fallback={<StatsCardSkeleton />}>
            <CardHeader>
              <TabsList className="tabs-list">
                {leadsTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="tabs-trigger"
                  >
                    <Icon icon={tab.icon} className="mr-2" />
                    {tab.label}
                    {tab.count && <span className="ml-1 ">({tab.count})</span>}
                  </TabsTrigger>
                ))}
              </TabsList>
            </CardHeader>
          </Suspense>
          <CardContent>
            <TabsContent value="lists">
              <Suspense fallback={<StatsCardSkeleton />}>
                <ListsTab />
              </Suspense>
            </TabsContent>
            <TabsContent value="upload">
              <CSVUploadTab />
            </TabsContent>
            <TabsContent value="contacts">
              <ContactsTab />
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}

export default LeadsPage;
