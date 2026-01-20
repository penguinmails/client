"use client";

import React from "react";
import { LandingLayout } from "@/features/marketing/ui/components/LandingLayout";
import { ForgotPasswordView } from "@/features/auth/ui/forgot-password-view";

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  return (
    <LandingLayout>
      <ForgotPasswordView />
    </LandingLayout>
  );
}
