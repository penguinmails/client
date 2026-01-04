'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  optional?: boolean;
  icon?: unknown;
  color?: string;
}

interface OnboardingContextType {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  steps: OnboardingStep[];
  completeStep: (stepId: string) => void;
  skipStep: (stepId: string) => void;
  isStepCompleted: (stepId: string) => boolean;
  canProceed: boolean;
  currentStepData?: OnboardingStep;
  markStepCompleted: (stepId: string) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const defaultSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to PenguinMails',
    description: 'Get started with your email marketing journey',
    completed: false
  },
  {
    id: 'domain',
    title: 'Add Your Domain',
    description: 'Set up your sending domain for better deliverability',
    completed: false
  },
  {
    id: 'mailbox',
    title: 'Connect Mailbox',
    description: 'Connect your email account for sending campaigns',
    completed: false
  },
  {
    id: 'template',
    title: 'Create Template',
    description: 'Design your first email template',
    completed: false,
    optional: true
  },
  {
    id: 'campaign',
    title: 'Launch Campaign',
    description: 'Create and send your first campaign',
    completed: false
  }
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<OnboardingStep[]>(defaultSteps);

  const completeStep = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
  };

  const skipStep = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
  };

  const isStepCompleted = (stepId: string): boolean => {
    return steps.find(step => step.id === stepId)?.completed || false;
  };

  const canProceed = steps[currentStep]?.completed || steps[currentStep]?.optional || false;
  const currentStepData = steps[currentStep];

  const markStepCompleted = (stepId: string) => {
    completeStep(stepId);
  };

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <OnboardingContext.Provider value={{
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
      goToPreviousStep
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}