"use client";

import { useFormContext } from "react-hook-form";
import {
    TextFormField,
} from "@/components/design-system/unified-form-field";
import { DomainAccountCreationType } from "@/types";
import { emailAccountCopy } from "../../copy";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input/input";

interface MailboxSetupProps {
    isLoading: boolean;
}

export function MailboxSetup({ isLoading }: MailboxSetupProps) {
    const form = useFormContext();
    const copy = emailAccountCopy.form;

    // Watch accountType to conditionally show mailbox fields
    const watchedAccountType = form.watch("accountType");

    return (
        <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-medium">{copy.ui.mailboxSetup.title}</h3>
            <p className="text-sm text-muted-foreground">
                {copy.ui.mailboxSetup.description}
            </p>

            {watchedAccountType === DomainAccountCreationType.VIRTUAL_USER_DB && (
                <div className="pl-2 space-y-3 mt-2">
                    <TextFormField
                        control={form.control}
                        name="virtualMailboxMapping"
                        label={copy.labels.virtualMailboxMapping}
                        placeholder={copy.placeholders.virtualMailboxMapping}
                        disabled={isLoading}
                    />

                    <TextFormField
                        control={form.control}
                        name="mailboxPath"
                        label={copy.labels.mailboxPath}
                        placeholder={copy.placeholders.mailboxPath}
                        disabled={isLoading}
                    />

                    {/* Custom handling for number input since UnifiedFormField treats all text inputs as strings by default 
              unless we want to cast. For direct number binding, we might stick to FormField pattern or improve UnifiedFormField */}
                    {/* Using manual FormField for number input to ensure correct type casting */}
                    <FormItem>
                        <FormLabel>{copy.labels.mailboxQuotaMB}</FormLabel>
                        <FormControl>
                            <Input
                                type="number"
                                placeholder={copy.placeholders.mailboxQuotaMB}
                                value={form.watch("mailboxQuotaMB") || ""}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    form.setValue("mailboxQuotaMB", isNaN(value) ? null : value);
                                }}
                                disabled={isLoading}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                </div>
            )}
        </div>
    );
}
