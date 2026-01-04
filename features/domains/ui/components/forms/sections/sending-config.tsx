"use client";

import { useFormContext } from "react-hook-form";
import {
    SelectFormField,
} from "@/shared/design-system/components/unified-form-field";
import { WarmupStatus } from "@/types";
import { emailAccountCopy } from "../../copy";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input/input";

interface SendingConfigProps {
    isLoading: boolean;
    isEditing: boolean;
}

export function SendingConfig({ isLoading, isEditing }: SendingConfigProps) {
    const form = useFormContext();
    const copy = emailAccountCopy.form;

    return (
        <div className="space-y-4 p-4 border rounded-md">
            <h3 className="text-lg font-medium">{copy.ui.sendingConfig.title}</h3>
            <p className="text-sm text-muted-foreground">
                {copy.ui.sendingConfig.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Day Limit (Number) */}
                <FormItem>
                    <FormLabel>{copy.labels.dayLimit}</FormLabel>
                    <FormControl>
                        <Input
                            type="number"
                            value={form.watch("dayLimit") || ""}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                form.setValue("dayLimit", isNaN(value) ? null : value);
                            }}
                            disabled={isLoading}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>

                {/* Reputation (Number) */}
                <FormItem>
                    <FormLabel>{copy.labels.reputation}</FormLabel>
                    <FormControl>
                        <Input
                            type="number"
                            min={0}
                            max={100}
                            value={form.watch("reputation") || ""}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                form.setValue("reputation", isNaN(value) ? null : value);
                            }}
                            disabled={!isEditing || isLoading}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>

                <SelectFormField
                    control={form.control}
                    name="warmupStatus"
                    label={copy.labels.warmupStatus}
                    placeholder={copy.placeholders.warmupStatus}
                    disabled={isLoading}
                    options={Object.values(WarmupStatus).map((status) => ({
                        value: status,
                        label: status.charAt(0) + status.slice(1).toLowerCase().replace("_", " "),
                    }))}
                />

                {/* New Warmup Strategy Fields (Number) */}
                <FormItem>
                    <FormLabel>{copy.labels.warmupDailyIncrement}</FormLabel>
                    <FormControl>
                        <Input
                            type="number"
                            placeholder={copy.placeholders.warmupDailyIncrement}
                            value={form.watch("warmupDailyIncrement") || ""}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                form.setValue("warmupDailyIncrement", isNaN(value) ? null : value);
                            }}
                            disabled={isLoading}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>

                <FormItem>
                    <FormLabel>{copy.labels.warmupTargetDailyVolume}</FormLabel>
                    <FormControl>
                        <Input
                            type="number"
                            placeholder={copy.placeholders.warmupTargetDailyVolume}
                            value={form.watch("warmupTargetDailyVolume") || ""}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                form.setValue("warmupTargetDailyVolume", isNaN(value) ? null : value);
                            }}
                            disabled={isLoading}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            </div>
        </div>
    );
}
