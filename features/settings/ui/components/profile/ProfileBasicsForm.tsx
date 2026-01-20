"use client";

import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input/input";
import { ProfileFormValues } from "@/features/settings";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface ProfileBasicsFormProps {
  control: Control<ProfileFormValues>;
  profileLoading: boolean;
  submitLoading: boolean;
}

export default function ProfileBasicsForm({
  control,
  profileLoading,
  submitLoading,
}: ProfileBasicsFormProps) {
  const t = useTranslations();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t("Settings.profile.title")}
          {(profileLoading || submitLoading) && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Settings.profile.firstName.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Settings.profile.firstName.placeholder")}
                    {...field}
                    disabled={profileLoading || submitLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("Settings.profile.lastName.label")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("Settings.profile.lastName.placeholder")}
                    {...field}
                    disabled={profileLoading || submitLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Settings.profile.email.label")}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t("Settings.profile.email.placeholder")}
                  {...field}
                  disabled={profileLoading || submitLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Settings.profile.phone.label")}</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder={t("Settings.profile.phone.placeholder")}
                  {...field}
                  disabled={profileLoading || submitLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("Settings.profile.bio.label")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("Settings.profile.bio.placeholder")}
                  {...field}
                  disabled={profileLoading || submitLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}
