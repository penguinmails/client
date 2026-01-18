"use client";

import { ProfileForm, ProfileErrorBoundary } from "@/features/settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface GeneralSettingsContentProps {
  title: string;
  description: string;
  profileTitle: string;
  profileDescription: string;
}

/**
 * General Settings Content - Client Component
 * Receives translated strings from server component parent.
 */
export default function GeneralSettingsContent({
  title,
  description,
  profileTitle,
  profileDescription,
}: GeneralSettingsContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{profileTitle}</CardTitle>
          <CardDescription>{profileDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileErrorBoundary maxRetries={3}>
            <ProfileForm />
          </ProfileErrorBoundary>
        </CardContent>
      </Card>
    </div>
  );
}
