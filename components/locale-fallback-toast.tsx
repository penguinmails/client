"use client";

import { useEffect } from "react";
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

export function LocaleFallbackToast({ requestedLocale }: LocaleFallbackToastProps) {
    const t = useTranslations("Components.LocaleFallbackToast");

    useEffect(() => {
        toast.info(t("title"), {
            description: t("description", { locale: requestedLocale }),
            duration: 5000,
        });
    }, [requestedLocale, t]);

    return null;
}
