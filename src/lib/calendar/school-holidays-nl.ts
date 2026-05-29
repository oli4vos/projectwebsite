import { differenceInCalendarDays, formatDateNl, type IsoWeekday } from "./date-utils";

export type SchoolHolidayRegion = "noord" | "midden" | "zuid";
export type SchoolHolidayKind = "verplicht" | "advies";

export type SchoolHolidayEntry = {
  schoolYear: string;
  region: SchoolHolidayRegion;
  name: string;
  kind: SchoolHolidayKind;
  startDate: Date;
  endDate: Date;
};

export type SchoolHolidayOutput = {
  schoolYear: string;
  region: SchoolHolidayRegion;
  name: string;
  kind: SchoolHolidayKind;
  startDate: Date;
  endDate: Date;
  formattedStartDate: string;
  formattedEndDate: string;
  durationCalendarDays: number;
  startsOnWeekday: IsoWeekday;
};

const REGION_LABELS: Record<SchoolHolidayRegion, string> = {
  noord: "Noord",
  midden: "Midden",
  zuid: "Zuid",
};

function toDate(date: `${number}-${number}-${number}`) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

const HOLIDAY_DATASET: SchoolHolidayEntry[] = [
  {
    schoolYear: "2024-2025",
    region: "noord",
    name: "Meivakantie",
    kind: "advies",
    startDate: toDate("2024-04-27"),
    endDate: toDate("2024-05-05"),
  },
  {
    schoolYear: "2024-2025",
    region: "midden",
    name: "Meivakantie",
    kind: "advies",
    startDate: toDate("2024-04-27"),
    endDate: toDate("2024-05-05"),
  },
  {
    schoolYear: "2024-2025",
    region: "zuid",
    name: "Meivakantie",
    kind: "advies",
    startDate: toDate("2024-04-27"),
    endDate: toDate("2024-05-05"),
  },
  {
    schoolYear: "2024-2025",
    region: "noord",
    name: "Zomervakantie",
    kind: "verplicht",
    startDate: toDate("2024-07-20"),
    endDate: toDate("2024-09-01"),
  },
  {
    schoolYear: "2024-2025",
    region: "midden",
    name: "Zomervakantie",
    kind: "verplicht",
    startDate: toDate("2024-07-13"),
    endDate: toDate("2024-08-25"),
  },
  {
    schoolYear: "2024-2025",
    region: "zuid",
    name: "Zomervakantie",
    kind: "verplicht",
    startDate: toDate("2024-07-06"),
    endDate: toDate("2024-08-18"),
  },
  {
    schoolYear: "2025-2026",
    region: "noord",
    name: "Meivakantie",
    kind: "advies",
    startDate: toDate("2025-04-26"),
    endDate: toDate("2025-05-04"),
  },
  {
    schoolYear: "2025-2026",
    region: "midden",
    name: "Meivakantie",
    kind: "advies",
    startDate: toDate("2025-04-26"),
    endDate: toDate("2025-05-04"),
  },
  {
    schoolYear: "2025-2026",
    region: "zuid",
    name: "Meivakantie",
    kind: "advies",
    startDate: toDate("2025-04-26"),
    endDate: toDate("2025-05-04"),
  },
  {
    schoolYear: "2025-2026",
    region: "noord",
    name: "Zomervakantie",
    kind: "verplicht",
    startDate: toDate("2025-07-12"),
    endDate: toDate("2025-08-24"),
  },
  {
    schoolYear: "2025-2026",
    region: "midden",
    name: "Zomervakantie",
    kind: "verplicht",
    startDate: toDate("2025-07-19"),
    endDate: toDate("2025-08-31"),
  },
  {
    schoolYear: "2025-2026",
    region: "zuid",
    name: "Zomervakantie",
    kind: "verplicht",
    startDate: toDate("2025-07-05"),
    endDate: toDate("2025-08-17"),
  },
  {
    schoolYear: "2026-2027",
    region: "noord",
    name: "Meivakantie",
    kind: "advies",
    startDate: toDate("2026-04-25"),
    endDate: toDate("2026-05-03"),
  },
  {
    schoolYear: "2026-2027",
    region: "midden",
    name: "Meivakantie",
    kind: "advies",
    startDate: toDate("2026-04-25"),
    endDate: toDate("2026-05-03"),
  },
  {
    schoolYear: "2026-2027",
    region: "zuid",
    name: "Meivakantie",
    kind: "advies",
    startDate: toDate("2026-04-25"),
    endDate: toDate("2026-05-03"),
  },
];

export function getSchoolHolidayRegionLabel(region: SchoolHolidayRegion): string {
  return REGION_LABELS[region];
}

export function isValidSchoolYear(value: string): boolean {
  const match = /^(\d{4})-(\d{4})$/.exec(value.trim());
  if (!match) {
    return false;
  }

  const startYear = Number(match[1]);
  const endYear = Number(match[2]);
  return Number.isInteger(startYear) && Number.isInteger(endYear) && endYear === startYear + 1;
}

export function listDutchSchoolHolidays(input: {
  schoolYear: string;
  region: SchoolHolidayRegion;
}): SchoolHolidayOutput[] {
  return HOLIDAY_DATASET.filter(
    (entry) =>
      entry.schoolYear === input.schoolYear &&
      entry.region === input.region,
  )
    .sort((left, right) => left.startDate.getTime() - right.startDate.getTime())
    .map((entry) => ({
      ...entry,
      formattedStartDate: formatDateNl(entry.startDate),
      formattedEndDate: formatDateNl(entry.endDate),
      durationCalendarDays:
        differenceInCalendarDays(entry.startDate, entry.endDate) + 1,
      startsOnWeekday: ((entry.startDate.getUTCDay() || 7) as IsoWeekday),
    }));
}
