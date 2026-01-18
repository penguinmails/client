"use client";

import React from "react";
import { LandingLayout } from "@/features/marketing/ui/components/LandingLayout";
import { ResetPasswordView } from "@/features/auth/ui/reset-password-view";

export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <LandingLayout>
      <ResetPasswordView />
    </LandingLayout>
  );
}
