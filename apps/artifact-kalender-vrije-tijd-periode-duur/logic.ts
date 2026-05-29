import { calculatePeriodDuration, formatDateNl } from "@/lib/calendar";

export type PeriodeDuurInput = {
  startDate: Date;
  endDate: Date;
  includeEndDate: boolean;
};

export type PeriodeDuurResult = {
  period: {
    startDate: string;
    endDate: string;
    includeEndDate: boolean;
  };
  totalCalendarDays: number;
  totalWeeks: number;
  remainingDays: number;
  calendarBreakdown: {
    years: number;
    months: number;
    days: number;
  };
  assumptions: {
    sourceLabel: string;
    lastChecked: string;
    status: string;
  };
};

export function calculatePeriodeDuur(input: PeriodeDuurInput): PeriodeDuurResult {
  const duration = calculatePeriodDuration(input);
  return {
    period: {
      startDate: formatDateNl(input.startDate),
      endDate: formatDateNl(input.endDate),
      includeEndDate: input.includeEndDate,
    },
    totalCalendarDays: duration.totalCalendarDays,
    totalWeeks: duration.totalWeeks,
    remainingDays: duration.remainingDays,
    calendarBreakdown: duration.calendarBreakdown,
    assumptions: {
      sourceLabel: "Gregoriaanse kalender",
      lastChecked: "2026-05-29",
      status: "stabiel",
    },
  };
}
