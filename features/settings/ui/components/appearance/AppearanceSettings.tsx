"use client";

import { Button } from "@/components/ui/button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SettingsLoadingSkeleton } from "@/components/settings-loading-skeleton";
import { SettingsErrorState } from "@/components/settings-error-state";
import { useSettingsNotifications } from "@/components/settings-success-notification";
import { useClientPreferences } from "@features/settings/ui/context/client-preferences-context";
import { usePreferenceSync } from "@features/settings/lib/hooks/use-preference-sync";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import type { TableDensity } from "@/lib/utils/browser";
import { productionLogger } from "@/lib/logger";


const densityOptions = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious", label: "Spacious" },
];

const AppearanceSettings: React.FC = () => {
  const { preferences, theme, updatePreference, isLoading, error } =
    useClientPreferences();

  const { syncToServer } = usePreferenceSync();
  const { showAppearanceUpdateSuccess } = useSettingsNotifications();

  // Local state for campaign previews and loading states
  const [showCampaignPreviews, setShowCampaignPreviews] = useState(true);
  const [syncLoading, setSyncLoading] = useState(false);

  if (!preferences) {
    return <div>Loading preferences...</div>;
  }


  const handleDensityChange = async (newDensity: string) => {
    setSyncLoading(true);
    try {
      updatePreference?.("tableDensity", newDensity as TableDensity);
      await syncToServer?.();
      showAppearanceUpdateSuccess();
    } catch (error) {
      productionLogger.error("Failed to sync density preference to server", error);
      // Could show error toast here
    } finally {
      setSyncLoading(false);
    }
  };

  const handleCampaignPreviewsChange = async (checked: boolean) => {
    setSyncLoading(true);
    try {
      setShowCampaignPreviews(checked);
      // This could also be stored in localStorage or synced to server
      await syncToServer?.();
      showAppearanceUpdateSuccess();
    } catch (error) {
      productionLogger.error("Failed to sync campaign preview preference", error);
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSidebarToggle = async (checked: boolean) => {
    setSyncLoading(true);
    try {
      updatePreference?.("sidebarCollapsed", !checked);
      await syncToServer?.();
      showAppearanceUpdateSuccess();
    } catch (error) {
      productionLogger.error("Failed to sync sidebar preference", error);
    } finally {
      setSyncLoading(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return <SettingsLoadingSkeleton variant="appearance" />;
  }

  // Show error state
  if (error) {
    return (
      <SettingsErrorState
        error={error}
        errorType="generic"
        variant="card"
        showDetails
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize the appearance of the application. Changes are saved
          automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        <div className="space-y-2">
          <Label>Table Density</Label>
          <div className="grid grid-cols-3 gap-2">
            {densityOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  preferences.tableDensity === option.value
                    ? "default"
                    : "outline"
                }
                className="justify-start"
                onClick={() => handleDensityChange(option.value)}
                disabled={syncLoading}
              >
                {syncLoading && preferences.tableDensity === option.value ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {option.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Adjust the spacing and size of table rows and data displays.
          </p>
        </div>

        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Show Campaign Previews</h4>
              <p className="text-xs text-muted-foreground">
                Show previews when hovering over campaign names
              </p>
            </div>
            <Switch
              checked={showCampaignPreviews}
              onCheckedChange={handleCampaignPreviewsChange}
              disabled={syncLoading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Sidebar Auto-collapse</h4>
              <p className="text-xs text-muted-foreground">
                Automatically collapse sidebar on smaller screens
              </p>
            </div>
            <Switch
              checked={!preferences.sidebarCollapsed}
              onCheckedChange={handleSidebarToggle}
              disabled={syncLoading}
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Current preferences:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-2">
              <li>Theme: {theme}</li>
              <li>
                Sidebar:{" "}
                {preferences.sidebarCollapsed ? "Collapsed" : "Expanded"}
              </li>
              <li>Density: {preferences.tableDensity}</li>
              <li>Language: {preferences.language}</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceSettings;
