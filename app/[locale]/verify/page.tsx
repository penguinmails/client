"use client";

import React from "react";
import { LandingLayout } from "@/features/marketing/ui/components/LandingLayout";
import { VerifyEmailView } from "@/features/auth/ui/verify-email-view";

export default function VerifyEmailPage() {
  return (
    <LandingLayout>
      <VerifyEmailView />
    </LandingLayout>
  );
}

// Force dynamic rendering to prevent SSR issues
export const dynamic = "force-dynamic";
