"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type DateTimePickerProps = {
  value: string;
  onChange: (isoValue: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

function parseValue(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function toTimeString(date: Date | undefined): string {
  if (!date) return "09:00";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Combined date + time selector. Emits an ISO timestamp so callers can store it
 * directly in a timestamptz column. Built on the shadcn Calendar + a time input.
 */
export function DateTimePicker({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
}: DateTimePickerProps) {
  const locale = useLocale();
  const t = useTranslations("Components.DateTimePicker");
  const [open, setOpen] = useState(false);

  const selectedDate = parseValue(value);
  const timeValue = toTimeString(selectedDate);

  function emit(nextDate: Date) {
    onChange(nextDate.toISOString());
  }

  function handleDaySelect(day: Date | undefined) {
    if (!day) return;
    const base = selectedDate ?? new Date();
    const next = new Date(day);
    next.setHours(base.getHours(), base.getMinutes(), 0, 0);
    emit(next);
  }

  function handleTimeChange(nextTime: string) {
    const [hoursPart, minutesPart] = nextTime.split(":");
    const hours = Number(hoursPart);
    const minutes = Number(minutesPart);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) return;
    const base = selectedDate ?? new Date();
    const next = new Date(base);
    next.setHours(hours, minutes, 0, 0);
    emit(next);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start font-normal",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {selectedDate
            ? selectedDate.toLocaleString(locale, {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : placeholder ?? t("placeholder")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDaySelect}
          autoFocus
        />
        <div className="border-t p-3">
          <Label className="mb-1.5 block text-xs text-muted-foreground">
            {t("time_label")}
          </Label>
          <Input
            type="time"
            value={timeValue}
            onChange={(event) => handleTimeChange(event.target.value)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
