"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { copyText as t } from "../data/copy";
import type { RecipientsSettingsProps } from "@features/campaigns/types";

/**
 * RecipientsSettings - Recipients settings using Design System components
 * 
 * Uses DS Button and maintains consistent typography with text-muted-foreground.
 */
export function RecipientsSettings({
  recipients,
  handleChangeRecipients,
}: RecipientsSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.recipients.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t.recipients.description}
        </p>
        
        {/* Upload Button */}
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1">
            <Upload className="h-4 w-4" />
            {t.recipients.uploadCsvButton}
          </Button>
        </div>
        
        {/* Manual Input Textarea */}
        <div className="space-y-2">
          <Label htmlFor="manual-recipients">
            {t.recipients.manualInputLabel}
          </Label>
          <Textarea
            id="manual-recipients"
            placeholder={t.recipients.textareaPlaceholder}
            value={recipients}
            onChange={(evt) => handleChangeRecipients(evt)}
            rows={6}
            className="border-input focus-visible:ring-ring/50"
          />
          <p className="text-xs text-muted-foreground">
            {t.recipients.helpText}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecipientsSettings;
