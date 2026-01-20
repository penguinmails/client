"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { productionLogger } from "@/lib/logger";

// Define the PasswordInput interface locally to avoid upward dependency
interface PasswordInputProps {
  name: string;
  label?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  showStrengthMeter?: boolean;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// Simple PasswordInput component to avoid importing from features
const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ name, label, value, onValueChange, showStrengthMeter = false, required, placeholder, disabled, className }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [strength, setStrength] = React.useState(0);

    const calculateStrength = (password: string) => {
      let score = 0;
      if (password.length >= 8) score += 1;
      if (/[A-Z]/.test(password)) score += 1;
      if (/[a-z]/.test(password)) score += 1;
      if (/[0-9]/.test(password)) score += 1;
      if (/[^A-Za-z0-9]/.test(password)) score += 1;
      return score;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (showStrengthMeter) {
        setStrength(calculateStrength(newValue));
      }
      onValueChange?.(newValue);
    };

    const getStrengthColor = () => {
      if (strength <= 2) return "bg-red-500";
      if (strength <= 3) return "bg-yellow-500";
      return "bg-green-500";
    };

    const getStrengthText = () => {
      if (strength <= 2) return "Weak";
      if (strength <= 3) return "Medium";
      return "Strong";
    };

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={name} className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={name}
            name={name}
            type={showPassword ? "text" : "password"}
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {showStrengthMeter && value && (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn("h-full transition-all duration-300", getStrengthColor())}
                  style={{ width: `${(strength / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{getStrengthText()}</span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export interface PasswordConfirmationProps {
  passwordName?: string;
  confirmPasswordName?: string;
  passwordProps?: Omit<PasswordInputProps, "name" | "value" | "onValueChange">;
  confirmPasswordProps?: Omit<
    PasswordInputProps,
    "name" | "value" | "onValueChange"
  >;
  className?: string;
}

export const PasswordConfirmation = React.forwardRef<
  HTMLDivElement,
  PasswordConfirmationProps
>(
  (
    {
      passwordName = "password",
      confirmPasswordName = "confirmPassword",
      passwordProps,
      confirmPasswordProps,
      className,
    },
    ref,
  ) => {
    const formContext = useFormContext();

    if (!formContext) {
      productionLogger.warn(
        "PasswordConfirmation must be used within a react-hook-form FormProvider",
      );
      return null;
    }

    const { watch } = formContext;
    const passwordValue = watch(passwordName);
    const confirmPasswordValue = watch(confirmPasswordName);

    return (
      <div ref={ref} className={cn("grid grid-cols-1 gap-4", className)}>
        <PasswordInput
          name={passwordName}
          label={passwordProps?.label || "Password"}
          value={passwordValue}
          onValueChange={(value) => formContext.setValue(passwordName, value)}
          showStrengthMeter
          required
          {...passwordProps}
        />

        <PasswordInput
          name={confirmPasswordName}
          label={confirmPasswordProps?.label || "Confirm Password"}
          value={confirmPasswordValue}
          onValueChange={(value) =>
            formContext.setValue(confirmPasswordName, value)
          }
          showStrengthMeter={false}
          required
          {...confirmPasswordProps}
        />
      </div>
    );
  },
);

PasswordConfirmation.displayName = "PasswordConfirmation";

// Utility to validate password confirmation
export const validatePasswordMatch = (
  value: string,
  allFormData: Record<string, unknown>,
  passwordFieldName = "password",
) => {
  const password = allFormData[passwordFieldName];
  if (typeof password !== "string") {
    return "Password is required";
  }
  if (value !== password) {
    return "Passwords do not match";
  }
  return true;
};
