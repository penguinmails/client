"use client";

import React from "react";
import { UseFormReturn } from "react-hook-form";
import { TextFormField, SelectFormField } from "@/shared/design-system/components";
import { copyText as t } from "../data/copy";
import { CampaignFormValues } from "@features/campaigns/types";

interface MigratedCampaignDetailsFormProps {
  form: UseFormReturn<CampaignFormValues>;
  readOnly?: boolean;
  sendingAccounts: { value: string; label: string }[];
}

/**
 * MigratedCampaignDetailsForm - Campaign details form using Design System UnifiedFormField
 * 
 * Uses TextFormField and SelectFormField from the DS for consistent styling.
 */
export function MigratedCampaignDetailsForm({
  form,
  readOnly = false,
  sendingAccounts,
}: MigratedCampaignDetailsFormProps) {
  return (
    <div className="space-y-4">
      {/* Campaign Name */}
      <TextFormField
        control={form.control}
        name="name"
        label={t.campaignDetails.labels.campaignName}
        placeholder={t.campaignDetails.placeholders.campaignName}
        disabled={readOnly}
        required
      />

      {/* Status (read-only mode only) */}
      {readOnly && (
        <TextFormField
          control={form.control}
          name="status"
          label={t.campaignDetails.labels.status}
          disabled
        />
      )}

      {/* From Name & From Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TextFormField
          control={form.control}
          name="fromName"
          label={t.campaignDetails.labels.fromName}
          placeholder={t.campaignDetails.placeholders.fromName}
          description={t.campaignDetails.descriptions.fromName}
          disabled={readOnly}
        />

        <SelectFormField
          control={form.control}
          name="fromEmail"
          label={t.campaignDetails.labels.fromEmail}
          placeholder={t.campaignDetails.placeholders.selectAccount}
          description={t.campaignDetails.descriptions.fromEmail}
          options={sendingAccounts}
          disabled={readOnly}
        />
      </div>
    </div>
  );
}

export default MigratedCampaignDetailsForm;
