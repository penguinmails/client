"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Stepper } from "@/features/onboarding/ui/components/Stepper";
import { Step } from "@/features/onboarding/ui/components/steps/Step";
import { HelpSection } from "@/features/onboarding/ui/components/HelpSection";
import { NavigationButtons } from "@/features/onboarding/ui/components/navigation/NavigationButtons";
import { EnhancedOnboardingProvider } from "@/context/enhanced-onboarding-context";
import { useEnhancedOnboarding } from "@/context/enhanced-onboarding-context";

interface OnboardingContentProps {
  welcomeTitle: string;
  setupDescription: string;
  noStepsMessage: string;
}

function OnboardingSteps({ noStepsMessage }: { noStepsMessage: string }) {
  const { currentStepData } = useEnhancedOnboarding();

  if (!currentStepData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">{noStepsMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Stepper />
      <Step step={currentStepData} />
      <NavigationButtons />
      <HelpSection />
    </div>
  );
}

/**
 * Onboarding Content - Client Component
 * Receives translated strings from server component parent.
 */
export default function OnboardingContent({
  welcomeTitle,
  setupDescription,
  noStepsMessage,
}: OnboardingContentProps) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {welcomeTitle}
        </h1>
        <p className="text-lg text-muted-foreground">
          {setupDescription}
        </p>
      </div>
      <EnhancedOnboardingProvider>
        <OnboardingSteps noStepsMessage={noStepsMessage} />
      </EnhancedOnboardingProvider>
    </div>
  );
}
