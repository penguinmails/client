"use client";

import React from "react";
import { User } from "lucide-react";
import { LandingLayout } from "@/features/marketing/ui/components/LandingLayout";
import { AuthTemplate } from "@/features/auth/ui/components/AuthTemplate";
import { EmailConfirmationView } from "./EmailConfirmationView";
import { useTranslations } from "next-intl";

export default function EmailConfirmationPage() {
  const t = useTranslations("EmailConfirmation");
  
  // Get the user's email from localStorage (set during signup)
  const email = typeof window !== 'undefined' ? localStorage.getItem('pendingVerificationEmail') || undefined : undefined;

  return (
    <LandingLayout>
      <AuthTemplate
        mode="form"
        icon={User}
        title={t('title')}
        description={t('description.withoutEmail')}
      >
        <EmailConfirmationView email={email} />
      </AuthTemplate>
    </LandingLayout>
  );
}

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
