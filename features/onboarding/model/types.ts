import { OnboardingStep } from "@/entities/onboarding/model/types";
export interface OnboardingContextType {
  currentStep: number;
  totalSteps: number;
  steps: OnboardingStep[];
  currentStepData: OnboardingStep | null;
  setSteps: (steps: OnboardingStep[]) => void;
  setCurrentStep: (step: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  markStepCompleted: (stepId: number) => void;
  isStepAccessible: (stepId: number) => boolean;
}
