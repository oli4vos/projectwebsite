import {
  calculateWorkdays,
  formatDateNl,
  type IsoWeekday,
} from "@/lib/calendar";

export type AantalWerkdagenInput = {
  startDate: Date;
  endDate: Date;
  includeEndDate: boolean;
  workdayPattern: IsoWeekday[];
  excludeDutchHolidays: boolean;
  includeLiberationDay: boolean;
};

export type AantalWerkdagenResult = {
  period: {
    startDate: string;
    endDate: string;
    includeEndDate: boolean;
  };
  totalWorkdays: number;
  totalCalendarDays: number;
  totalWeekendDays: number;
  totalHolidayOnWorkday: number;
  totalExcludedWeekdays: number;
  assumptions: {
    sourceLabel: string;
    lastChecked: string;
    status: string;
  };
  warnings: string[];
};

export function calculateAantalWerkdagen(
  input: AantalWerkdagenInput,
): AantalWerkdagenResult {
  const result = calculateWorkdays({
    startDate: input.startDate,
    endDate: input.endDate,
    includeEndDate: input.includeEndDate,
    workdayPattern: input.workdayPattern,
    excludeDutchHolidays: input.excludeDutchHolidays,
    includeLiberationDay: input.includeLiberationDay,
  });

  return {
    period: {
      startDate: formatDateNl(input.startDate),
      endDate: formatDateNl(input.endDate),
      includeEndDate: input.includeEndDate,
    },
    totalWorkdays: result.totalWorkdays,
    totalCalendarDays: result.totalCalendarDays,
    totalWeekendDays: result.totalWeekendDays,
    totalHolidayOnWorkday: result.totalHolidayOnWorkday,
    totalExcludedWeekdays: result.totalExcludedWeekdays,
    assumptions: {
      sourceLabel: "Gregoriaanse kalender + Nederlandse feestdagenmodule",
      lastChecked: "2026-05-29",
      status: "indicatief",
    },
    warnings: [
      "Deze uitkomst is indicatief en bedoeld als planningshulp.",
      "Feestdagen zijn gebaseerd op de Nederlandse landelijke set.",
    ],
  };
}
