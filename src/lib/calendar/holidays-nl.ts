import {
  addCalendarDays,
  formatDateNl,
  getIsoWeekday,
  getWeekdayNameNl,
  isWeekendIsoWeekday,
  toIsoDateKey,
  type IsoWeekday,
} from "./date-utils";

export type DutchHolidayType = "vast" | "beweeglijk";

export type DutchHoliday = {
  name: string;
  date: Date;
  dateKey: string;
  formattedDate: string;
  isoWeekday: IsoWeekday;
  weekdayName: string;
  type: DutchHolidayType;
  fallsInWeekend: boolean;
};

function makeHoliday(name: string, date: Date, type: DutchHolidayType): DutchHoliday {
  const isoWeekday = getIsoWeekday(date);
  return {
    name,
    date,
    dateKey: toIsoDateKey(date),
    formattedDate: formatDateNl(date),
    isoWeekday,
    weekdayName: getWeekdayNameNl(isoWeekday),
    type,
    fallsInWeekend: isWeekendIsoWeekday(isoWeekday),
  };
}

export function calculateEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(Date.UTC(year, month - 1, day));
}

export function getDutchPublicHolidays(
  year: number,
  options?: {
    includeLiberationDay?: boolean;
  },
): DutchHoliday[] {
  const includeLiberationDay = options?.includeLiberationDay ?? true;
  const easterSunday = calculateEasterSunday(year);

  const fixedHolidays: Array<{ name: string; date: Date }> = [
    { name: "Nieuwjaarsdag", date: new Date(Date.UTC(year, 0, 1)) },
    {
      name: "Koningsdag",
      date:
        new Date(Date.UTC(year, 3, 27)).getUTCDay() === 0
          ? new Date(Date.UTC(year, 3, 26))
          : new Date(Date.UTC(year, 3, 27)),
    },
    { name: "Eerste kerstdag", date: new Date(Date.UTC(year, 11, 25)) },
    { name: "Tweede kerstdag", date: new Date(Date.UTC(year, 11, 26)) },
  ];

  if (includeLiberationDay) {
    fixedHolidays.push({
      name: "Bevrijdingsdag",
      date: new Date(Date.UTC(year, 4, 5)),
    });
  }

  const movingHolidays: Array<{ name: string; date: Date }> = [
    { name: "Goede Vrijdag", date: addCalendarDays(easterSunday, -2) },
    { name: "Eerste paasdag", date: easterSunday },
    { name: "Tweede paasdag", date: addCalendarDays(easterSunday, 1) },
    { name: "Hemelvaartsdag", date: addCalendarDays(easterSunday, 39) },
    { name: "Eerste pinksterdag", date: addCalendarDays(easterSunday, 49) },
    { name: "Tweede pinksterdag", date: addCalendarDays(easterSunday, 50) },
  ];

  return [
    ...fixedHolidays.map((item) => makeHoliday(item.name, item.date, "vast")),
    ...movingHolidays.map((item) => makeHoliday(item.name, item.date, "beweeglijk")),
  ].sort((left, right) => left.date.getTime() - right.date.getTime());
}

export function getDutchHolidayDateKeySet(
  year: number,
  options?: {
    includeLiberationDay?: boolean;
  },
): Set<string> {
  return new Set(
    getDutchPublicHolidays(year, options).map((holiday) => holiday.dateKey),
  );
}
