"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button/button";
import { useAddCampaignContext } from "@features/campaigns/ui/context/add-campaign-context";
import { ArrowLeft, ArrowRight, Play, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createCampaign } from "@features/campaigns/actions";
import { toast } from "sonner";

function NavigationButtons() {
  const { currentStep, steps, prevStep, nextStep, form } =
    useAddCampaignContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  form.watch(["name", "leadsList", "selectedMailboxes", "steps"]);
  
  const handleLaunch = async (status: 'draft' | 'active' = 'active') => {
    try {
      setLoading(true);
      const values = form.getValues();
      
      // Map form values to campaign creation data
      const result = await createCampaign({
        ...values,
        leadListId: values.leadsList?.id,
        status: status, // Pass status to force isPublished flag
      } as Record<string, unknown>);

      if (result.success && result.data) {
        toast.success(status === 'active' ? "Campaign launched successfully!" : "Campaign saved as draft!");
        router.push(`/dashboard/campaigns/${result.data.id}`);
      } else {
        toast.error((result as { error?: string }).error || "Failed to save campaign");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    const values = form.getValues();
    switch (currentStep) {
      case 1:
        return values.name?.trim().length > 0;
      case 2:
        return values.leadsList != null;
      case 3:
        return (
          values.steps?.length > 0 &&
          values.steps.every((step: Record<string, unknown>) => step.emailSubject && step.emailBody)
        );
      case 4:
        return values.selectedMailboxes && values.selectedMailboxes.length > 0;
      case 5:
        return true;
      case 6:
        return true;
      default:
        return false;
    }
  };
  
  const disabled = !canProceed() || loading;

  return (
    <div className="bg-card dark:bg-card border-t border-border px-8 py-6 w-full">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Button
          type="button"
          onClick={prevStep}
          disabled={currentStep === 1 || loading}
          variant="outline"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Previous</span>
        </Button>

        <div className="flex items-center space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            disabled={loading}
            onClick={() => handleLaunch('draft')}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save as Draft
          </Button>
          {currentStep < steps.length ? (
            <Button type="button" onClick={nextStep} disabled={disabled}>
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button 
              type="button"
              className=" bg-emerald-600  hover:bg-emerald-700 "
              onClick={() => handleLaunch('active')}
              disabled={disabled}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5" />
              )}
              <span>{loading ? "Launching..." : "Launch Campaign"}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NavigationButtons;
