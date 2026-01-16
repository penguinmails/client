"use client";

import React from "react";
import { SessionProvider as AppSessionProvider } from "./session-context";
import { UserEnrichmentProvider } from "./enrichment-context";
import { SessionProvider as NileSessionProvider } from "@niledatabase/react";

/**
 * Auth Context - Composition Layer
 *
 * This module composes SessionProvider + UserEnrichmentProvider.
 */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <NileSessionProvider>
      <AppSessionProvider>
        <UserEnrichmentProvider>
          {children}
        </UserEnrichmentProvider>
      </AppSessionProvider>
    </NileSessionProvider>
  );
};
