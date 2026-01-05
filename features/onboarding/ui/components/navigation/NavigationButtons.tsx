"use client";
import { Button } from "@/components/ui/button/button";
import { useEnhancedOnboarding } from "@/context/enhanced-onboarding-context";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useCallback } from "react";
import { developmentLogger } from "@/lib/logger";
import { useRouter } from "next/navigation";

export function NavigationButtons() {
  const { currentStep, steps, goToNextStep, goToPreviousStep } =
    useEnhancedOnboarding();
  const router = useRouter();

  const handleSkipSetup = useCallback(() => {
    developmentLogger.debug(
      "Skip setup clicked - navigating away from onboarding"
    );
    // Navigate to dashboard main page when skipping setup
    router.push("/dashboard");
  }, [router]);

  const handleCompleteSetup = useCallback(() => {
    developmentLogger.debug("Complete setup clicked - onboarding finished");

    // Placeholder for workspace status verification in database
    // TODO: Implement actual workspace status check
    developmentLogger.info("Verifying workspace status in database...");

    // TODO: Add actual database verification logic here
    // For now, we'll just log that this would happen
    developmentLogger.debug(
      "Workspace verification placeholder - would check:",
      {
        userSetupComplete: true,
        onboardingCompleted: true,
        timestamp: new Date().toISOString(),
      }
    );

    // Navigate to dashboard main page after completion
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-between w-full">
      <Button
        variant="ghost"
        onClick={goToPreviousStep}
        disabled={currentStep === 1}
        className="font-medium"
      >
        <ArrowLeft className="mr-2 h-5 w-5" />
        Previous
      </Button>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={handleSkipSetup}
          className="font-medium"
        >
          Skip Setup
        </Button>

        {currentStep < steps.length ? (
          <Button onClick={goToNextStep} className="shadow-sm">
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <Button
            onClick={handleCompleteSetup}
            className="bg-green-600 hover:bg-green-700 shadow-sm"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Complete Setup
          </Button>
        )}
      </div>
    </div>
  );
}
