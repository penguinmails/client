"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/custom/password-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupContent } from "./content";
import type { PasswordStrength } from "@/lib/utils";
import { useSignUp } from "@niledatabase/react";
import { toast } from "sonner";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpFormView() {
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] =
    useState<PasswordStrength | null>(null);
  const router = useRouter();
  const { signup } = useAuth();
  const nileSignUp = useSignUp({
  onSuccess: () => {
    toast?.success?.("Account created successfully!");
     router.push("/dashboard");
  },
  onError: (err: any) => {
    const msg = err?.message || "Signup failed. Please try again.";
    setError(msg);
  },
  createTenant: true,
});

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Add loading state for form
  const [isSignUpLoading, setIsSignUpLoading] = useState(false);

  // Handle password strength changes
  const handlePasswordStrengthChange = (strength: PasswordStrength | null) => {
    setPasswordStrength(strength);
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsSignUpLoading(true);

    try {
      // Call centralized signup function
      await signup(data.email, data.password, data.name);
      router.push("/dashboard");
      // Call the mutate function returned by useSignUp directly
      nileSignUp({ email: data.email, password: data.password, name: data.name });
    } catch (err: unknown) {
      console.error("Signup failed:", err);
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        setError((err as { message: string }).message);
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setIsSignUpLoading(false);
    }
  };

  return (
    <>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">{signupContent.form.name.label}</Label>
          <Input
            id="name"
            type="text"
            placeholder={signupContent.form.name.placeholder}
            {...register("name", {
              required: "Name is required",
            })}
            disabled={isSignUpLoading}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">{signupContent.form.email.label}</Label>
          <Input
            id="email"
            type="email"
            placeholder={signupContent.form.email.placeholder}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter a valid email address",
              },
            })}
            disabled={isSignUpLoading}
          />
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <PasswordInput
            label={signupContent.form.password.label}
            placeholder={signupContent.form.password.placeholder}
            showStrengthMeter={true}
            onStrengthChange={handlePasswordStrengthChange}
            value={watch("password")}
            onValueChange={(value) => setValue("password", value)}
            disabled={isSignUpLoading}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
              validate: {
                strength: () => {
                  if (passwordStrength && passwordStrength.score < 2) {
                    return "Password is too weak. Please include at least 2 of: uppercase, lowercase, number, special character";
                  }
                  return true;
                },
              },
            })}
          />
          {errors.password && (
            <p className="text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <PasswordInput
            label={signupContent.form.confirmPassword.label}
            placeholder={signupContent.form.confirmPassword.placeholder}
            value={watch("confirmPassword")}
            onValueChange={(value) => setValue("confirmPassword", value)}
            disabled={isSignUpLoading}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: {
                match: (value: string, { password }: FormData) =>
                  value === password || "Passwords do not match",
              },
            })}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSignUpLoading}>
          {isSignUpLoading ? "Signing up..." : "Create Account"}
        </Button>
      </form>
    </>
  );
}
