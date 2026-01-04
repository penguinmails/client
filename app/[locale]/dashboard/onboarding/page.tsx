"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Stepper } from "@/components/onboarding/Stepper";
import { Step } from "@/components/onboarding/Step";
import { HelpSection } from "@/components/onboarding/HelpSection";
import { NavigationButtons } from "@/components/onboarding/NavigationButtons";
import { EnhancedOnboardingProvider } from "@/context/enhanced-onboarding-context";
import { useEnhancedOnboarding } from "@/context/enhanced-onboarding-context";

function OnboardingContent() {
  const { currentStepData } = useEnhancedOnboarding();

  if (!currentStepData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No onboarding steps available</p>
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

function OnboardingPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Welcome to PenguinMails! 🐧
        </h1>
        <p className="text-lg text-muted-foreground">
          Let&apos;s get you set up for cold email success
        </p>
      </div>
      <EnhancedOnboardingProvider>
        <OnboardingContent />
      </EnhancedOnboardingProvider>
    </div>
  );
}

export default OnboardingPage;
