import {
  getSchoolHolidayRegionLabel,
  listDutchSchoolHolidays,
  type SchoolHolidayRegion,
} from "@/lib/calendar";

export type SchoolvakantiesInput = {
  schoolYear: string;
  region: SchoolHolidayRegion;
};

export type SchoolvakantiesResult = {
  schoolYear: string;
  region: SchoolHolidayRegion;
  regionLabel: string;
  holidays: Array<{
    name: string;
    kind: "verplicht" | "advies";
    startDate: string;
    endDate: string;
    durationCalendarDays: number;
  }>;
  totalHolidays: number;
  assumptions: {
    sourceLabel: string;
    lastChecked: string;
    status: string;
  };
  warnings: string[];
};

export function calculateSchoolvakanties(
  input: SchoolvakantiesInput,
): SchoolvakantiesResult {
  const holidays = listDutchSchoolHolidays(input);

  return {
    schoolYear: input.schoolYear,
    region: input.region,
    regionLabel: getSchoolHolidayRegionLabel(input.region),
    holidays: holidays.map((holiday) => ({
      name: holiday.name,
      kind: holiday.kind,
      startDate: holiday.formattedStartDate,
      endDate: holiday.formattedEndDate,
      durationCalendarDays: holiday.durationCalendarDays,
    })),
    totalHolidays: holidays.length,
    assumptions: {
      sourceLabel: "Interne NL-schoolvakantiedataset",
      lastChecked: "2026-05-29",
      status: "indicatief",
    },
    warnings: holidays.length === 0
      ? ["Voor dit schooljaar en deze regio zijn geen vakanties beschikbaar."]
      : [],
  };
}
