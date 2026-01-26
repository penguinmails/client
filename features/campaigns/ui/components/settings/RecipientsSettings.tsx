"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { copyText as t } from "../data/copy";
import type { RecipientsSettingsProps } from "@features/campaigns/types";

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

/**
 * RecipientsSettings - Recipients settings using Design System components
 * 
 * Uses DS Button and maintains consistent typography with text-muted-foreground.
 */
export function RecipientsSettings({
  recipients,
  handleChangeRecipients,
  leadLists = [],
  selectedLeadListId,
  onSelectLeadList,
}: RecipientsSettingsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.recipients.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          {t.recipients.description}
        </p>
        
        {/* Segment Selection */}
        <div className="space-y-2">
          <Label htmlFor="lead-list-select">
            Select Mautic Segment (Optional)
          </Label>
          <Select 
            value={selectedLeadListId?.toString()} 
            onValueChange={onSelectLeadList}
          >
            <SelectTrigger id="lead-list-select">
              <SelectValue placeholder="Choose a segment..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">-- Don&apos;t use a segment --</SelectItem>
              {leadLists.map((list) => (
                <SelectItem key={list.id} value={list.id.toString()}>
                  {list.name} ({list.contacts} contacts)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Selecting a segment will use its contacts for this campaign.
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or manual input
            </span>
          </div>
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
            disabled={!!selectedLeadListId && selectedLeadListId !== 'none'}
          />
          <p className="text-xs text-muted-foreground">
            {t.recipients.helpText}
          </p>
        </div>

        {/* Upload Button */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-1"
            disabled={!!selectedLeadListId && selectedLeadListId !== 'none'}
          >
            <Upload className="h-4 w-4" />
            {t.recipients.uploadCsvButton}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default RecipientsSettings;
