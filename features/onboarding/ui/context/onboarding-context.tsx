"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Globe, Mail, PenTool, Send } from "lucide-react";
import { OnboardingStep } from "@/types/onboarding";

interface OnboardingContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  steps: OnboardingStep[];
  completeStep: (stepId: number) => void;
  skipStep: (stepId: number) => void;
  isStepCompleted: (stepId: number) => boolean;
  canProceed: boolean;
  currentStepData?: OnboardingStep;
  markStepCompleted: (stepId: number) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  totalSteps: number;
  isStepAccessible: (stepId: number) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

const defaultSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Welcome to PenguinMails",
    subtitle: "Get started with your email marketing journey",
    explanation:
      "Welcome to PenguinMails! Let's get you set up for cold email success.",
    icon: Globe,
    color: "bg-blue-500",
    href: "/en/dashboard",
    buttonText: "Get Started",
    kbLink: "Getting started guide",
    videoId: "welcome",
    videoUrl: "https://www.youtube.com/watch?v=welcome-guide",
    completed: false,
  },
  {
    id: 2,
    title: "Add Your Domain",
    subtitle: "Set up your sending domain for better deliverability",
    explanation:
      "Connect and verify your domain to send professional emails and improve deliverability.",
    icon: Globe,
    color: "bg-blue-500",
    href: "/en/dashboard/domains",
    buttonText: "Go to Domains",
    kbLink: "Domain setup guide",
    videoId: "domain",
    videoUrl: "https://www.youtube.com/watch?v=domain-setup-guide",
    completed: false,
  },
  {
    id: 3,
    title: "Connect Mailbox",
    subtitle: "Create email accounts to send campaigns from",
    explanation:
      "Set up mailboxes to distribute your sending volume and appear more natural.",
    icon: Mail,
    color: "bg-purple-500",
    href: "/en/dashboard/mailboxes",
    buttonText: "Go to Mailboxes",
    kbLink: "Mailbox configuration",
    videoId: "mailbox",
    videoUrl: "https://www.youtube.com/watch?v=mailbox-setup-guide",
    completed: false,
  },
  {
    id: 4,
    title: "Create Template",
    subtitle: "Design your first email template",
    explanation: "Create engaging email templates for your campaigns.",
    icon: PenTool,
    color: "bg-green-500",
    href: "/en/dashboard/templates",
    buttonText: "Go to Templates",
    kbLink: "Template creation guide",
    videoId: "template",
    videoUrl: "https://www.youtube.com/watch?v=template-creation-guide",
    completed: false,
    promotion: {
      title: "Need Professional Copy?",
      description: "Our experts can create high-converting templates for you.",
      link: "Learn about Copywriting Service",
    },
  },
  {
    id: 5,
    title: "Launch Campaign",
    subtitle: "Create and send your first campaign",
    explanation:
      "Put everything together and send your first cold outreach campaign.",
    icon: Send,
    color: "bg-emerald-500",
    href: "/en/dashboard/campaigns/create",
    buttonText: "Create Campaign",
    kbLink: "Campaign setup guide",
    videoId: "campaign",
    videoUrl: "https://www.youtube.com/watch?v=campaign-setup-guide",
    completed: false,
  },
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<OnboardingStep[]>(defaultSteps);
  const totalSteps = steps.length;

  const completeStep = (stepId: number) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  const skipStep = (stepId: number) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  };

  const isStepCompleted = (stepId: number): boolean => {
    return steps.find((step) => step.id === stepId)?.completed || false;
  };

  const isStepAccessible = (stepId: number): boolean => {
    if (stepId <= 0 || stepId > totalSteps) return false;
    return (
      stepId <= currentStep ||
      steps.find((step) => step.id === stepId)?.completed ||
      false
    );
  };

  const canProceed = steps[currentStep - 1]?.completed || false;
  const currentStepData = steps[currentStep - 1];

  const markStepCompleted = (stepId: number) => {
    completeStep(stepId);
  };

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      markStepCompleted(currentStep);
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        steps,
        completeStep,
        skipStep,
        isStepCompleted,
        canProceed,
        currentStepData,
        markStepCompleted,
        goToNextStep,
        goToPreviousStep,
        totalSteps,
        isStepAccessible,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
