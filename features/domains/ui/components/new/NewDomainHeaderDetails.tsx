"use client";
import { useAddDomainContext } from "@features/domains/ui/context/add-domain-context";
import { LucideIcon } from "lucide-react";

function NewDomainHeaderDetails() {
  const { currentStepData } = useAddDomainContext();
  const Icon: LucideIcon | undefined = currentStepData?.icon as LucideIcon | undefined;
  return (
    <div className="flex items-center space-x-4">
      <div className="text-right">
        <p className="text-sm font-medium text-gray-900 dark:text-foreground">
          {currentStepData?.title}
        </p>
        <p className="text-sm text-gray-500">{currentStepData?.subtitle}</p>
      </div>
      <div className={`p-3 rounded-xl ${currentStepData?.color}`}>
        {Icon && <Icon className="w-6 h-6 text-white" />}
      </div>
    </div>
  );
}
export default NewDomainHeaderDetails;
