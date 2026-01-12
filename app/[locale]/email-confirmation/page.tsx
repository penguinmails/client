"use client";

import React, { useState, useEffect } from "react";
import { User } from "lucide-react";
import { LandingLayout } from "@/features/marketing/ui/components/LandingLayout";
import { AuthTemplate } from "@/features/auth/ui/components/AuthTemplate";
import { EmailConfirmationView } from "./EmailConfirmationView";
import { useTranslations } from "next-intl";

export default function EmailConfirmationPage() {
  const t = useTranslations("EmailConfirmation");
  const [email, setEmail] = useState<string | undefined>(undefined);

  // Get the user's email from localStorage after hydration to prevent SSR mismatch
  useEffect(() => {
    const storedEmail = localStorage.getItem("pendingVerificationEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  return (
    <LandingLayout>
      <AuthTemplate
        mode="form"
        icon={User}
        title={t("title")}
        description={t("description.withoutEmail")}
      >
        <EmailConfirmationView email={email} />
      </AuthTemplate>
    </LandingLayout>
  );
}

// Force dynamic rendering to prevent SSR issues
export const dynamic = "force-dynamic";
