"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button/button";
import { PasswordInput } from "@/features/auth/ui/components";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import { LogIn, User } from "lucide-react";
import { LandingLayout } from "@/features/marketing/ui/components/LandingLayout";
import { useAuth } from "@features/auth/ui/context/auth-context";
import { AuthTemplate } from "@/features/auth/ui/components/AuthTemplate";
import { Turnstile } from "next-turnstile";
import { verifyTurnstileToken } from "./signup/verifyToken";
import { useTranslations } from "next-intl";
import { initPostHog, ph } from "@/lib/posthog";
import { getLoginAttemptStatus } from "@/features/auth/lib/rate-limit";
import { productionLogger } from "@/lib/logger";

const MAX_LOGIN_ATTEMPTS = parseInt(
  process.env.NEXT_PUBLIC_MAX_LOGIN_ATTEMPTS || "3",
  10
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lastLoginError, setLastLoginError] = useState<string | null>(null);
  const { login, user, error: authError } = useAuth();
  const t = useTranslations("Login");

  useEffect(() => {
    initPostHog().then((client) => {
      client.capture("login_page_loaded");
    });
  }, []);

  // Handle input changes to clear errors
  const handleInputChange = useCallback(
    (setter: (value: string) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setter(e.target.value);
        if (lastLoginError) {
          setLastLoginError(null);
        }
        if (error) {
          setError(null);
        }
      },
    [lastLoginError, error]
  );

  // Handle password input changes to clear errors
  const handlePasswordChange = useCallback(
    (value: string) => {
      setPassword(value);
      if (lastLoginError) {
        setLastLoginError(null);
      }
      if (error) {
        setError(null);
      }
    },
    [lastLoginError, error]
  );

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (email?.includes("@")) {
      const status = getLoginAttemptStatus(email);
      if (status.attempts > 0) {
        setLoginAttempts(status.attempts);
        setShowTurnstile(status.requiresTurnstile);
      }
    }

    if (showTurnstile && !turnstileToken) {
      setError(t("errors.captchaRequired"));
      setIsLoading(false);
      return;
    }

    try {
      if (showTurnstile && turnstileToken) {
        await verifyTurnstileToken(
          turnstileToken,
          t("errors.captchaRequired"),
          t("errors.verificationFailed")
        );
        ph().capture("captcha_completed", { email });
      }

      // Login attempt
      await login(email, password);
      ph().capture("login_attempt", { email, success: true });

      // Navigation is handled by the auth context when session is ready
    } catch (err) {
      productionLogger.error("Login failed", err);
      const errorMessage = (err as Error)?.message || t("errors.generic");
      setError(errorMessage);
      setLastLoginError(errorMessage); // Track login error to prevent navigation

      // Clear error tracking after a delay to allow retry
      setTimeout(() => setLastLoginError(null), 3000);

      // Log failed login attempt
      ph().capture("login_attempt", {
        email,
        success: false,
        error: "Login failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed duplicate navigation logic - auth context handles navigation
  // This prevents race conditions and duplicate navigation attempts

  useEffect(() => {
    if (authError) {
      setError(authError.message);
      if (email && email.includes("@")) {
        const status = getLoginAttemptStatus(email);
        setLoginAttempts(status.attempts || 0);
        setShowTurnstile(status.requiresTurnstile);
      }
    } else {
      setError(null);
    }
  }, [authError, email]);

  const icon = user ? User : LogIn;
  const mode = user ? "loggedIn" : "form";

  const footer = user ? undefined : (
    <div className="flex flex-col items-center space-y-2">
      <p className="text-xs text-muted-foreground">
        {t("signup.text")}{" "}
        <Link href="/signup" className="underline font-medium text-primary">
          {t("signup.link")}
        </Link>
      </p>
    </div>
  );

  return (
    <LandingLayout>
      <AuthTemplate
        mode={mode}
        icon={icon}
        title={t("title")}
        description={t("description")}
        footer={footer}
        error={mode === "form" ? error : undefined}
      >
        {user ? undefined : (
          <form
            onSubmit={handleLogin}
            className="space-y-4"
            data-testid="login-form"
          >
            <div className="space-y-2">
              <Label htmlFor="email">{t("email.label")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("email.placeholder")}
                required
                value={email}
                onChange={handleInputChange(setEmail)}
                disabled={isLoading}
                data-testid="email-input"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("password.label")}</Label>
              </div>
              <PasswordInput
                name="password"
                placeholder=""
                value={password}
                onValueChange={handlePasswordChange}
                disabled={isLoading}
                required
                data-testid="password-input"
              />
            </div>

            {loginAttempts > 0 && (
              <div
                className={`px-3 py-2 rounded-md text-sm ${
                  loginAttempts >= MAX_LOGIN_ATTEMPTS
                    ? "bg-red-50 border border-red-200 text-red-800"
                    : "bg-yellow-50 border border-yellow-200 text-yellow-800"
                }`}
                data-testid="failed-attempts-message"
              >
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline underline-offset-4"
                >
                  {t("forgotPassword")} -
                  {t("failedAttempts", {
                    loginAttempts,
                    MAX_LOGIN_ATTEMPTS,
                  })}
                </Link>
              </div>
            )}

            {showTurnstile && (
              <div className="space-y-3" data-testid="turnstile-section">
                <div className="bg-orange-50 border border-orange-200 text-orange-800 px-3 py-2 rounded-md text-sm">
                  {t("securityVerification")}
                </div>
                <div className="flex justify-center py-2">
                  {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
                    <Turnstile
                      key={`turnstile-${loginAttempts}`}
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                      onVerify={(token: string) => setTurnstileToken(token)}
                    />
                  ) : (
                    <p
                      className="text-sm text-destructive"
                      data-testid="captcha-not-configured-message"
                    >
                      {t("captchaNotConfigured")}
                    </p>
                  )}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={
                isLoading ||
                !email ||
                !email.includes("@") ||
                (showTurnstile && !turnstileToken)
              }
              data-testid="login-button"
            >
              {isLoading
                ? t("loginButton.loading")
                : loginAttempts >= MAX_LOGIN_ATTEMPTS && !turnstileToken
                  ? t("loginButton.tooManyAttempts")
                  : showTurnstile && !turnstileToken
                    ? t("loginButton.completeVerification")
                    : t("loginButton.default")}
            </Button>
          </form>
        )}
      </AuthTemplate>
    </LandingLayout>
  );
}

// Force dynamic rendering to prevent SSR issues
export const dynamic = "force-dynamic";
