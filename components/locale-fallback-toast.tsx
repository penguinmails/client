"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface LocaleFallbackToastProps {
  requestedLocale: string;
}

/**
 * Client component that shows a toast when an invalid locale was requested.
 * Must be rendered inside the provider tree (after Toaster is available).
 */
import { useTranslations } from "next-intl";

// ... existing code ...

export function LocaleFallbackToast({
  requestedLocale,
}: LocaleFallbackToastProps) {
  const t = useTranslations("Components.LocaleFallbackToast");
  const hasToastedRef = useRef(false);

  useEffect(() => {
    if (requestedLocale.trim().length === 0) return;
    if (hasToastedRef.current) return;
    hasToastedRef.current = true;

    toast.info(t("title"), {
      description: t("description", { locale: requestedLocale }),
      duration: 5000,
    });

    document.cookie = "pm_locale_fallback=; Max-Age=0; path=/";
  }, [requestedLocale, t]);

  return null;
}
