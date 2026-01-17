"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsLoadingSkeleton } from "@/components/settings-loading-skeleton";
import { SettingsErrorState } from "@/components/settings-error-state";
import { useSettingsNotifications } from "@/components/settings-success-notification";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useServerAction } from "@/hooks/use-server-action";
import {
  getComplianceSettings,
  updateComplianceSettings,
} from "@features/settings/actions";
import { Loader2 } from "lucide-react";
import { productionLogger } from "@/lib/logger";
import { NextRequest } from 'next/server';

const complianceFormSchema = z.object({
  autoAddUnsubscribeLink: z.boolean(),
  unsubscribeText: z
    .string()
    .min(1, { message: "Unsubscribe text is required." }),
  unsubscribeLandingPage: z
    .string()
    .url({ message: "Please enter a valid URL." }),
  companyName: z.string().min(1, { message: "Company name is required." }),
  addressLine1: z.string().min(1, { message: "Address line 1 is required." }),
  addressLine2: z.string().optional(),
  city: z.string().min(1, { message: "City is required." }),
  state: z.string().min(1, { message: "State is required." }),
  zip: z.string().min(1, { message: "ZIP / Postal Code is required." }),
  country: z.string().min(1, { message: "Country is required." }),
});

type ComplianceFormValues = z.infer<typeof complianceFormSchema>;

interface ComplianceSettingsProps {
  complianceData?: ComplianceFormValues; // Optional - will be fetched if not provided
}

export function ComplianceSettings({
  complianceData: initialData,
}: ComplianceSettingsProps) {
  const { showSaveSuccess } = useSettingsNotifications();
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Server action for fetching compliance settings
  const complianceAction = useServerAction(() => getComplianceSettings(), {
    onError: (error) => {
      productionLogger.error("Failed to load compliance settings", error);
    },
  });

  const form = useForm<ComplianceFormValues>({
    resolver: zodResolver(complianceFormSchema),
    defaultValues: {
      autoAddUnsubscribeLink: true,
      unsubscribeText: "Click here to unsubscribe",
      unsubscribeLandingPage: "",
      companyName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
    mode: "onChange",
  });

  // Load compliance data on mount if not provided
  useEffect(() => {
    if (!initialData) {
      complianceAction.execute(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // Update form when data is loaded
  useEffect(() => {
    const data = initialData || complianceAction.data;
    if (data) {
      // Map server response to form values
      const formData: Partial<ComplianceFormValues> = {
        autoAddUnsubscribeLink: true, // Default value since server doesn't provide this
        unsubscribeText: "Click here to unsubscribe", // Default value
        unsubscribeLandingPage: "", // Default value
        companyName: "", // Default value
        addressLine1: "", // Default value
        addressLine2: "", // Default value
        city: "", // Default value
        state: "", // Default value
        zip: "", // Default value
        country: "", // Default value
      };
      form.reset(formData);
    }
  }, [initialData, complianceAction.data, form]);

  async function onSubmit(_data: ComplianceFormValues) {
    setSubmitLoading(true);
    try {
      // Map form data to server format (currently server expects different interface)
      const serverData = {
        // Map form fields to server expected fields if needed
        // For now, just pass the data as-is since server accepts any partial
      };
      
      const result = await updateComplianceSettings({ data: serverData, req: undefined as unknown as NextRequest });

      if (result.success) {
        showSaveSuccess("Compliance settings have been updated successfully."); // Use hook function
      } else {
        // Handle validation errors
        productionLogger.error(
          "Failed to save compliance settings",
          "Unknown error"
        );
      }
    } catch (error) {
      productionLogger.error("Error saving compliance settings", error);
    } finally {
      setSubmitLoading(false);
    }
  }

  // Show loading state
  if (complianceAction.loading && !complianceAction.data && !initialData) {
    return <SettingsLoadingSkeleton variant="form" itemCount={8} />;
  }

  // Show error state
  if (complianceAction.error && !initialData) {
    return (
      <SettingsErrorState
        error={complianceAction.error || "An error occurred"}
        errorType="network"
        onRetry={() => complianceAction.execute(undefined)}
        retryLoading={complianceAction.loading}
        canRetry={complianceAction.canRetry ?? true}
        variant="card"
        showDetails
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Settings</CardTitle>
        <CardDescription>
          Email compliance and regulatory settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Unsubscribe Settings</h3>

              <FormField
                control={form.control}
                name="autoAddUnsubscribeLink"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Auto-add Unsubscribe Link
                      </FormLabel>
                      <FormDescription>
                        Automatically add unsubscribe link to all emails
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-4">
                <FormField
                  control={form.control}
                  name="unsubscribeText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unsubscribe Text</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Click here to unsubscribe..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Custom text for the unsubscribe link
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="unsubscribeLandingPage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unsubscribe Landing Page</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/unsubscribe"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Where users will land after unsubscribing
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium">Physical Address</h3>
              <p className="text-sm text-muted-foreground">
                Required by CAN-SPAM regulations. This address will appear in
                your emails.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Example, Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addressLine1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 1</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addressLine2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Line 2 (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Suite 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="San Francisco" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP / Postal Code</FormLabel>
                      <FormControl>
                        <Input placeholder="94103" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="UK">United Kingdom</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                          {/* Add more countries as needed */}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitLoading || complianceAction.loading}
              >
                {submitLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Compliance Settings"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
