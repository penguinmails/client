"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button/button";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input/input";
import { toast } from "sonner";
import {
  ACCOUNT_STATUSES,
  DomainAccountCreationType,
  EmailAccountFormProps,
  EmailAccountFormValues,
} from "@/types";
import { emailAccountCopy } from "../copy";
import { EmailProvider } from "../constants";
import {
  SelectFormField,
  TextFormField,
} from "@/shared/design-system/components/unified-form-field";

// Imported Sections
import { PerformanceMetrics } from "./sections/performance-metrics";
import { RelaySetup } from "./sections/relay-setup";
import { MailboxSetup } from "./sections/mailbox-setup";
import { SendingConfig } from "./sections/sending-config";

export default function EmailAccountForm({
  initialData,
  onSubmit,
  isLoading = false,
  isEditing = false,
}: EmailAccountFormProps) {
  const copy = emailAccountCopy.form;

  const form = useForm<EmailAccountFormValues>({
    defaultValues: {
      dayLimit: 200,
      ...initialData,
      provider: initialData?.provider as EmailProvider,
    },
  });

  const handleSubmit = async (values: EmailAccountFormValues) => {
    try {
      await onSubmit(values);
      const notification = isEditing
        ? copy.notifications.success.updated
        : copy.notifications.success.created;
      toast.success(notification.title, {
        description: notification.description,
      });
    } catch (error) {
      toast.error(copy.notifications.error.title, {
        description: copy.notifications.error.description(
          isEditing ? "update" : "create",
          error instanceof Error ? error.message : "Unknown error"
        ),
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <TextFormField
          control={form.control}
          name="email"
          label={copy.labels.email}
          placeholder={copy.placeholders.email}
          disabled={isEditing || isLoading}
        />

        {/* Performance Metrics Section */}
        <PerformanceMetrics />

        <SelectFormField
          control={form.control}
          name="provider"
          label={copy.labels.provider}
          placeholder={copy.placeholders.provider}
          options={Object.values(EmailProvider).map((provider) => ({
            value: provider,
            label: provider,
          }))}
        />

        <SelectFormField
          control={form.control}
          name="status"
          label={copy.labels.status}
          placeholder={copy.placeholders.status}
          options={ACCOUNT_STATUSES.map((status) => ({
            value: status,
            label: status.charAt(0) + status.slice(1).toLowerCase(),
          }))}
        />

        {/* Account Creation & Authentication Section */}
        <div className="space-y-4 p-4 border rounded-md">
          <h3 className="text-lg font-medium">
            {copy.ui.accountCreation?.title ||
              "Account Creation & Authentication"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {copy.ui.accountCreation?.description ||
              "Configure how this account is set up and authenticates."}
          </p>

          <SelectFormField
            control={form.control}
            name="accountType"
            label={copy.labels.accountType}
            placeholder={copy.placeholders.accountType}
            disabled={isLoading}
            options={Object.values(DomainAccountCreationType).map((type) => ({
              value: type,
              label:
                copy.enums?.accountCreationType?.[type] ||
                type.replace("_", " "),
            }))}
          />
        </div>

        {/* Domain Authentication Overview (Read-Only) */}
        {initialData?.domainAuthStatus && (
          <div className="space-y-3 p-4 border rounded-md bg-secondary/10">
            <h3 className="text-lg font-medium">
              {copy.ui.domainAuthOverview?.title ||
                "Domain Authentication Overview"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {copy.ui.domainAuthOverview?.description ||
                "Status of the parent domain's authentication records (read-only)."}
            </p>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <FormItem>
                <FormLabel>SPF</FormLabel>
                <p
                  className={`text-sm font-semibold ${initialData.domainAuthStatus.spfVerified
                    ? "text-green-600"
                    : "text-red-600"
                    }`}
                >
                  {initialData.domainAuthStatus.spfVerified
                    ? "Verified"
                    : "Not Verified/Error"}
                </p>
              </FormItem>
              <FormItem>
                <FormLabel>DKIM</FormLabel>
                <p
                  className={`text-sm font-semibold ${initialData.domainAuthStatus.dkimVerified
                    ? "text-green-600"
                    : "text-red-600"
                    }`}
                >
                  {initialData.domainAuthStatus.dkimVerified
                    ? "Verified"
                    : "Not Verified/Error"}
                </p>
              </FormItem>
              <FormItem>
                <FormLabel>DMARC</FormLabel>
                <p
                  className={`text-sm font-semibold ${initialData.domainAuthStatus.dmarcVerified
                    ? "text-green-600"
                    : "text-red-600"
                    }`}
                >
                  {initialData.domainAuthStatus.dmarcVerified
                    ? "Verified"
                    : "Not Verified/Error"}
                </p>
              </FormItem>
            </div>
          </div>
        )}

        {/* Relay Setup Section */}
        <RelaySetup isLoading={isLoading} />

        {/* Mailbox Setup Section */}
        <MailboxSetup isLoading={isLoading} />

        {/* Sending Configuration Section */}
        <SendingConfig isLoading={isLoading} isEditing={isEditing} />

        {/* Overall Account Setup Status Display */}
        {form.watch("accountSetupStatus") && (
          <div className="p-4 border rounded-md bg-secondary/50">
            <FormItem>
              <FormLabel>{copy.labels.accountSetupStatus}</FormLabel>
              <p className="text-sm pt-1 font-semibold">
                {form.watch("accountSetupStatus")}
              </p>
            </FormItem>
          </div>
        )}

        {/* Account Deliverability Status Display */}
        {form.watch("accountDeliverabilityStatus") && (
          <div className="p-4 border rounded-md bg-secondary/50 mt-4">
            <FormItem>
              <FormLabel>{copy.labels.accountDeliverabilityStatus}</FormLabel>
              <p className="text-sm pt-1 font-semibold">
                {form.watch("accountDeliverabilityStatus")}
              </p>
            </FormItem>
          </div>
        )}

        {!isEditing && (
          <FormItem>
            <FormLabel>{copy.labels.password}</FormLabel>
            <FormControl>
              <Input
                type="password"
                {...form.register("password")}
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isEditing
              ? copy.buttons.submit.update
              : copy.buttons.submit.create}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            {copy.buttons.cancel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
