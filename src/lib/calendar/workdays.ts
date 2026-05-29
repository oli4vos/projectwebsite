import {
  addCalendarDays,
  differenceInCalendarDays,
  formatDateNl,
  getIsoWeekday,
  getWeekdayNameNl,
  isWeekendIsoWeekday,
  toIsoDateKey,
  type IsoWeekday,
} from "./date-utils";
import { getDutchHolidayDateKeySet } from "./holidays-nl";

export type WorkdayPattern = IsoWeekday[];

export type WorkdayBreakdownDay = {
  date: Date;
  dateKey: string;
  formattedDate: string;
  isoWeekday: IsoWeekday;
  weekdayName: string;
  included: boolean;
  reason:
    | "werkdag"
    | "weekend"
    | "feestdag"
    | "niet-geselecteerde-weekdag";
};

export type WorkdayCalculationInput = {
  startDate: Date;
  endDate: Date;
  includeEndDate?: boolean;
  workdayPattern?: WorkdayPattern;
  excludeDutchHolidays?: boolean;
  includeLiberationDay?: boolean;
};

export type WorkdayCalculationResult = {
  totalCalendarDays: number;
  totalWorkdays: number;
  totalWeekendDays: number;
  totalHolidayOnWorkday: number;
  totalExcludedWeekdays: number;
  days: WorkdayBreakdownDay[];
};

const DEFAULT_WORKDAY_PATTERN: WorkdayPattern = [1, 2, 3, 4, 5];

function normalizeWorkdayPattern(pattern?: WorkdayPattern) {
  const source = pattern && pattern.length > 0 ? pattern : DEFAULT_WORKDAY_PATTERN;
  return Array.from(new Set(source)).sort() as WorkdayPattern;
}

export function calculateWorkdays(input: WorkdayCalculationInput): WorkdayCalculationResult {
  const workdayPattern = normalizeWorkdayPattern(input.workdayPattern);
  const includeEndDate = input.includeEndDate ?? true;
  const totalDifferenceDays = differenceInCalendarDays(input.startDate, input.endDate);
  const loopDays = includeEndDate ? totalDifferenceDays + 1 : totalDifferenceDays;
  const holidaysByYear = new Map<number, Set<string>>();
  const days: WorkdayBreakdownDay[] = [];

  let totalWorkdays = 0;
  let totalWeekendDays = 0;
  let totalHolidayOnWorkday = 0;
  let totalExcludedWeekdays = 0;

  for (let dayIndex = 0; dayIndex < loopDays; dayIndex += 1) {
    const currentDate = addCalendarDays(input.startDate, dayIndex);
    const year = currentDate.getUTCFullYear();
    const dateKey = toIsoDateKey(currentDate);
    const isoWeekday = getIsoWeekday(currentDate);
    const isSelectedWorkday = workdayPattern.includes(isoWeekday);
    let isHoliday = false;

    if (input.excludeDutchHolidays) {
      if (!holidaysByYear.has(year)) {
        holidaysByYear.set(
          year,
          getDutchHolidayDateKeySet(year, {
            includeLiberationDay: input.includeLiberationDay,
          }),
        );
      }
      isHoliday = holidaysByYear.get(year)?.has(dateKey) ?? false;
    }

    let included = false;
    let reason: WorkdayBreakdownDay["reason"] = "niet-geselecteerde-weekdag";

    if (!isSelectedWorkday) {
      if (isWeekendIsoWeekday(isoWeekday)) {
        reason = "weekend";
        totalWeekendDays += 1;
      } else {
        reason = "niet-geselecteerde-weekdag";
        totalExcludedWeekdays += 1;
      }
    } else if (isHoliday) {
      reason = "feestdag";
      totalHolidayOnWorkday += 1;
    } else {
      reason = "werkdag";
      included = true;
      totalWorkdays += 1;
    }

    days.push({
      date: currentDate,
      dateKey,
      formattedDate: formatDateNl(currentDate),
      isoWeekday,
      weekdayName: getWeekdayNameNl(isoWeekday),
      included,
      reason,
    });
  }

  return {
    totalCalendarDays: Math.max(loopDays, 0),
    totalWorkdays,
    totalWeekendDays,
    totalHolidayOnWorkday,
    totalExcludedWeekdays,
    days,
  };
}
