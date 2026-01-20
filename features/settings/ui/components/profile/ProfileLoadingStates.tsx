"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Wifi, WifiOff, Clock, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileLoadingStatesProps {
  isOnline: boolean;
  profileLoading: boolean;
  settingsLoading: boolean;
  isRetryingProfile: boolean;
  retryCount: number;
  maxRetries: number;
  submitLoading: boolean;
}

export default function ProfileLoadingStates({
  isOnline,
  profileLoading,
  settingsLoading,
  isRetryingProfile,
  retryCount,
  maxRetries,
  submitLoading,
}: ProfileLoadingStatesProps) {
  // Show connectivity status
  if (!isOnline) {
    return (
      <Alert variant="destructive" className="mb-6">
        <WifiOff className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center gap-2">
            <span>No internet connection</span>
            <WifiOff className="h-4 w-4" />
          </div>
          <p className="text-sm mt-1">
            Please check your internet connection. Some features may not work properly.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Show profile loading state
  if (profileLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <div className="text-center">
              <p className="font-medium">Loading profile...</p>
              <p className="text-sm text-muted-foreground">
                Fetching your profile information
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show settings loading state
  if (settingsLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <div className="text-center">
              <p className="font-medium">Loading settings...</p>
              <p className="text-sm text-muted-foreground">
                Fetching your preferences
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show retry progress
  if (isRetryingProfile) {
    return (
      <Alert className="mb-6">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <AlertDescription>
          <div className="flex items-center gap-2">
            <span>Retrying to load profile...</span>
            <Clock className="h-4 w-4" />
          </div>
          <p className="text-sm mt-1">
            Attempt {retryCount} of {maxRetries}
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Show submit loading state
  if (submitLoading) {
    return (
      <Alert className="mb-6">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>
          <div className="flex items-center gap-2">
            <span>Saving your changes...</span>
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
          <p className="text-sm mt-1">
            Please wait while we update your profile
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  // Show connection success when online
  if (isOnline && !profileLoading && !settingsLoading && !isRetryingProfile && !submitLoading) {
    return (
      <Alert className="mb-6 border-green-200 bg-green-50">
        <Wifi className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <div className="flex items-center gap-2">
            <span className="text-green-800">Connected</span>
            <Wifi className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-sm text-green-700 mt-1">
            All systems are online and ready
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}