"use client";

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
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { ProfileFormValues } from "@/types";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

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

  const timezones = [
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
  ];

  const languages = [
    { value: "en", label: t("Settings.profile.preferences.languages.en") },
    { value: "es", label: t("Settings.profile.preferences.languages.es") },
    { value: "fr", label: t("Settings.profile.preferences.languages.fr") },
    { value: "de", label: t("Settings.profile.preferences.languages.de") },
    { value: "it", label: t("Settings.profile.preferences.languages.it") },
    { value: "pt", label: t("Settings.profile.preferences.languages.pt") },
    { value: "ja", label: t("Settings.profile.preferences.languages.ja") },
    { value: "ko", label: t("Settings.profile.preferences.languages.ko") },
    { value: "zh", label: t("Settings.profile.preferences.languages.zh") },
  ];

  const sidebarViews = [
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
  ];

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
                onValueChange={field.onChange}
                defaultValue={field.value}
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

        {/* Notification Preferences */}
        <div className="space-y-4">
          <Label className="text-base font-medium">
            {t("Settings.profile.preferences.notifications.label")}
          </Label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="email-notifications"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                disabled={profileLoading || submitLoading}
              />
              <Label htmlFor="email-notifications" className="text-sm">
                {t("Settings.profile.preferences.notifications.email")}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="push-notifications"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                disabled={profileLoading || submitLoading}
              />
              <Label htmlFor="push-notifications" className="text-sm">
                {t("Settings.profile.preferences.notifications.push")}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="marketing-emails"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                disabled={profileLoading || submitLoading}
              />
              <Label htmlFor="marketing-emails" className="text-sm">
                {t("Settings.profile.preferences.notifications.marketing")}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="product-updates"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                disabled={profileLoading || submitLoading}
              />
              <Label htmlFor="product-updates" className="text-sm">
                {t("Settings.profile.preferences.notifications.product")}
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}