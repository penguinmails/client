"use client";

import { useAddDomainContext } from "@/context/AddDomainContext";
import { useTranslations } from "next-intl";

export default function NewDomainStepper() {
  const { steps, currentStep } = useAddDomainContext();
  const t = useTranslations("domains.new");

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? step.color + " text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="ml-2">
                <p
                  className={`text-sm font-medium ${
                    isCurrent ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {t(step.title)}
                </p>
                <p className="text-xs text-gray-500">{t(step.subtitle)}</p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-1 mx-2 rounded ${
                    isCompleted ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}