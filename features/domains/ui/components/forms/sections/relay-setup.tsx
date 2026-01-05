"use client";

import { useFormContext } from "react-hook-form";
import { FormLabel, FormItem } from "@/components/ui/form";
import {
    SelectFormField,
    TextFormField,
} from "@/shared/design-system/components/unified-form-field";
import { RelayType, VerificationStatus } from "@/types";
import { emailAccountCopy } from "../../copy";

// Helper to display status (could be moved to shared utils/hooks)
const getVerificationStatusText = (statusKey: VerificationStatus | undefined) => {
    const copy = emailAccountCopy.form;
    if (statusKey && copy.enums.verificationStatus[statusKey]) {
        return copy.enums.verificationStatus[statusKey];
    }
    const notConfiguredKey = VerificationStatus.NOT_CONFIGURED;
    if (copy.enums.verificationStatus[notConfiguredKey]) {
        return copy.enums.verificationStatus[notConfiguredKey];
    }
    return "Status Unknown";
};

interface RelaySetupProps {
    isLoading: boolean;
}

export function RelaySetup({ isLoading }: RelaySetupProps) {
    const form = useFormContext();
    const copy = emailAccountCopy.form;

    const watchedRelayType = form.watch("relayType");

    return (
        <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-medium">{copy.ui.relaySetup.title}</h3>
            <p className="text-sm text-muted-foreground">
                {copy.ui.relaySetup.description}
            </p>

            <FormItem className="pt-2">
                <FormLabel>{copy.labels.accountSmtpAuthStatus}</FormLabel>
                <p className="text-sm pt-1">
                    {getVerificationStatusText(form.watch("accountSmtpAuthStatus"))}
                </p>
            </FormItem>

            <SelectFormField
                control={form.control}
                name="relayType"
                label={copy.labels.relayType}
                disabled={isLoading}
                options={Object.values(RelayType).map((type) => ({
                    value: type,
                    label: copy.enums.relayTypes[type] || type,
                }))}
            />

            {watchedRelayType === RelayType.EXTERNAL && (
                <TextFormField
                    control={form.control}
                    name="relayHost"
                    label={copy.labels.relayHost}
                    placeholder={copy.placeholders.relayHost}
                    disabled={isLoading}
                />
            )}
        </div>
    );
}
