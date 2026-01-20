"use client";
import { Button } from "@/components/ui/button/button";
import { cn } from "@/lib/utils";
import { Check, LucideIcon } from "lucide-react";
import { Context, useContext } from "react";

interface Step {
  number: number;
  title: string;
  icon?: LucideIcon;
  color?: string;
  completed?: boolean;
}

interface BaseStepperContextType {
  setCurrentStep: (step: number) => void;
  steps: Step[];
  currentStep: number;
}

type StepperContextType<T> = BaseStepperContextType & T;

interface StepperProps<T> {
  context: Context<StepperContextType<T> | null>;
}

function Stepper<T>({ context }: StepperProps<T>) {
  const contextValue = useContext(context);

  if (!contextValue) {
    throw new Error("Stepper must be used within a valid context provider");
  }

  const { setCurrentStep, steps, currentStep } = contextValue;

  if (!setCurrentStep || !steps || typeof currentStep !== "number") {
    throw new Error(
      "setCurrentStep, steps, and currentStep must be properly defined in the context"
    );
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = step.completed || currentStep > step.number;
          const isAccessible = currentStep >= step.number;

          return (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <Button
                  onClick={() => isAccessible && setCurrentStep(step.number)}
                  disabled={!isAccessible}
                  variant="ghost"
                  className={cn(
                    "flex flex-col items-center space-y-2 p-3 h-auto w-auto rounded-lg transition-all hover:bg-background/80",
                    {
                      "bg-background shadow-lg scale-105": isActive,
                      "bg-background shadow-sm hover:shadow-md":
                        isCompleted && !isActive,
                      "bg-muted/50 opacity-50 cursor-not-allowed hover:bg-muted/50":
                        !isAccessible,
                    }
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                      {
                        [step.color || "bg-blue-500"]: isActive,
                        "bg-green-500": isCompleted && !isActive,
                        "bg-muted-foreground/30": !isAccessible,
                      }
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : StepIcon ? (
                      <StepIcon className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white font-semibold">{step.number}</span>
                    )}
                  </div>
                  <div className="text-center min-w-20">
                    <p
                      className={cn("text-xs font-medium", {
                        "text-foreground": isActive,
                        "text-foreground/70": isCompleted && !isActive,
                        "text-muted-foreground": !isAccessible,
                      })}
                    >
                      {step.title}
                    </p>
                    <p
                      className={cn("text-xs", {
                        "text-muted-foreground": isActive,
                        "text-muted-foreground/60": !isActive,
                      })}
                    >
                      Step {step.number} of {steps.length}
                    </p>
                  </div>
                </Button>
              </div>
              {index < steps.length - 1 && (
                <div className="flex items-center px-2">
                  <div
                    className={cn("w-24 h-1 rounded-full transition-colors", {
                      "bg-green-500": isCompleted,
                      "bg-muted": !isCompleted,
                    })}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { Stepper };
export default Stepper;
export type { StepperContextType, Step };
