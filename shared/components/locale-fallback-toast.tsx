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
export function LocaleFallbackToast({ requestedLocale }: LocaleFallbackToastProps) {
    useEffect(() => {
        toast.info("Language not available", {
            description: `"${requestedLocale}" is not supported. Using English instead.`,
            duration: 5000,
        });
    }, [requestedLocale]);

    return null;
}
