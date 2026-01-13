"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { productionLogger } from "@/lib/logger";
import { AuthTemplate } from "@/features/auth/ui/components/AuthTemplate";

interface VerificationResult {
  success: boolean;
  message: string;
  email?: string;
}

export function VerifyEmailView() {
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const t = useTranslations("VerifyEmail");

  const verifyToken = useCallback(async (token: string) => {
    setIsVerifying(true);
    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setVerificationResult({
          success: true,
          message: t("success"),
          email: data.email,
        });
      } else {
        let errorMessage = data.error || t("fail");

        if (data.expired) {
          errorMessage = t("expired");
        } else if (data.used) {
          errorMessage = t("used");
        }

        setVerificationResult({
          success: false,
          message: errorMessage,
          email: data.email,
        });
      }
    } catch (error) {
      productionLogger.error("Verification error:", error);
      setVerificationResult({
        success: false,
        message: t("error"),
      });
    } finally {
      setIsVerifying(false);
    }
  }, [t]);

  useEffect(() => {
    if (!token) {
      setVerificationResult({
        success: false,
        message: t("noToken"),
      });
      setIsVerifying(false);
      return;
    }

    verifyToken(token);
  }, [token, verifyToken]);

  const handleResendEmail = async () => {
    if (!verificationResult?.email) return;

    setIsResending(true);
    try {
      const response = await fetch("/api/emails/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "verification",
          email: verificationResult.email,
          userName: verificationResult.email.split("@")[0],
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(t("resendSuccess"), {
          duration: 4000,
        });
        router.push("/email-confirmation");
      } else {
        toast.error(data.error || t("resendFail"), {
          duration: 4000,
        });
      }
    } catch (error) {
      productionLogger.error("Error resending verification email:", error);
      toast.error(t("resendFail"), {
        duration: 4000,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToLogin = () => {
    router.push("/login");
  };

  const icon = isVerifying
    ? Loader2
    : verificationResult?.success
      ? CheckCircle
      : XCircle;
  const title = isVerifying
    ? t("title")
    : verificationResult?.success
      ? t("titleSuccess")
      : t("titleFail");
  const description = isVerifying
    ? t("description")
    : verificationResult?.success
      ? t("descriptionSuccess")
      : t("descriptionFail");

  return (
    <AuthTemplate
      mode="form"
      icon={icon}
      title={title}
      description={description}
    >
      <div className="space-y-6 text-center">
        {isVerifying ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Status Message */}
            <div
              className={`p-4 rounded-lg ${
                verificationResult?.success
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <p className="text-sm">{verificationResult?.message}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {verificationResult?.success ? (
                <Button onClick={handleGoToLogin} className="w-full">
                  {t("goToLogin")}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleResendEmail}
                    disabled={isResending}
                    variant="outline"
                    className="w-full"
                  >
                    {isResending ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        {t("sending")}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {t("resend")}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleGoToLogin}
                    variant="ghost"
                    className="w-full"
                  >
                    {t("goToLogin")}
                  </Button>
                </>
              )}
            </div>

            {/* Additional Help Text */}
            {!verificationResult?.success && (
              <p className="text-xs text-muted-foreground">{t("support")}</p>
            )}
          </>
        )}
      </div>
    </AuthTemplate>
  );
}
