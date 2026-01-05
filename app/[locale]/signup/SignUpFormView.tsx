"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/features/auth/ui/components";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import type { PasswordStrength } from "@/shared/validation";
import { useAuth } from "@features/auth/ui/context/auth-context";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Turnstile } from "next-turnstile";
import { verifyTurnstileToken } from "./verifyToken";

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
  const [error, setError] = useState<SignupError | null>(null);
  const [passwordStrength, setPasswordStrength] =
    useState<PasswordStrength | null>(null);
  const { error: authError }: { error: Error | null } = useAuth();
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
    } catch {
      toast.error(t("errors.signupFailed"));
    } finally {
      setIsResendingVerification(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setError(null);
    setIsSignUpLoading(true);

    // This prevents the form from submitting if the CAPTCHA hasn't been completed.
    if (!token) {
      const captchaError = new Error(
        t("errors.captchaRequired")
      ) as SignupError;
      setError(captchaError);
      return;
    }

    try {
      // Verify Turnstile token on your backend
      await verifyTurnstileToken(token);

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
        const error = new Error(
          signupData.error || "Signup failed"
        ) as SignupError;
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
          // Failed to send verification email, but continuing with signup
        }
      } catch {
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
      // Check if it's a duplicate email error with i18n key
      if (err && typeof err === "object" && "i18nKey" in err) {
        const errorObj = err as Record<string, unknown>;
        const i18nKey = errorObj.i18nKey as string;
        // Create proper SignupError with metadata
        const duplicateError = new Error(
          t(`errors.${i18nKey}.title`)
        ) as SignupError;
        duplicateError.i18nKey = i18nKey;
        if (errorObj.actionType) {
          duplicateError.actionType = errorObj.actionType as string;
        }
        setError(duplicateError);

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
        const errorObj = new Error(
          (err as { message: string }).message
        ) as SignupError;
        setError(errorObj);
        toast.error((err as { message: string }).message);
      } else {
        const genericError = new Error(t("errors.signupFailed")) as SignupError;
        setError(genericError);
        toast.error(t("errors.signupFailed"));
      }
    } finally {
      setIsSignUpLoading(false);
    }
  };

  useEffect(() => {
    if (authError) {
      const authErrorObj = new Error(authError.message) as SignupError;
      setError(authErrorObj);
    }
  }, [authError]);

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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="signup-form">
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
            disabled={isSignUpLoading}
            data-testid="name-input"
          />
          {errors.name && (
            <p className="text-sm text-red-600" data-testid="name-error">{errors.name.message}</p>
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
            disabled={isSignUpLoading}
            data-testid="email-input"
          />
          {errors.email && (
            <p className="text-sm text-red-600" data-testid="email-error">{errors.email.message}</p>
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
                disabled={isSignUpLoading}
                name={field.name}
                onBlur={field.onBlur}
                ref={field.ref}
                data-testid="password-input"
              />
            )}
          />
          {errors.password && (
            <p className="text-sm text-red-600" data-testid="password-error">{errors.password.message}</p>
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
                disabled={isSignUpLoading}
                name={field.name}
                onBlur={field.onBlur}
                ref={field.ref}
                data-testid="confirm-password-input"
              />
            )}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600" data-testid="confirm-password-error">
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
            <p className="text-sm text-destructive" data-testid="captcha-not-configured-message">
              {t("captcha.notConfigured")}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSignUpLoading} data-testid="create-account-button">
          {isSignUpLoading
            ? t("button.creatingAccount")
            : t("button.createAccount")}
        </Button>
      </form>
    </>
  );
}
