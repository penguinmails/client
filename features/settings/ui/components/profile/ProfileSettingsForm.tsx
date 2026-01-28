"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button/button";
import { developmentLogger, productionLogger } from "@/lib/logger";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UnifiedFormField } from "@/components/design-system";

import { profileFormSchema, ProfileFormValues, useSettingsNotifications } from "@/features/settings";
import { updateProfile } from "@/features/settings/actions/profile";

export function ProfileSettingsForm({
  userProfile,
}: {
  userProfile: ProfileFormValues;
}) {
  const { showProfileUpdateSuccess } = useSettingsNotifications();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: userProfile,
    mode: "onChange",
  });

  async function onSubmit(data: ProfileFormValues) {
    try {
      const result = await updateProfile(data);
      if (result.success) {
        showProfileUpdateSuccess();
        developmentLogger.debug("Profile updated:", result.data);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      productionLogger.error("Failed to update profile:", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Avatar Field - Custom implementation due to complex UI */}
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Avatar</label>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={form.watch("avatarUrl")} alt="Avatar" />
              <AvatarFallback>
                <span className="text-sm text-muted-foreground">No image</span>
              </AvatarFallback>
              <span className="sr-only">Avatar</span>
            </Avatar>
            <div>
              <Button type="button" variant="outline" size="sm">
                Change Avatar
              </Button>
            </div>
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <UnifiedFormField
            name="firstName"
            control={form.control}
            label="First Name"
            placeholder="Your first name"
            type="text"
            required
          />

          <UnifiedFormField
            name="lastName"
            control={form.control}
            label="Last Name"
            placeholder="Your last name"
            type="text"
            required
          />

          <UnifiedFormField
            name="email"
            control={form.control}
            label="Email"
            placeholder="Your email"
            type="text"
            inputType="email"
            required
          />

          <UnifiedFormField
            name="phone"
            control={form.control}
            label="Phone"
            placeholder="Your phone number"
            type="text"
            inputType="tel"
          />

          <UnifiedFormField
            name="role"
            control={form.control}
            label="Role"
            type="select"
            disabled
            options={[
              { value: "ADMIN", label: "Admin" },
              { value: "MEMBER", label: "Member" },
            ]}
          />

          <UnifiedFormField
            name="timezone"
            control={form.control}
            label="Timezone"
            type="select"
            options={[
              { value: "America/New_York", label: "Eastern Time (ET)" },
              { value: "America/Chicago", label: "Central Time (CT)" },
              { value: "America/Denver", label: "Mountain Time (MT)" },
              { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
              { value: "America/Bogota", label: "Colombia Time (COT)" },
              { value: "Europe/London", label: "London (GMT)" },
              { value: "Europe/Paris", label: "Central Europe (CET)" },
            ]}
          />
        </div>

        {/* Bio Field - Full width */}
        <UnifiedFormField
          name="bio"
          control={form.control}
          label="Bio"
          placeholder="Tell us about yourself"
          type="text"
          description="A short bio about yourself"
        />

        <Button type="submit">Update profile</Button>
      </form>
    </Form>
  );
}
