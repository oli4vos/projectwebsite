import { getDutchPublicHolidays } from "@/lib/calendar";

export type FeestdagenInput = {
  year: number;
  includeLiberationDay: boolean;
};

export type FeestdagenResult = {
  year: number;
  holidays: Array<{
    name: string;
    date: string;
    weekday: string;
    type: "vast" | "beweeglijk";
    fallsInWeekend: boolean;
  }>;
  totalHolidays: number;
  totalOnWorkdays: number;
  totalInWeekend: number;
  assumptions: {
    sourceLabel: string;
    lastChecked: string;
    status: string;
  };
  warnings: string[];
};

export function calculateFeestdagen(input: FeestdagenInput): FeestdagenResult {
  const holidays = getDutchPublicHolidays(input.year, {
    includeLiberationDay: input.includeLiberationDay,
  });
  const totalInWeekend = holidays.filter((item) => item.fallsInWeekend).length;

  return {
    year: input.year,
    holidays: holidays.map((holiday) => ({
      name: holiday.name,
      date: holiday.formattedDate,
      weekday: holiday.weekdayName,
      type: holiday.type,
      fallsInWeekend: holiday.fallsInWeekend,
    })),
    totalHolidays: holidays.length,
    totalOnWorkdays: holidays.length - totalInWeekend,
    totalInWeekend,
    assumptions: {
      sourceLabel: "Nederlandse landelijke feestdagen (vast + beweeglijk)",
      lastChecked: "2026-05-29",
      status: "indicatief",
    },
    warnings: [
      "Regionale of cao-specifieke vrije dagen zijn niet opgenomen.",
    ],
  };
}
