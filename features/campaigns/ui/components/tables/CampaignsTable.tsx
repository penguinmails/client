import { getMockCampaigns } from "@/shared/mocks/providers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import CampaignsTableRow from "./CampaignsTableRow";
import { CampaignDisplay, CampaignStatusEnum } from "@features/campaigns/types";

export const campaignColumns = [
  { name: "Campaign Name", key: "name" },
  { name: "Status", key: "status" },
  { name: "Mailboxes", key: "mailboxes" },
  { name: "Performance", key: "performance" },
  { name: "Last Sent", key: "lastSent" },
  { name: "Actions", key: "actions" },
];
function CampaignsTable() {
  const campaignsData = getMockCampaigns();
  // Convert Campaign to CampaignDisplay format
  const campaigns: CampaignDisplay[] = campaignsData.map((campaign, _index) => ({
    id: parseInt(String(campaign.id)), // Convert string/number ID to number for display
    name: campaign.name,
    status: (campaign.status as CampaignStatusEnum) ?? CampaignStatusEnum.ACTIVE,

    mailboxes: 1, // Default value since mailboxIds doesn't exist in MockCampaign
    leadsSent: campaign.recipients,
    replies: campaign.clicked, // Use clicked as replies since replied doesn't exist
    lastSent: campaign.createdAt.toLocaleDateString(),
    createdDate: campaign.createdAt.toISOString(),
    assignedMailboxes: ['default@company.com'], // Default value since fromEmail doesn't exist
    openRate: campaign.recipients > 0 ? Math.round((campaign.opened / campaign.recipients) * 100) : 0,
    replyRate: campaign.recipients > 0 ? Math.round((campaign.clicked / campaign.recipients) * 100) : 0,
  }));

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold mb-4">Campaigns Table</h1>
        <p className="text-muted-foreground">{5} campaigns found</p>
      </CardHeader>
      <Separator />
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full">
          <thead className="bg-muted/50 dark:bg-muted/30">
            <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {campaignColumns.map((column) => (
                <th key={column.key} className="px-8 py-4">
                  {column.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {campaigns.map((campaign) => (
              <CampaignsTableRow key={campaign.id} campaign={campaign} />
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

export default CampaignsTable;
