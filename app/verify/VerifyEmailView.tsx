"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { AuthTemplate } from "@/components/auth/AuthTemplate";

export function VerifyEmailView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'expired'>('verifying');
  const [message, setMessage] = useState<string>('Verifying your email...');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('Your email has been successfully verified!');
          // Redirect to login after successful verification
          setTimeout(() => {
            router.push('/?verified=true');
          }, 3000);
        } else {
          if (data.error?.includes('expired')) {
            setStatus('expired');
            setMessage('This verification link has expired. Please request a new one.');
          } else {
            setStatus('error');
            setMessage(data.error || 'Failed to verify email. The link may be invalid or expired.');
          }
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your email. Please try again.');
      }
    };

    verifyEmail();
  }, [token, router]);

  const handleResendEmail = () => {
    router.push('/email-confirmation');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-600" />;
      case 'error':
      case 'expired':
        return <XCircle className="h-12 w-12 text-red-600" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'verifying':
        return 'Verifying Email';
      case 'success':
        return 'Email Verified!';
      case 'expired':
        return 'Link Expired';
      case 'error':
        return 'Verification Failed';
      default:
        return 'Verify Email';
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'expired':
        return 'Request New Verification Email';
      case 'error':
        return 'Try Again';
      default:
        return 'Go to Login';
    }
  };

  return (
    <LandingLayout>
      <AuthTemplate
        mode="form"
        icon={getStatusIcon}
        title={getTitle()}
        description={message}
      >
        <div className="space-y-6 text-center">
          {status === 'success' && (
            <p className="text-sm text-muted-foreground">
              You will be redirected to the login page in a few seconds...
            </p>
          )}

          {(status === 'error' || status === 'expired') && (
            <div className="space-y-4">
              <Button
                onClick={handleResendEmail}
                className="w-full"
              >
                {getButtonText()}
              </Button>
            </div>
          )}

          {status === 'success' && (
            <Button
              onClick={() => router.push('/')}
              className="w-full"
            >
              Go to Login
            </Button>
          )}
        </div>
      </AuthTemplate>
    </LandingLayout>
  );
}
