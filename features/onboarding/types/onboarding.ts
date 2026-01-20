import { LucideIcon } from "lucide-react";

export interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  explanation: string;
  icon: LucideIcon;
  color: string;
  href: string;
  buttonText: string;
  kbLink: string;
  videoId?: string | null;
  videoUrl?: string | null;
  completed: boolean;
  promotion?: {
    title: string;
    description: string;
    link: string;
  };
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

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
