"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Stepper } from "@/features/onboarding/ui/components/Stepper";
import { Step } from "@/features/onboarding/ui/components/steps/Step";
import { HelpSection } from "@/features/onboarding/ui/components/HelpSection";
import { NavigationButtons } from "@/features/onboarding/ui/components/navigation/NavigationButtons";
import { EnhancedOnboardingProvider } from "@/context/enhanced-onboarding-context";
import { useEnhancedOnboarding } from "@/context/enhanced-onboarding-context";
import { useTranslations } from "next-intl";

function OnboardingContent() {
  const { currentStepData } = useEnhancedOnboarding();
  const t = useTranslations();

  if (!currentStepData) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">{t("Onboarding.noSteps")}</p>
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
  const t = useTranslations();
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          {t("Onboarding.welcome")}
        </h1>
        <p className="text-lg text-muted-foreground">
          {t("Onboarding.setup")}
        </p>
      </div>
      <EnhancedOnboardingProvider>
        <OnboardingContent />
      </EnhancedOnboardingProvider>
    </div>
  );
}

export default OnboardingPage;
