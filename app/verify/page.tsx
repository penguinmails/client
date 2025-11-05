"use client";

import React from "react";
import { VerifyEmailView } from "./VerifyEmailView";

export default function VerifyPage() {
  return <VerifyEmailView />;
}

// Force dynamic rendering to prevent SSR issues
export const dynamic = 'force-dynamic';
