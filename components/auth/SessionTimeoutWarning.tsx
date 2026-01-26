"use client";

import { useSessionTimeout } from "@/hooks/auth/use-session-timeout";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";

interface SessionTimeoutWarningProps {
  enabled?: boolean;
}

/**
 * SessionTimeoutWarning - Displays warning when session is about to expire
 * 
 * Shows a full-screen overlay with countdown when user is inactive
 * for too long. User can click to stay logged in.
 */
export function SessionTimeoutWarning({ enabled = true }: SessionTimeoutWarningProps) {
  const t = useTranslations("SessionTimeout");
  const { isWarning, remainingSeconds, resetTimer } = useSessionTimeout({
    enabled,
  });

  if (!isWarning) return null;

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card border rounded-lg shadow-lg p-6 max-w-md w-full mx-4 space-y-4">
        <div className="flex items-center gap-3 text-warning">
          <AlertTriangle className="h-6 w-6 text-yellow-500" />
          <h2 className="text-lg font-semibold">{t("title")}</h2>
        </div>

        <p className="text-muted-foreground">
          {t("message")}
        </p>

        <div className="flex items-center justify-center gap-2 py-4">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <span className="text-3xl font-mono font-bold tabular-nums">
            {timeDisplay}
          </span>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={resetTimer}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("stayLoggedIn")}
          </Button>
        </div>
      </div>
    </div>
  );
}
