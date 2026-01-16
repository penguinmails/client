"use client";

import React from "react";
import { LandingLayout } from "@/features/marketing/ui/components/LandingLayout";
import { ResetPasswordView } from "@/features/auth/ui/reset-password-view";

export default function ResetPasswordPage() {
  return (
    <LandingLayout>
      <ResetPasswordView />
    </LandingLayout>
  );
}
