"use client";

import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  SettingsLoadingSkeleton,
  SettingsErrorState,
} from "@/components";
import { useState, useCallback } from "react";

// Local ActionResult type to avoid import issues
interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Simple useServerAction implementation
function useServerAction<T = unknown, P = void>(
  action: (params: P) => Promise<ActionResult<T>>,
  options?: { onError?: (error: string) => void }
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (params: P) => {
    setLoading(true);
    setError(null);
    try {
      const result = await action(params);
      if (result.success) {
        setData(result.data || null);
      } else {
        setError(result.error || "Unknown error");
        options?.onError?.(result.error || "Unknown error");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      options?.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [action, options]);

  return { loading, error, data, execute };
}
import { getUserProfile } from "@features/settings/actions/profile";
// Removed mapNileUserToFormData import as we're handling the mapping inline
import PasswordSettingsForm from "../profile/PasswordSettingsForm";

import { ProfileSettingsForm } from "../profile/ProfileSettingsForm";
import { ProfileFormValues } from "@/features/settings/types/user";


interface AccountSettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  userProfile?: ProfileFormValues & { role: string; avatarUrl?: string };
}

// Wrapper to adapt ProfileActionResponse to ActionResult format expected by useServerAction
const getUserProfileAction = async (): Promise<
  ActionResult<unknown>
> => {
  try {
    const result = await getUserProfile();

    if (result.success) {
      return { success: true as const, data: result.data };
    } else {
      return {
        success: false,
        error: "Failed to get user profile",
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export default function AccountSettings({
  userProfile: initialProfile,
  ...props
}: AccountSettingsProps) {
  // Server action for fetching user profile if not provided
  const profileAction = useServerAction(() => getUserProfileAction(), {
    onError: (_error: string) => {
      // Error is already handled by the component's error state
    },
  });

  // Load profile data on mount if not provided
  useEffect(() => {
    if (!initialProfile) {
      profileAction.execute(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProfile]);

  // Show loading state
  if (profileAction.loading && !profileAction.data && !initialProfile) {
    return (
      <div className="grid gap-6" {...props}>
        <SettingsLoadingSkeleton variant="profile" showHeader={false} />
        <SettingsLoadingSkeleton
          variant="form"
          showHeader={false}
          itemCount={3}
        />
      </div>
    );
  }

  // Show error state
  if (profileAction.error && !initialProfile) {
    return (
      <div className="grid gap-6" {...props}>
        <SettingsErrorState
          error={profileAction.error}
          errorType="network"
          onRetry={() => profileAction.execute(undefined)}
          retryLoading={profileAction.loading}
          variant="card"
          showDetails
        />
      </div>
    );
  }

  // Convert NileUser to ProfileFormValues format if needed
  let userProfile: ProfileFormValues | null = null;

  if (initialProfile) {
    userProfile = initialProfile;
  } else if (profileAction.data) {
    // Map profile data to ProfileFormValues format
    const data = profileAction.data as {
      firstName?: string;
      lastName?: string;
      name?: string;
      email?: string;
      avatar?: string;
      avatarUrl?: string;
      role?: string;
      phone?: string;
      bio?: string;
      timezone?: string;
      language?: string;
      sidebarView?: string;
    };
    userProfile = {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      name: data.name || data.email || '', // Use email as fallback if name is empty
      email: data.email || '',
      avatarUrl: data.avatar || data.avatarUrl || undefined,
      username: undefined, // Not available in profile data
      role: data.role || undefined,
      phone: data.phone,
      bio: data.bio,
      avatar: data.avatar,
      timezone: data.timezone || 'UTC',
      language: data.language || 'en',
      sidebarView: data.sidebarView as "collapsed" | "expanded" | undefined,
    };
  }

  if (!userProfile) {
    return (
      <div className="grid gap-6" {...props}>
        <SettingsErrorState
          error="No profile information available"
          errorType="generic"
          variant="card"
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6" {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your personal information and profile settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileSettingsForm userProfile={userProfile} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Change your password or enable two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordSettingsForm />
        </CardContent>
      </Card>
    </div>
  );
}
