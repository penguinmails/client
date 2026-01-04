"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useOnboarding } from "@features/onboarding/ui/context/onboarding-context";
import { HelpSection } from "@/shared/ui/components/help-section";
import { StepCard } from "./StepCard";
import { Stepper, Step } from "@/components/ui/Stepper";
import { createContext } from "react";
import { HelpCircle, type LucideIcon } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

interface OnboardingStepperContext {
  steps: Step[];
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export function OnboardingLayout() {
  const { currentStepData, currentStep, steps, setCurrentStep } = useOnboarding();

  if (!currentStepData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              No onboarding steps available
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convert onboarding steps to generic Step interface
  const stepperSteps: Step[] = steps.map((step, index) => ({
    number: index + 1,
    title: step.title,
    icon: (step.icon as LucideIcon) || HelpCircle, // Use HelpCircle as fallback
    color: step.color,
  }));

  const StepperContext = createContext<OnboardingStepperContext | null>({
    steps: stepperSteps,
    currentStep,
    setCurrentStep,
  });

  // Safely convert step ID to number, defaulting to currentStep + 1 if invalid
  const stepNumber = typeof currentStepData.id === 'string' ? parseInt(currentStepData.id) : currentStepData.id;
  const safeStepNumber = isNaN(stepNumber) ? currentStep + 1 : stepNumber;

  const stepData = {
    number: safeStepNumber,
    title: currentStepData.title,
    description: currentStepData.description,
    IconComponent: (currentStepData.icon as ComponentType<SVGProps<SVGSVGElement>>) || HelpCircle,
  };

  return (
    <div className="space-y-6">
      <StepperContext.Provider value={{ steps: stepperSteps, currentStep, setCurrentStep }}>
        <Stepper context={StepperContext} />
      </StepperContext.Provider>
      <StepCard {...stepData} />
      <HelpSection />
    </div>
  );
}