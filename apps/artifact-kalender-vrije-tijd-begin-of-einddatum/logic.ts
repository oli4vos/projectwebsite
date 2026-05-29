import {
  calculateBoundaryDate,
  type DateBoundaryMode,
  type PeriodComponents,
} from "@/lib/calendar";

export type BeginOfEinddatumInput = {
  knownDate: Date;
  mode: DateBoundaryMode;
  components: PeriodComponents;
};

export type BeginOfEinddatumResult = {
  mode: DateBoundaryMode;
  calculatedDate: string;
  totalCalendarDaysShift: number;
  assumptions: {
    sourceLabel: string;
    lastChecked: string;
    status: string;
  };
  warnings: string[];
};

export function calculateBeginOfEinddatum(
  input: BeginOfEinddatumInput,
): BeginOfEinddatumResult {
  const result = calculateBoundaryDate({
    mode: input.mode,
    knownDate: input.knownDate,
    components: input.components,
  });

  const hasZeroPeriod =
    input.components.years === 0 &&
    input.components.months === 0 &&
    input.components.weeks === 0 &&
    input.components.days === 0;

  return {
    mode: result.direction,
    calculatedDate: result.formattedDate,
    totalCalendarDaysShift: result.totalCalendarDaysShift,
    assumptions: {
      sourceLabel: "Gregoriaanse kalender met maand-einde-correctie",
      lastChecked: "2026-05-29",
      status: "indicatief",
    },
    warnings: hasZeroPeriod
      ? ["Er is geen periode ingevuld; de uitkomst blijft gelijk aan de invoer."]
      : [],
  };
}
