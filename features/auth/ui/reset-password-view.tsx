"use client";

import React, { useState } from "react";
import { Link } from "@/lib/config/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { AuthTemplate } from "@/features/auth/ui/components/AuthTemplate";
import { useTranslations } from "next-intl";
import { developmentLogger } from "@/lib/logger";

export function ResetPasswordView() {
  const searchParams = useSearchParams();
  const t = useTranslations("ResetPassword");
  // NileDB sends 'identifier' with the email, but also check 'email' for compatibility
  const email = searchParams.get('identifier') || searchParams.get('email');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // If no email/identifier, show error - user needs to request a new link
  if (!email) {
    return (
      <AuthTemplate
        mode="form"
        icon={AlertCircle}
        title={t('error.title')}
        description={t('error.invalidLink')}
        footer={
          <div className="flex flex-col items-center space-y-2">
            <p className="text-xs text-muted-foreground">
              {t('footer.needNewLink')}{' '}
              <Link href="/forgot-password" className="underline font-medium text-primary">
                {t('footer.requestAnother')}
              </Link>
            </p>
          </div>
        }
      />
    );
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    // Client-side validation
    if (formData.newPassword.length < 8) {
      setError(t('error.minLength'));
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('error.passwordMismatch'));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: include cookies
        body: JSON.stringify({
          email,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('error.generic'));
      }

      setIsSubmitted(true);
    } catch (err) {
      developmentLogger.error('Reset password error:', err);
      setError(err instanceof Error ? err.message : t('error.generic'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Show success message
  if (isSubmitted) {
    return (
      <AuthTemplate
        mode="form"
        icon={CheckCircle}
        title={t('success.title')}
        description={t('success.description')}
        footer={
          <div className="flex flex-col items-center space-y-2">
            <Link href="/login">
              <Button data-testid="sign-in-button">{t('success.signIn')}</Button>
            </Link>
          </div>
        }
      />
    );
  }

  return (
    <AuthTemplate
      mode="form"
      icon={KeyRound}
      title={t('header.title')}
      description={`${t('header.description')} ${email}`}
      error={error}
    >
      <form onSubmit={handleSubmit} className="space-y-4" data-testid="reset-password-form">
        <div className="space-y-2">
          <Label htmlFor="newPassword">
            {t('form.newPassword.label')}
          </Label>
          <Input
            id="newPassword"
            type="password"
            placeholder={t('form.newPassword.placeholder')}
            required
            value={formData.newPassword}
            onChange={handleInputChange('newPassword')}
            disabled={isLoading}
            minLength={8}
            data-testid="new-password-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">
            {t('form.confirmPassword.label')}
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder={t('form.confirmPassword.placeholder')}
            required
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            disabled={isLoading}
            minLength={8}
            data-testid="confirm-password-input"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading} data-testid="submit-button">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('button.loading')}
            </>
          ) : (
            t('button.default')
          )}
        </Button>
      </form>
    </AuthTemplate>
  );
}
