"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { productionLogger } from "@/lib/logger";

interface EmailConfirmationViewProps {
  email?: string;
}

export function EmailConfirmationView({ email }: EmailConfirmationViewProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const t = useTranslations("EmailConfirmation");

  // Set up countdown timer for resend button
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage(null);

    try {
      // Get the user's email from localStorage (set during signup)
      const userEmail = email || localStorage.getItem('pendingVerificationEmail');

      if (!userEmail) {
        setResendMessage(t('errors.unableToResend'));
        setIsResending(false);
        return;
      }

      const response = await fetch('/api/emails/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'verification',
          email: userEmail,
          userName: userEmail.split('@')[0],
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResendMessage(t('success.resendMessage'));
        // Start 60-second countdown for resend button
        setCountdown(60);
      } else {
        setResendMessage(data.error || t('errors.resendFailed'));
      }
    } catch (error) {
      productionLogger.error('Error resending verification email:', error);
      setResendMessage(t('errors.resendFailed'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-blue-100 p-3">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">
          {email
            ? t('description.withEmail', { email })
            : t('description.withoutEmail')
          }
        </p>
        <p className="text-sm text-muted-foreground">
          {t('instructions')}
        </p>
      </div>

      {resendMessage && (
        <div className={`text-sm ${resendMessage.includes('new verification link') ? 'text-green-600' : 'text-red-600'}`}>
          {resendMessage}
        </div>
      )}

      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={handleResendEmail}
          disabled={isResending || countdown > 0}
          className="w-full"
        >
          {isResending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              {t('button.sending')}
            </>
          ) : countdown > 0 ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('button.resendCountdown', { countdown })}
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('button.resendEmail')}
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground">
          {t('help.text')}{" "}
          <button
            onClick={handleResendEmail}
            disabled={isResending || countdown > 0}
            className="text-primary underline hover:no-underline disabled:opacity-50"
          >
            {countdown > 0 ? t('help.link.countdown', { countdown }) : t('help.link.default')}
          </button>
        </div>
      </div>
    </div>
  );
}
