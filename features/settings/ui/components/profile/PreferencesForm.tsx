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

interface PreferencesFormProps {
  control: Control<ProfileFormValues>;
  profileLoading: boolean;
  submitLoading: boolean;
}

const timezones = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time" },
  { value: "America/Chicago", label: "Central Time" },
  { value: "America/Denver", label: "Mountain Time" },
  { value: "America/Los_Angeles", label: "Pacific Time" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Shanghai", label: "Shanghai" },
  { value: "Australia/Sydney", label: "Sydney" },
];

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "pt", label: "Português" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "zh", label: "中文" },
];

const sidebarViews = [
  { value: "expanded", label: "Expanded" },
  { value: "collapsed", label: "Collapsed" },
  { value: "hidden", label: "Hidden" },
];

export default function PreferencesForm({
  control,
  profileLoading,
  submitLoading,
}: PreferencesFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Preferences
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
              <FormLabel>Timezone</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={profileLoading || submitLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your timezone" />
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
              <FormLabel>Language</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={profileLoading || submitLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your language" />
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
              <FormLabel>Sidebar View</FormLabel>
              <FormControl>
                <RadioGroup 
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={profileLoading || submitLoading}
                  className="flex flex-col space-y-1"
                >
                  {sidebarViews.map((view) => (
                    <div key={view.value} className="flex items-center space-x-2">
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
          <Label className="text-base font-medium">Notification Preferences</Label>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="email-notifications"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                disabled={profileLoading || submitLoading}
              />
              <Label htmlFor="email-notifications" className="text-sm">
                Email notifications
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
                Push notifications
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
                Marketing emails
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
                Product updates
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}