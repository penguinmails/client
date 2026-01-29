"use client";

import { useContext } from "react";
import { SessionContext } from "@/features/auth/ui/context/session-context";

/**
 * Hook to access session data.
 * Must be used within a SessionProvider.
 */
export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
};
