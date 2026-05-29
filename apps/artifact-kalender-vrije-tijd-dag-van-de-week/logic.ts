import {
  formatDateNl,
  getDayOfYear,
  getIsoWeekNumber,
  getIsoWeekday,
  getWeekdayNameNl,
} from "@/lib/calendar";

export type DagVanDeWeekInput = {
  date: Date;
};

export type DagVanDeWeekResult = {
  formattedDate: string;
  weekdagNaam: string;
  weekdagNummerISO: number;
  isoWeeknummer: number;
  dagVanHetJaar: number;
  assumptions: {
    sourceLabel: string;
    lastChecked: string;
    status: string;
  };
};

export function calculateDagVanDeWeek(input: DagVanDeWeekInput): DagVanDeWeekResult {
  const isoWeekday = getIsoWeekday(input.date);
  return {
    formattedDate: formatDateNl(input.date),
    weekdagNaam: getWeekdayNameNl(isoWeekday),
    weekdagNummerISO: isoWeekday,
    isoWeeknummer: getIsoWeekNumber(input.date),
    dagVanHetJaar: getDayOfYear(input.date),
    assumptions: {
      sourceLabel: "Gregoriaanse kalender",
      lastChecked: "2026-05-29",
      status: "stabiel",
    },
  };
}
