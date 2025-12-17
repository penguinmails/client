"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/button";
import { PasswordInput } from "@/shared/ui/custom/password-input";
import { Input } from "@/shared/ui/input/input";
import { Label } from "@/shared/ui/label";
import type { PasswordStrength } from "@/shared/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Turnstile } from "next-turnstile";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignUpFormView() {
  const t = useTranslations("Signup");
  const [error, setError] = useState<any>(null);
  const [passwordStrength, setPasswordStrength] =
    useState<PasswordStrength | null>(null);
  const { error: authError } = useAuth();
  const [token, setToken] = useState("");
  const router = useRouter();

  // Loading state for resend verification
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  // Initialize react-hook-form
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
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

  // Handle resend verification email
  const handleResendVerification = async () => {
    // Prevent double-clicks
    if (isResendingVerification) return;

    setIsResendingVerification(true);

    try {
      // Get current email value from form
      const emailValue = watch("email");

      // Validate email before sending
      if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
        toast.error(t("errors.invalidEmail"));
        return;
      }

      const response = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "verification",
          email: emailValue,
        }),
      });

      if (response.ok) {
        toast.success(t("success.accountCreatedNoEmail"));
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.message || t("errors.signupFailed"));
      }
    } catch (err) {
      console.error("Resend error:", err);
      toast.error(t("errors.signupFailed"));
    } finally {
      setIsResendingVerification(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsSignUpLoading(true);

    // This prevents the form from submitting if the CAPTCHA hasn’t been completed.
    if (!token) {
      setError("Please complete the CAPTCHA verification.");
      return;
    }

    try {
      // Verify Turnstile token on your backend
      const verifyRes = await fetch("/api/verify-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!verifyRes.ok) {
        throw new Error("Turnstile verification failed");
      }

      // Proceed with Nile signup only if token is valid
      // Use custom API endpoint that properly handles duplicate email errors
      const signupResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          name: data.name,
        }),
      });

      const signupData = await signupResponse.json();

      // Check if signup failed
      if (!signupResponse.ok) {
        // Create error object with metadata
        const error: any = new Error(signupData.error || "Signup failed");
        if (signupData.code) error.code = signupData.code;
        if (signupData.i18nKey) error.i18nKey = signupData.i18nKey;
        if (signupData.actionType) error.actionType = signupData.actionType;
        throw error;
      }

      // If we reach here, signup was successful
      // Clear Turnstile token after successful use to prevent reuse
      setToken("");

      // Store email for resend functionality
      localStorage.setItem("pendingVerificationEmail", data.email);

      // Send verification email only after successful signup
      let emailSent = false;
      try {
        const response = await fetch("/api/emails/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "verification",
            email: data.email,
            userName: data.name,
            token: "temp-token", // Backend will generate actual token
          }),
        });

        if (response.ok) {
          emailSent = true;
        } else {
          console.warn(
            "Failed to send verification email, but continuing with signup"
          );
        }
      } catch (emailError) {
        console.warn("Error sending verification email:", emailError);
        // Don't fail signup if email sending fails
      }

      // Show success message with appropriate feedback
      const successMessage = emailSent
        ? t("success.accountCreated")
        : t("success.accountCreatedNoEmail");

      // Show success toast notification
      toast.success(successMessage, {
        duration: 4000,
      });

      // Redirect to email confirmation
      router.push("/email-confirmation");
    } catch (err: unknown) {
      console.error("Signup failed:", err);

      // Check if it's a duplicate email error with i18n key
      if (err && typeof err === "object" && "i18nKey" in err) {
        const i18nKey = (err as any).i18nKey;
        // Store the full error object with metadata
        setError(err);

        // Show toast notification
        toast.error(t(`errors.${i18nKey}.title`));
        // Don't send verification email for duplicate emails
        return;
      }

      // Handle other errors
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        setError(err);
        toast.error((err as { message: string }).message);
      } else {
        setError(new Error(t("errors.signupFailed")));
        toast.error(t("errors.signupFailed"));
      }
    } finally {
      setIsSignUpLoading(false);
    }
  };

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  return (
    <>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          {/* Error title based on error type */}
          {error && (error as any).i18nKey && (
            <p className="text-sm font-semibold text-red-800 mb-1">
              {t(`errors.${(error as any).i18nKey}.title`)}
            </p>
          )}

          {/* Error message */}
          <p className="text-sm text-red-600 mb-2">
            {error && (error as any).i18nKey
              ? t(`errors.${(error as any).i18nKey}.message`)
              : typeof error === "string"
                ? error
                : error.message}
          </p>

          {/* Action buttons for verified duplicate email */}
          {error && (error as any).actionType === "LOGIN" && (
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/login")}
                className="text-red-600 border-red-300 hover:bg-red-100"
              >
                {t("errors.emailAlreadyExistsVerified.actionLogin")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/forgot-password")}
                className="text-red-600 border-red-300 hover:bg-red-100"
              >
                {t("errors.emailAlreadyExistsVerified.actionForgotPassword")}
              </Button>
            </div>
          )}

          {/* Action button for unverified duplicate email */}
          {error && (error as any).actionType === "RESEND_VERIFICATION" && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResendVerification}
                disabled={isResendingVerification}
                className="text-red-600 border-red-300 hover:bg-red-100"
              >
                {isResendingVerification
                  ? t("button.sending")
                  : t("errors.emailAlreadyExistsUnverified.actionResend")}
              </Button>
            </div>
          )}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">{t("form.name.label")}</Label>
          <Input
            id="name"
            type="text"
            placeholder={t("form.name.placeholder")}
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
          <Label htmlFor="email">{t("form.email.label")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("form.email.placeholder")}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t("errors.invalidEmail"),
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
          <Controller
            name="password"
            control={control}
            rules={{
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
              validate: {
                strength: () => {
                  if (passwordStrength && passwordStrength.score < 2) {
                    return t("errors.passwordTooWeak");
                  }
                  return true;
                },
              },
            }}
            render={({ field }) => (
              <PasswordInput
                label={t("form.password.label")}
                placeholder={t("form.password.placeholder")}
                showStrengthMeter={true}
                onStrengthChange={handlePasswordStrengthChange}
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSignUpLoading}
                name={field.name}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: "Please confirm your password",
              validate: {
                match: (value: string, { password }: FormData) =>
                  value === password || t("errors.passwordMismatch"),
              },
            }}
            render={({ field }) => (
              <PasswordInput
                label={t("form.confirmPassword.label")}
                placeholder={t("form.confirmPassword.placeholder")}
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSignUpLoading}
                name={field.name}
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              onVerify={(token) => setToken(token)}
            />
          ) : (
            <p className="text-sm text-destructive">
              CAPTCHA is not configured. Please contact support.
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSignUpLoading}>
          {isSignUpLoading
            ? t("button.creatingAccount")
            : t("button.createAccount")}
        </Button>
      </form>
    </>
  );
}
