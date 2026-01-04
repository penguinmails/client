import AddCampaignForm from "@features/campaigns/ui/components/steps/AddCampaignForm";
import AddCampaignHeader from "@features/campaigns/ui/components/steps/AddCampaignHeader";
import AddCampaignSteps from "@features/campaigns/ui/components/steps/AddCampaignSteps";
import NavigationButtons from "@features/campaigns/ui/components/steps/NavigationButtons";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { AddCampaignProvider } from "@features/campaigns/ui/context/add-campaign-context";
import { getCampaign } from "@features/campaigns/actions";
import { CampaignStatus } from "@features/campaigns/types";
import { notFound } from "next/navigation";

export default async function CampaignCreatePage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  const campaignResult = await getCampaign(campaignId);
  if (!campaignResult.success || !campaignResult.data) {
    notFound();
  }
  const campaign = campaignResult.data;
  
  // Transform Campaign to CampaignFormValues format
  const transformedCampaign = {
    name: campaign.name,
    fromName: campaign.fromName,
    fromEmail: campaign.fromEmail,
    status: (campaign.status === 'active' ? 'ACTIVE' : 
             campaign.status === 'paused' ? 'PAUSED' :
             campaign.status === 'completed' ? 'COMPLETED' : 'DRAFT') as CampaignStatus,
    steps: [], // Will be populated by the form
    clients: [], // Will be populated by the form
    timezone: 'UTC', // Default value
    description: '',
    companyId: 0,
    createdById: '',
    sendDays: [],
    sendTimeStart: '',
    sendTimeEnd: '',
    emailsPerDay: 0,
    selectedMailboxes: [],
    metrics: campaign.metrics,
    createdAt: new Date(campaign.lastUpdated),
    updatedAt: new Date(campaign.lastUpdated),
  };
  
  return (
    <AddCampaignProvider initialData={transformedCampaign} campaign={transformedCampaign} editingMode={true}>
      <Card className="border-none shadow-none">
        <CardHeader>
          <AddCampaignHeader>
            <h1 className="text-2xl font-bold text-foreground">
              Edit Campaign {campaign.name || "New Campaign"}
            </h1>
          </AddCampaignHeader>
        </CardHeader>
        <CardContent className="space-y-8 ">
          <AddCampaignSteps />
          <AddCampaignForm />
        </CardContent>
        <CardFooter>
          <NavigationButtons />
        </CardFooter>
      </Card>
    </AddCampaignProvider>
  );
}
