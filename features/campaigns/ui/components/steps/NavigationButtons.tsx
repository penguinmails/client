"use client";

import { Button } from "@/components/ui/button/button";
import { useAddCampaignContext } from "@features/campaigns/ui/context/add-campaign-context";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";

function NavigationButtons() {
  const { currentStep, steps, prevStep, nextStep, form } =
    useAddCampaignContext();
  form.watch(["name", "leadsList", "selectedMailboxes", "steps"]);
  const canProceed = () => {
    const values = form.getValues();
    switch (currentStep) {
      case 0:
        return values.name?.trim().length > 0;
      case 1:
        return values.leadsList != null;
      case 2:
        return values.selectedMailboxes && values.selectedMailboxes.length > 0;
      case 3:
        return (
          values.steps?.length > 0 &&
          values.steps.every((step) => step.emailSubject && step.emailBody)
        );
      case 4:
        return true;
      case 5:
        return true;
      default:
        return false;
    }
  };
  const disabled = !canProceed();

  return (
    <div className="bg-card dark:bg-card border-t border-border px-8 py-6 w-full">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Button
          onClick={prevStep}
          disabled={currentStep === 0}
          variant="outline"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Previous</span>
        </Button>

        <div className="flex items-center space-x-4">
          <Button variant="outline">Save as Draft</Button>
          {currentStep < steps.length - 1 ? (
            <Button onClick={nextStep} disabled={disabled}>
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          ) : (
            <Button className=" bg-emerald-600  hover:bg-emerald-700 ">
              <Play className="w-5 h-5" />
              <span>Launch Campaign</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
export default NavigationButtons;
