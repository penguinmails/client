"use client";

import { useAddDomainContext } from "@/context/AddDomainContext";

export default function NewDomainHeaderDetails() {
  const { currentStep, steps } = useAddDomainContext();
  const currentStepData = steps.find((step) => step.number === currentStep);

  return (
    <div className="text-right">
      <p className="text-sm font-medium text-gray-900">
        Step {currentStep} of {steps.length}
      </p>
      <p className="text-sm text-gray-500">{currentStepData?.title}</p>
    </div>
  );
}