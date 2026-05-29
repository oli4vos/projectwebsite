import {
  calculateNearestWeekday,
  type IsoWeekday,
  type NearestWeekdayDirection,
} from "@/lib/calendar";

export type EerstvolgendeOfVorigeWeekdagInput = {
  startDate: Date;
  targetWeekday: IsoWeekday;
  direction: NearestWeekdayDirection;
  includeToday: boolean;
};

export type EerstvolgendeOfVorigeWeekdagResult = {
  calculatedDate: string;
  targetWeekdayName: string;
  dayDifference: number;
  includesStartDate: boolean;
  direction: NearestWeekdayDirection;
  assumptions: {
    sourceLabel: string;
    lastChecked: string;
    status: string;
  };
};

export function calculateEerstvolgendeOfVorigeWeekdag(
  input: EerstvolgendeOfVorigeWeekdagInput,
): EerstvolgendeOfVorigeWeekdagResult {
  const result = calculateNearestWeekday(input);

  return {
    calculatedDate: result.formattedDate,
    targetWeekdayName: result.targetWeekdayName,
    dayDifference: result.dayDifference,
    includesStartDate: result.includesStartDate,
    direction: result.direction,
    assumptions: {
      sourceLabel: "ISO-weekdagrekenregel (maandag=1 t/m zondag=7)",
      lastChecked: "2026-05-29",
      status: "stabiel",
    },
  };
}
