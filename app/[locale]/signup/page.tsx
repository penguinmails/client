"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@features/auth/ui/context/auth-context";
import { User } from "lucide-react";
import { LandingLayout } from "@/features/marketing/ui/components/LandingLayout";
import { AuthTemplate } from "@/features/auth/ui/components/AuthTemplate";
import SignUpFormView from "@/features/auth/ui/signup-form";
import { useTranslations } from "next-intl";

export default function SignUpPage() {
  const { user } = useAuth();
  const t = useTranslations("SignUp");

  return (
    <LandingLayout>
      <AuthTemplate
        mode={user ? "loggedIn" : "form"}
        icon={User}
        title={user ? t("header.alreadySignedIn") : t("header.title")}
        description={user ? "" : t("header.description")}
        footer={user ? undefined : (
          <p className="text-xs text-muted-foreground">
            {t("footer.haveAccount")}{" "}
            <Link href="/" className="underline font-medium text-primary">
              {t("footer.login")}
            </Link>
          </p>
        )}
      >
        {user ? undefined : <SignUpFormView />}
      </AuthTemplate>
    </LandingLayout>
  );
}

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
