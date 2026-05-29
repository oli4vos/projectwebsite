export type IsoWeekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const MS_PER_DAY = 24 * 60 * 60 * 1000;

const WEEKDAY_NAMES_NL: Record<IsoWeekday, string> = {
  1: "maandag",
  2: "dinsdag",
  3: "woensdag",
  4: "donderdag",
  5: "vrijdag",
  6: "zaterdag",
  7: "zondag",
};

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

export function parseIsoDateInput(value: string | undefined | null): Date | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function toIsoDateKey(date: Date): string {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

export function formatDateNl(date: Date): string {
  return `${pad2(date.getUTCDate())}-${pad2(date.getUTCMonth() + 1)}-${date.getUTCFullYear()}`;
}

export function getIsoWeekday(date: Date): IsoWeekday {
  const day = date.getUTCDay();
  return (day === 0 ? 7 : day) as IsoWeekday;
}

export function getWeekdayNameNl(isoWeekday: IsoWeekday): string {
  return WEEKDAY_NAMES_NL[isoWeekday];
}

export function isValidIsoWeekday(value: number): value is IsoWeekday {
  return value >= 1 && value <= 7 && Number.isInteger(value);
}

export function isWeekendIsoWeekday(isoWeekday: IsoWeekday): boolean {
  return isoWeekday === 6 || isoWeekday === 7;
}

export function addCalendarDays(date: Date, days: number): Date {
  const copy = new Date(date.getTime());
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

export function addCalendarMonths(date: Date, months: number): Date {
  const originalDay = date.getUTCDate();
  const firstOfTargetMonth = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1),
  );
  const daysInTargetMonth = new Date(
    Date.UTC(
      firstOfTargetMonth.getUTCFullYear(),
      firstOfTargetMonth.getUTCMonth() + 1,
      0,
    ),
  ).getUTCDate();

  return new Date(
    Date.UTC(
      firstOfTargetMonth.getUTCFullYear(),
      firstOfTargetMonth.getUTCMonth(),
      Math.min(originalDay, daysInTargetMonth),
    ),
  );
}

export function addCalendarYears(date: Date, years: number): Date {
  return addCalendarMonths(date, years * 12);
}

export function differenceInCalendarDays(startDate: Date, endDate: Date): number {
  return Math.round((endDate.getTime() - startDate.getTime()) / MS_PER_DAY);
}

export function getIsoWeekNumber(date: Date): number {
  const shifted = addCalendarDays(date, 4 - getIsoWeekday(date));
  const yearStart = new Date(Date.UTC(shifted.getUTCFullYear(), 0, 1));
  return Math.floor((differenceInCalendarDays(yearStart, shifted) + 1) / 7) + 1;
}

export function getDayOfYear(date: Date): number {
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return differenceInCalendarDays(yearStart, date) + 1;
}

export function isDateRangeWithinYears(
  startDate: Date,
  endDate: Date,
  maxYears: number,
): boolean {
  if (maxYears <= 0 || !Number.isFinite(maxYears)) {
    return false;
  }

  const maxDays = Math.round(maxYears * 366);
  return differenceInCalendarDays(startDate, endDate) <= maxDays;
}

export function enumerateDatesInclusive(startDate: Date, endDate: Date): Date[] {
  const days = differenceInCalendarDays(startDate, endDate);
  const result: Date[] = [];
  for (let index = 0; index <= days; index += 1) {
    result.push(addCalendarDays(startDate, index));
  }
  return result;
}
