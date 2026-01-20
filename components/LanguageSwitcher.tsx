"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/lib/config/i18n/navigation";
import { Button } from "@/components/ui/button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { routing } from "@/lib/config/i18n/routing";

const localeNames: Record<string, string> = {
  en: "English",
  es: "Español",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Set cookie for better persistence across reloads and sync between public/private
    // Use a function to set the cookie to avoid direct modification
    const setCookie = (name: string, value: string) => {
      document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
    };
    setCookie('NEXT_LOCALE', newLocale);
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1">
          <Globe className="h-4 w-4" />
          <span className="text-xs">{locale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => switchLocale(loc)}
            className={locale === loc ? "bg-accent" : ""}
          >
            {localeNames[loc] || loc}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
