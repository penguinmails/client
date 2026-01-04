"use client";
import { onboardingSteps } from "@/lib/data/onboarding.mock";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { OnboardingStep, OnboardingContextType } from "@/types/onboarding";
import { developmentLogger } from "@/lib/logger";

const EnhancedOnboardingContext = createContext<
  OnboardingContextType | undefined
>(undefined);

function EnhancedOnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState<OnboardingStep[]>(onboardingSteps);

  const totalSteps = steps.length;

  const currentStepData = useMemo(
    () => steps.find((step) => step.id === currentStep) || null,
    [steps, currentStep]
  );

  const markStepCompleted = useCallback((stepId: number) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    );
  }, []);

  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      markStepCompleted(currentStep);
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, totalSteps, markStepCompleted]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const isStepAccessible = useCallback(
    (stepId: number) => {
      if (stepId <= 0 || stepId > totalSteps) return false;
      return (
        stepId <= currentStep ||
        steps.find((step) => step.id === stepId)?.completed ||
        false
      );
    },
    [currentStep, steps, totalSteps]
  );

  const setCurrentStepWithCompletion = useCallback(
    (stepId: number) => {
      developmentLogger.debug("Stepper navigation:", currentStep, "->", stepId);

      // Mark all previous steps as completed when navigating forward via stepper
      if (stepId > currentStep) {
        const stepsToComplete = Array.from(
          { length: stepId - currentStep },
          (_, i) => currentStep + i
        );

        developmentLogger.debug("Auto-completing steps:", stepsToComplete);

        setSteps((prevSteps) =>
          prevSteps.map((step) =>
            stepsToComplete.includes(step.id)
              ? { ...step, completed: true }
              : step
          )
        );
      }

      setCurrentStep(stepId);
    },
    [currentStep, developmentLogger]
  );

  const contextValue = useMemo(
    () => ({
      currentStep,
      totalSteps,
      steps,
      currentStepData,
      setSteps,
      setCurrentStep: setCurrentStepWithCompletion,
      goToNextStep,
      goToPreviousStep,
      markStepCompleted,
      isStepAccessible,
    }),
    [
      currentStep,
      totalSteps,
      steps,
      currentStepData,
      goToNextStep,
      goToPreviousStep,
      markStepCompleted,
      isStepAccessible,
      setCurrentStepWithCompletion,
    ]
  );

  return (
    <EnhancedOnboardingContext.Provider value={contextValue}>
      {children}
    </EnhancedOnboardingContext.Provider>
  );
}

function useEnhancedOnboarding() {
  const context = useContext(EnhancedOnboardingContext);
  if (!context) {
    throw new Error(
      "useEnhancedOnboarding must be used within an EnhancedOnboardingProvider"
    );
  }
  return context;
}

export { EnhancedOnboardingProvider, useEnhancedOnboarding };
