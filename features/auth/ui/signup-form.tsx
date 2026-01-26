"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "@/lib/config/i18n/navigation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/features/auth/ui/components";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import type { PasswordStrength } from "@/lib/validation";
import { useAuth } from "@/hooks/auth/use-auth";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Turnstile } from "next-turnstile";
import { verifyTurnstileToken } from "@/features/auth/lib/verify-token";

import { useFeature } from "@/lib/features";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignupError extends Error {
  code?: string;
  i18nKey?: string;
  actionType?: string;
  [key: string]: unknown;
}

export default function SignUpFormView() {
  const t = useTranslations("SignUp");
  const isTurnstileEnabled = useFeature("turnstile");
  const [error, setError] = useState<SignupError | null>(null);
  const [passwordStrength, setPasswordStrength] =
    useState<PasswordStrength | null>(null);
  const { signup, authLoading } = useAuth();
  const [token, setToken] = useState("");
  const router = useRouter();

  // Loading state for resend verification
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  // Initialize react-hook-form
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

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
    } catch {
      toast.error(t("errors.signupFailed"));
    } finally {
      setIsResendingVerification(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setError(null);

    // This prevents the form from submitting if the CAPTCHA hasn't been completed.
    if (isTurnstileEnabled && !token) {
      const captchaError = new Error(
        t("errors.captchaRequired"),
      ) as SignupError;
      setError(captchaError);
      return;
    }

    try {
      // Verify Turnstile token on your backend
      if (isTurnstileEnabled) {
        await verifyTurnstileToken(
          token,
          t("captcha.noToken"),
          t("captcha.verificationFailed"),
        );
      }

      // Use auth context signup which properly handles duplicate email errors
      await signup(data.email, data.password, data.name);

      // Auth context handles success notification and verification email
      // Clear Turnstile token after successful use to prevent reuse
      setToken("");
    } catch (err: unknown) {
      // Show error toast for user feedback
      let displayMessage = t("errors.signupFailed");
      let errorMessage = "";
      let formError: SignupError | null = null;

      if (err && typeof err === "object" && "message" in err) {
        errorMessage = (err as { message: string }).message;

        // Map backend errors to i18n messages
        if (errorMessage.includes("already exists")) {
          displayMessage = t("errors.emailAlreadyExistsVerified.message");
          // Log raw error for debugging in console

          // Create error object with i18n metadata for form display
          formError = new Error(displayMessage) as SignupError;
          formError.i18nKey = "emailAlreadyExistsVerified";
          formError.actionType = "LOGIN";
        } else {
          // Default to generic error message for unmapped errors
          displayMessage = t("errors.signupFailed");

          // Create error object for form display
          formError = new Error(displayMessage) as SignupError;
        }
      }

      toast.error(displayMessage);

      // Set the form error for UI display
      if (formError) {
        setError(formError);
      }

      // Re-throw to trigger error display via auth context
      throw err;
    } finally {
      // Auth context manages its own loading state
    }
  };

  return (
    <>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          {/* Error title based on error type */}
          {error && error.i18nKey && (
            <p className="text-sm font-semibold text-red-800 mb-1">
              {t(`errors.${error.i18nKey}.title`)}
            </p>
          )}

          {/* Error message */}
          <p className="text-sm text-red-600 mb-2">
            {error && error.i18nKey
              ? t(`errors.${error.i18nKey}.message`)
              : error.message}
          </p>

          {/* Action buttons for verified duplicate email */}
          {error && error.actionType === "LOGIN" && (
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/")}
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
          {error && error.actionType === "RESEND_VERIFICATION" && (
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
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        data-testid="signup-form"
      >
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">{t("form.name.label")}</Label>
          <Input
            id="name"
            type="text"
            placeholder={t("form.name.placeholder")}
            {...register("name", {
              required: t("errors.required"),
            })}
            disabled={authLoading.session}
            data-testid="name-input"
          />
          {errors.name && (
            <p className="text-sm text-red-600" data-testid="name-error">
              {errors.name.message}
            </p>
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
              required: t("errors.required"),
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: t("errors.invalidEmail"),
              },
            })}
            disabled={authLoading.session}
            data-testid="email-input"
          />
          {errors.email && (
            <p className="text-sm text-red-600" data-testid="email-error">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Controller
            name="password"
            control={control}
            rules={{
              required: t("errors.required"),
              minLength: {
                value: 8,
                message: t("errors.passwordMinLength"),
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
                disabled={authLoading.session}
                name={field.name}
                onBlur={field.onBlur}
                ref={field.ref}
                data-testid="password-input"
              />
            )}
          />
          {errors.password && (
            <p className="text-sm text-red-600" data-testid="password-error">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Controller
            name="confirmPassword"
            control={control}
            rules={{
              required: t("errors.required"),
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
                disabled={authLoading.session}
                name={field.name}
                onBlur={field.onBlur}
                ref={field.ref}
                data-testid="confirm-password-input"
              />
            )}
          />
          {errors.confirmPassword && (
            <p
              className="text-sm text-red-600"
              data-testid="confirm-password-error"
            >
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          {isTurnstileEnabled &&
            (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
              <Turnstile
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                onVerify={(token) => setToken(token)}
              />
            ) : (
              <p
                className="text-sm text-destructive"
                data-testid="captcha-not-configured-message"
              >
                {t("captcha.notConfigured")}
              </p>
            ))}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={authLoading.session}
          data-testid="create-account-button"
        >
          {authLoading.session
            ? t("button.creatingAccount")
            : t("button.createAccount")}
        </Button>
      </form>
    </>
  );
}
