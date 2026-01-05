"use client"; // Uses client state

import React, { useState } from "react";
import Link from "next/link"; // Import Link
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { KeyRound, MailCheck, User } from "lucide-react";
import { LandingLayout } from "@/features/marketing/ui/components/LandingLayout";
import { AuthTemplate } from "@/features/auth/ui/components/AuthTemplate";
import { useAuth } from "@features/auth/ui/context/auth-context";
import { useTranslations } from "next-intl";
import { productionLogger } from "@/lib/logger";

export default function ForgotPasswordPage() {
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations("ForgotPassword");
  
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { user } = useAuth();

  const handlePasswordResetRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSubmitted(false);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('failedToSend'));
      }

      setIsSubmitted(true);
    } catch (err) {
      productionLogger.error('Forgot password request error:', err);
      setError(
        err instanceof Error
          ? err.message
          : t('failedToSend')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LandingLayout>
      <AuthTemplate
        mode={user ? "loggedIn" : "form"}
        icon={user ? User : KeyRound}
        title={
          user
            ? t('alreadySignedIn')
            : isSubmitted
              ? t('alerts.success.title')
              : t('title')
        }
        description={
          user
            ? ""
            : isSubmitted
              ? ""
              : t('description.initial')
        }
        footer={
          user ? undefined : (
            <div className="flex flex-col items-center space-y-2">
              <p className="text-xs text-muted-foreground">
                {t('footer.text')}{" "}
                <Link href={`/${locale}/`} className="underline font-medium text-primary">
                  {t('footer.linkText')}
                </Link>
              </p>
            </div>
          )
        }
        error={!user && !isSubmitted ? error : undefined}
      >
        {user ? undefined : isSubmitted ? (
          <Alert data-testid="success-alert">
            <MailCheck className="h-4 w-4" />
            <AlertTitle>
              {t('alerts.success.title')}
            </AlertTitle>
            <AlertDescription>
              {t('alerts.success.description', { email })}
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handlePasswordResetRequest} className="space-y-4" data-testid="forgot-password-form">
            <div className="space-y-2">
              <Label htmlFor="email">
                {t('form.email.label')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('form.email.placeholder')}
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                disabled={isLoading}
                data-testid="email-input"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading} data-testid="submit-button">
              {isLoading
                ? t('form.button.sending')
                : t('form.button.send')}
            </Button>
          </form>
        )}
      </AuthTemplate>
    </LandingLayout>
  );
}
