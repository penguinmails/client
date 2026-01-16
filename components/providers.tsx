"use client";

import { ClientPreferencesProvider } from "@features/settings/ui/context/client-preferences-context";
import { SystemHealthProvider } from "@/context/system-health-context";

/**
 * App Providers - DB-dependent logic
 * 
 * These providers depend on database/session state:
 * - SystemHealthProvider - checks NileDB health (now from shared layer)
 * - ClientPreferencesProvider - loads user preferences from DB
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SystemHealthProvider>
      <ClientPreferencesProvider>
        {children}
      </ClientPreferencesProvider>
    </SystemHealthProvider>
  );
}

// Keep old name for backward compatibility during migration
export const Providers = AppProviders;
