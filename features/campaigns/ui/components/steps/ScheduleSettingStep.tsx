"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import { useAddCampaignContext } from "@features/campaigns/ui/context/add-campaign-context";
import { cn } from "@/lib/utils";
import { allTimezones, calculateMaxEmails } from "@/lib/utils/date";
import { Calendar, Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

enum DayOfWeek {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 0,
}

const daysOfWeek = [
  { value: DayOfWeek.Monday, label: "Mon" },
  { value: DayOfWeek.Tuesday, label: "Tue" },
  { value: DayOfWeek.Wednesday, label: "Wed" },
  { value: DayOfWeek.Thursday, label: "Thu" },
  { value: DayOfWeek.Friday, label: "Fri" },
  { value: DayOfWeek.Saturday, label: "Sat" },
  { value: DayOfWeek.Sunday, label: "Sun" },
] as const;

function ScheduleSettingStep() {
  const { form } = useAddCampaignContext();
  const ref = useRef<HTMLInputElement>(null);
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const selectedDays = watch("sendDays") || [];

  const handleDayToggle = (day: DayOfWeek, checked: boolean) => {
    const currentDays = selectedDays || [];
    if (checked) {
      setValue("sendDays", [...currentDays, day]);
    } else {
      setValue(
        "sendDays",
        currentDays.filter((d) => d !== day)
      );
    }
  };
  const startTime = watch("sendTimeStart") || "09:00";
  const endTime = watch("sendTimeEnd") || "17:00";
  const delayMinutes = 1; // This field doesn't exist in the schema
  const maxEmails = calculateMaxEmails(startTime, endTime, delayMinutes);
  useEffect(() => {
    ref.current?.setAttribute("value", maxEmails.toString());
  }, [maxEmails]);
  const allTimeZones = allTimezones;
  const [openTimezone, setOpenTimezone] = useState(false);
  const timezoneValue = watch("timezone");

  return (
    <Card className="max-w-3xl mx-auto space-y-8">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-pink-100 dark:bg-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="size-8 text-pink-600 dark:text-pink-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Set Sending Schedule
        </h2>
        <p className="text-muted-foreground">
          Configure when and how your emails will be sent
        </p>
        <Alert variant="default" className="bg-blue-100 dark:bg-blue-500/20 ">
          <AlertDescription className="text-blue-800 dark:text-blue-400 text-sm font-medium">
            📝 Changes will apply to next scheduled emails
          </AlertDescription>
        </Alert>
      </CardHeader>

      <CardContent className="space-y-8">
        <div>
          <Label className="text-sm font-medium text-foreground mb-4 block">
            Sending Days
          </Label>
          <div className="grid grid-cols-7 gap-3">
            {daysOfWeek.map((day) => (
              <div
                key={day.value}
                className="flex flex-col items-center space-y-2 p-3 border border-gray-200 dark:border-border rounded-xl hover:bg-gray-50 dark:hover:bg-muted/50"
              >
                <Checkbox
                  id={day.value.toString()}
                  checked={selectedDays.includes(day.value)}
                  onCheckedChange={(checked) =>
                    handleDayToggle(day.value, checked as boolean)
                  }
                />
                <Label
                  htmlFor={day.value.toString()}
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
          {errors.sendDays && (
            <p className="text-red-500 text-sm mt-2">
              {errors.sendDays.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label
              htmlFor="start-time"
              className="text-sm font-medium text-foreground mb-2 block"
            >
              Start Time
            </Label>
            <Input
              {...register("sendTimeStart")}
              id="start-time"
              type="time"
              className="w-full"
            />
            {errors.sendTimeStart && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.sendTimeStart.message}
              </p>
            )}
          </div>
          <div>
            <Label
              htmlFor="end-time"
              className="text-sm font-medium text-foreground mb-2 block"
            >
              End Time
            </Label>
            <Input
              {...register("sendTimeEnd")}
              id="end-time"
              type="time"
              className="w-full"
            />
            {errors.sendTimeEnd && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.sendTimeEnd.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label
              htmlFor="daily-limit"
              className="text-sm font-medium text-foreground mb-2 block"
            >
              Daily Email Limit
            </Label>
            <Input
              {...register("emailsPerDay", {
                valueAsNumber: true,
                max: maxEmails,
              })}
              id="daily-limit"
              type="number"
              className="w-full"
              min="1"
              ref={ref}
              max={maxEmails}
            />
            {errors.emailsPerDay && (
              <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                {errors.emailsPerDay.message}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor="delay"
              className="text-sm font-medium text-foreground mb-2 block"
            >
              Delay Between Emails (minutes)
            </Label>
            <Input
              disabled
              placeholder="1"
              id="delay"
              type="number"
              className="w-full"
              min="0"
            />

          </div>
        </div>
        <Alert>
          <AlertDescription className="text-blue-800 dark:text-blue-400 text-sm font-medium">
            Daily limit cannot exceed {maxEmails} emails based on your time
            range and delay settings.
          </AlertDescription>
        </Alert>
        <div>
          <Label className="text-sm font-medium text-foreground mb-2 block">
            Timezone
          </Label>
          <Popover open={openTimezone} onOpenChange={setOpenTimezone}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openTimezone}
                className="w-full justify-between"
              >
                {timezoneValue
                  ? allTimeZones.find((zone) => zone.value === timezoneValue)
                      ?.label
                  : "Select timezone..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
              <Command>
                <CommandInput placeholder="Search timezone..." />
                <CommandEmpty>No timezone found.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-y-auto">
                  {allTimeZones.map((zone) => (
                    <CommandItem
                      key={zone.value}
                      value={zone.value}
                      onSelect={(currentValue) => {
                        setValue("timezone", currentValue);
                        setOpenTimezone(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          timezoneValue === zone.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {zone.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          {errors.timezone && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">
              {errors.timezone.message}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
export default ScheduleSettingStep;
