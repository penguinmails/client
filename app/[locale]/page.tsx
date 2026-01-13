"use client";

import React from "react";
import { LandingLayout } from "@/features/marketing/ui/components/LandingLayout";
import { LoginForm } from "@/features/auth/ui/login-form";

export default function LoginPage() {
  return (
    <LandingLayout>
      <LoginForm />
    </LandingLayout>
  );
}

// Force dynamic rendering to prevent SSR issues
export const dynamic = "force-dynamic";
