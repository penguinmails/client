import CampaignHeader from "@features/campaigns/ui/components/campaignData/CampaignHeader";
import CampiagnTabs from "@features/campaigns/ui/components/campaignData/CampaignTabs";
import LeadsTab from "@features/campaigns/ui/components/campaignData/LeadsTab";
import SequenceTab from "@features/campaigns/ui/components/campaignData/SequenceTab";
import StatsTab from "@features/campaigns/ui/components/campaignData/StatsTab";
import CampaignSKeleton from "@features/campaigns/ui/components/steps/CampaignSKeleton";
import { TabsContent } from "@/components/ui/tabs";
import { getCampaign } from "@features/campaigns/actions";
import { CampaignStatusEnum } from "@/types";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function CampaignDetail({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;

  return (
    <Suspense fallback={<CampaignSKeleton />}>
      <CampaignContent campaignId={campaignId} />
    </Suspense>
  );
}

async function CampaignContent({ campaignId }: { campaignId: string }) {
  const campaignResult = await getCampaign(campaignId);
  if (!campaignResult.success || !campaignResult.data) {
    notFound();
  }
  const campaign = campaignResult.data;
  
  // Transform Campaign to CampaignDisplay for the header component
  const campaignDisplay = {
    id: parseInt(campaign.id.toString()),
    name: campaign.name,
    status: (campaign.status || "active") as CampaignStatusEnum,
    mailboxes: 1, // Default value since not in Campaign type
    leadsSent: campaign.metrics?.recipients?.sent || 0,
    replies: campaign.metrics?.replies?.total || 0,
    lastSent: new Date(campaign.lastUpdated).toLocaleDateString(),
    createdDate: campaign.lastUpdated,
    assignedMailboxes: [campaign.fromEmail],
    openRate: campaign.metrics?.opens?.rate || 0,
    replyRate: campaign.metrics?.replies?.rate || 0,
  };
  
  return (
    <div className="space-y-6">
      <CampaignHeader backArrow={true} campaign={campaignDisplay}>
        <h1 className="text-xl font-semibold text-foreground">
          {campaign.name}
        </h1>
      </CampaignHeader>
      <CampiagnTabs>
        { }
        <div className="p-6 overflow-y-auto max-h-[60vh]">
        { }
          <TabsContent value="sequence">
            <SequenceTab />
          </TabsContent>
          <TabsContent value="stats">
            <StatsTab />
          </TabsContent>
          <TabsContent value="leads">
            <LeadsTab />
          </TabsContent>
        </div>
      </CampiagnTabs>
    </div>
  );
}
