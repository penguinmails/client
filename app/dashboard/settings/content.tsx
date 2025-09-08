"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsData } from "@/types/settings";
import AccountSettings from "@/components/settings/account/AccountSettings";
import AppearanceSettings from "@/components/settings/appearance/AppearanceSettings";
import NotificationSettings from "@/components/settings/general/NotificationSettings";
import { ComplianceSettings } from "@/components/settings/general/ComplianceSettings";
import BillingSettings from "@/components/settings/billing/BillingSettings";

interface SettingsContentProps {
  settingsData: SettingsData;
}

export function SettingsContent({ settingsData }: SettingsContentProps) {
  const [currentTab, setCurrentTab] = useState("account");

  // Use the mock data passed as props
  const { userProfile, notifications, compliance, billing } = settingsData;

  // You can add state or effects here if needed for client-side interactions
  // For now, we just use the data passed down.

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      </div>
      <Tabs defaultValue={currentTab} className="w-full">
        <TabsList>
          <TabsTrigger value="account" onClick={() => setCurrentTab("account")}>
            Account
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            onClick={() => setCurrentTab("appearance")}
          >
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            onClick={() => setCurrentTab("notifications")}
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="compliance"
            onClick={() => setCurrentTab("compliance")}
          >
            Compliance
          </TabsTrigger>
          <TabsTrigger value="billing" onClick={() => setCurrentTab("billing")}>
            Billing
          </TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="pt-4">
          <AccountSettings userProfile={userProfile} />
        </TabsContent>
        <TabsContent value="appearance" className="pt-4">
          {/* AppearanceSettings now manages its own state through client preferences */}
          <AppearanceSettings />
        </TabsContent>
        <TabsContent value="notifications" className="pt-4">
          {/* Pass relevant mock data to NotificationPage */}
          <NotificationSettings
            email={notifications.email}
            inApp={notifications.inApp}
          />
        </TabsContent>
        <TabsContent value="compliance" className="pt-4">
          {/* Pass relevant mock data to CompliancePage */}
          <ComplianceSettings complianceData={compliance} />
        </TabsContent>
        <TabsContent value="billing" className="pt-4">
          {/* Pass relevant mock data to BillingPage */}
          <BillingSettings billing={billing} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
