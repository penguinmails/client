"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TextFormField, SelectFormField } from "@/shared/design-system/components";
import { copyText as t } from "../data/copy";
import { ScheduleSettingsProps } from "@features/campaigns/types";

const daysOfWeek = [
  { id: 0, label: t.schedule.days.mon },
  { id: 1, label: t.schedule.days.tue },
  { id: 2, label: t.schedule.days.wed },
  { id: 3, label: t.schedule.days.thu },
  { id: 4, label: t.schedule.days.fri },
  { id: 5, label: t.schedule.days.sat },
  { id: 6, label: t.schedule.days.sun },
];

/**
 * ScheduleSettings - Schedule settings using Design System components
 * 
 * Uses TextFormField and SelectFormField from DS, plus DS Button for day toggles.
 */
export function ScheduleSettings(props: ScheduleSettingsProps) {
  const { control, timezones, selectedSendDays, handleDayChange } = props;

  // Convert timezones to options format
  const timezoneOptions = timezones.map((tz) => ({
    value: tz,
    label: tz,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.schedule.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sending Days Toggle */}
        <div className="space-y-2">
          <Label>{t.schedule.sendingDays}</Label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map((day) => (
              <Button
                key={day.id}
                variant={selectedSendDays.includes(day.id) ? "default" : "outline"}
                size="sm"
                onClick={(evt) => handleDayChange(day.id, evt)}
                className="w-12"
              >
                {day.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextFormField
            control={control}
            name="sendTimeStart"
            label={t.schedule.startTime}
            inputType="text"
            placeholder="09:00"
          />
          <TextFormField
            control={control}
            name="sendTimeEnd"
            label={t.schedule.endTime}
            inputType="text"
            placeholder="17:00"
          />
        </div>

        {/* Timezone Select */}
        <SelectFormField
          control={control}
          name="timezone"
          label={t.schedule.timezone}
          placeholder={t.schedule.selectTimezone}
          options={timezoneOptions}
        />
      </CardContent>
    </Card>
  );
}

export default ScheduleSettings;
