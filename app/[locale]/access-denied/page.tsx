"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/lib/config/i18n/navigation";
import { Button } from "@/components/ui/button";
import { ShieldX, Home, LogIn } from "lucide-react";

/**
 * AccessDeniedPage - Shown when user doesn't have permission to access a page
 */
export default function AccessDeniedPage() {
  const t = useTranslations("AccessDenied");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <ShieldX className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {t("title")}
          </h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p>{t("contactMessage")}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              {t("homeButton")}
            </Link>
          </Button>
          <Button asChild>
            <Link href="/login">
              <LogIn className="h-4 w-4 mr-2" />
              {t("loginButton")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
