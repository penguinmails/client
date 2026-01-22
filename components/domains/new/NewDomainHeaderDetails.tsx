"use client";

import { useAddDomainContext } from "@/context/AddDomainContext";
import { useTranslations } from "next-intl";

export default function NewDomainHeaderDetails() {
  const { currentStep, steps, currentStepData } = useAddDomainContext();
  const t = useTranslations("domains.new");

  return (
    <div className="text-right">
      <p className="text-sm font-medium text-gray-900">
        Step {currentStep} of {steps.length}
      </p>
      <p className="text-sm text-gray-500">
        {currentStepData ? t(currentStepData.title) : null}
      </p>
    </div>
  );
}