"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw } from "lucide-react";

interface EmailConfirmationViewProps {
  email?: string;
}

export function EmailConfirmationView({ email }: EmailConfirmationViewProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage(null);

    try {
      // Get the user's email from localStorage (set during signup)
      const userEmail = email || localStorage.getItem('pendingVerificationEmail');

      if (!userEmail) {
        setResendMessage("Unable to resend email. Please try signing up again.");
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
          token: 'resend-token', // Backend will generate new token
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResendMessage("A new verification link has been sent to your email.");
      } else {
        setResendMessage(data.error || "Failed to resend verification email. Please try again.");
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      setResendMessage("Failed to resend verification email. Please try again.");
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
        <h2 className="text-xl font-semibold">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          {email
            ? `We've sent a verification link to ${email}`
            : "We've sent a verification link to your email address"
          }
        </p>
        <p className="text-sm text-muted-foreground">
          Click the link in the email to activate your account.
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
          disabled={isResending}
          className="w-full"
        >
          {isResending ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Resend confirmation email
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground">
          Didn&apos;t receive the email? Check your spam folder or{" "}
          <button
            onClick={handleResendEmail}
            disabled={isResending}
            className="text-primary underline hover:no-underline disabled:opacity-50"
          >
            click here to resend
          </button>
        </div>
      </div>
    </div>
  );
}
