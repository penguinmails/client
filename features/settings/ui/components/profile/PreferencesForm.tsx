"use client";

import { useMemo } from "react";
import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
// import { Input } from "@/components/ui/input/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ProfileFormValues } from "@/features/settings";
import { Label } from "@/components/ui/label";
import { useTranslations, useLocale } from "next-intl";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, Loader2 } from "lucide-react";
import { useRouter, usePathname } from "@/lib/config/i18n/navigation";
import { Button } from "@/components/ui/button/button";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PreferencesFormProps {
  control: Control<ProfileFormValues>;
  profileLoading: boolean;
  submitLoading: boolean;
}

export default function PreferencesForm({
  control,
  profileLoading,
  submitLoading,
}: PreferencesFormProps) {
  const t = useTranslations();

  const timezones = useMemo(
    () => [
      { value: "UTC", label: t("Settings.profile.preferences.timezones.UTC") },
      {
        value: "America/New_York",
        label: t("Settings.profile.preferences.timezones.America/New_York"),
      },
      {
        value: "America/Chicago",
        label: t("Settings.profile.preferences.timezones.America/Chicago"),
      },
      {
        value: "America/Denver",
        label: t("Settings.profile.preferences.timezones.America/Denver"),
      },
      {
        value: "America/Los_Angeles",
        label: t("Settings.profile.preferences.timezones.America/Los_Angeles"),
      },
      {
        value: "Europe/London",
        label: t("Settings.profile.preferences.timezones.Europe/London"),
      },
      {
        value: "Europe/Paris",
        label: t("Settings.profile.preferences.timezones.Europe/Paris"),
      },
      {
        value: "Asia/Tokyo",
        label: t("Settings.profile.preferences.timezones.Asia/Tokyo"),
      },
      {
        value: "Asia/Shanghai",
        label: t("Settings.profile.preferences.timezones.Asia/Shanghai"),
      },
      {
        value: "Australia/Sydney",
        label: t("Settings.profile.preferences.timezones.Australia/Sydney"),
      },
    ],
    [t]
  );

  const languages = useMemo(
    () => [
      { value: "en", label: t("Settings.profile.preferences.languages.en") },
      { value: "es", label: t("Settings.profile.preferences.languages.es") },
    ],
    [t]
  );

  const sidebarViews = useMemo(
    () => [
      {
        value: "expanded",
        label: t("Settings.profile.preferences.sidebarView.expanded"),
      },
      {
        value: "collapsed",
        label: t("Settings.profile.preferences.sidebarView.collapsed"),
      },
      {
        value: "hidden",
        label: t("Settings.profile.preferences.sidebarView.hidden"),
      },
    ],
    [t]
  );

  const { theme, setTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();


  const themeOptions = [
    { value: "light", label: t("Settings.profile.preferences.theme.light"), icon: Sun },
    { value: "dark", label: t("Settings.profile.preferences.theme.dark"), icon: Moon },
    { value: "system", label: t("Settings.profile.preferences.theme.system"), icon: Monitor },
  ];

  // Effect to handle initial language/theme from localStorage if not set
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage && savedLanguage !== locale) {
      router.replace(pathname, { locale: savedLanguage });
    } else if (!savedLanguage) {
      const browserLang = typeof navigator !== "undefined" ? navigator.language.split("-")[0] : "en";
      const supportedLocales = ["en", "es"]; // From routing.ts
      const defaultLang = supportedLocales.includes(browserLang) ? browserLang : "en";
      localStorage.setItem("language", defaultLang);
      if (defaultLang !== locale) {
        router.replace(pathname, { locale: defaultLang });
      }
    }

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme);
    }
  }, [locale, pathname, router, setTheme, theme]);

  const handleLanguageChange = (newLocale: string) => {
    localStorage.setItem("language", newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    router.replace(pathname, { locale: newLocale });
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t("Settings.profile.preferences.title")}
          {(profileLoading || submitLoading) && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Timezone */}
        <FormField
          control={control}
          name="timezone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("Settings.profile.preferences.timezone.label")}
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={profileLoading || submitLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "Settings.profile.preferences.timezone.placeholder"
                      )}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {timezones.map((timezone) => (
                    <SelectItem key={timezone.value} value={timezone.value}>
                      {timezone.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />


        {/* Theme Selector */}
        <div className="space-y-2">
          <Label>{t("Settings.profile.preferences.theme.label")}</Label>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  type="button"
                  variant={theme === option.value ? "default" : "outline"}
                  className="justify-start"
                  onClick={() => handleThemeChange(option.value)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Language */}
        <FormField
          control={control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("Settings.profile.preferences.language.label")}
              </FormLabel>
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  handleLanguageChange(val);
                }}
                value={locale}
                disabled={profileLoading || submitLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        "Settings.profile.preferences.language.placeholder"
                      )}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.value} value={language.value}>
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sidebar View */}
        <FormField
          control={control}
          name="sidebarView"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("Settings.profile.preferences.sidebarView.label")}
              </FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={profileLoading || submitLoading}
                  className="flex flex-col space-y-1"
                >
                  {sidebarViews.map((view) => (
                    <div
                      key={view.value}
                      className="flex items-center space-x-2"
                    >
                      <RadioGroupItem value={view.value} id={view.value} />
                      <Label htmlFor={view.value}>{view.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

      </CardContent>
    </Card>
  );
}
