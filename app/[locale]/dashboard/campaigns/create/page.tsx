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
function CampaignCreatePage() {
  return (
    <AddCampaignProvider>
      <Card className="border-none shadow-none">
        <CardHeader>
          <AddCampaignHeader>
            <h1 className="text-2xl font-bold text-foreground">
              Create New Campaign
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
export default CampaignCreatePage;
