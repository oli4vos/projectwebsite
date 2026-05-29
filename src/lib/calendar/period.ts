import {
  addCalendarDays,
  addCalendarMonths,
  addCalendarYears,
  differenceInCalendarDays,
  formatDateNl,
  getIsoWeekday,
  getWeekdayNameNl,
  type IsoWeekday,
} from "./date-utils";

export type PeriodComponents = {
  years: number;
  months: number;
  weeks: number;
  days: number;
};

export type DateBoundaryMode = "endFromStart" | "startFromEnd";

export type DateBoundaryInput = {
  mode: DateBoundaryMode;
  knownDate: Date;
  components: PeriodComponents;
};

export type DateBoundaryResult = {
  calculatedDate: Date;
  formattedDate: string;
  direction: DateBoundaryMode;
  totalCalendarDaysShift: number;
};

export type PeriodDurationInput = {
  startDate: Date;
  endDate: Date;
  includeEndDate?: boolean;
};

export type PeriodDurationResult = {
  totalCalendarDays: number;
  totalWeeks: number;
  remainingDays: number;
  calendarBreakdown: {
    years: number;
    months: number;
    days: number;
  };
};

export type NearestWeekdayDirection = "next" | "previous";

export type NearestWeekdayInput = {
  startDate: Date;
  targetWeekday: IsoWeekday;
  direction: NearestWeekdayDirection;
  includeToday?: boolean;
};

export type NearestWeekdayResult = {
  calculatedDate: Date;
  formattedDate: string;
  targetWeekday: IsoWeekday;
  targetWeekdayName: string;
  dayDifference: number;
  direction: NearestWeekdayDirection;
  includesStartDate: boolean;
};

function sanitizePeriodComponents(components: PeriodComponents) {
  return {
    years: Math.max(Math.floor(components.years || 0), 0),
    months: Math.max(Math.floor(components.months || 0), 0),
    weeks: Math.max(Math.floor(components.weeks || 0), 0),
    days: Math.max(Math.floor(components.days || 0), 0),
  };
}

export function calculateBoundaryDate(input: DateBoundaryInput): DateBoundaryResult {
  const components = sanitizePeriodComponents(input.components);
  const extraDays = components.weeks * 7 + components.days;

  const yearsDelta = input.mode === "endFromStart" ? components.years : -components.years;
  const monthsDelta =
    input.mode === "endFromStart" ? components.months : -components.months;
  const daysDelta = input.mode === "endFromStart" ? extraDays : -extraDays;

  const withYears = addCalendarYears(input.knownDate, yearsDelta);
  const withMonths = addCalendarMonths(withYears, monthsDelta);
  const calculatedDate = addCalendarDays(withMonths, daysDelta);
  const totalCalendarDaysShift = Math.abs(
    differenceInCalendarDays(input.knownDate, calculatedDate),
  );

  return {
    calculatedDate,
    formattedDate: formatDateNl(calculatedDate),
    direction: input.mode,
    totalCalendarDaysShift,
  };
}

function decomposeCalendarDuration(startDate: Date, endDateExclusive: Date) {
  let cursor = startDate;
  let years = 0;
  let months = 0;

  while (addCalendarYears(cursor, 1).getTime() <= endDateExclusive.getTime()) {
    years += 1;
    cursor = addCalendarYears(cursor, 1);
  }
  while (addCalendarMonths(cursor, 1).getTime() <= endDateExclusive.getTime()) {
    months += 1;
    cursor = addCalendarMonths(cursor, 1);
  }

  const days = Math.max(differenceInCalendarDays(cursor, endDateExclusive), 0);
  return { years, months, days };
}

export function calculatePeriodDuration(input: PeriodDurationInput): PeriodDurationResult {
  const includeEndDate = input.includeEndDate ?? false;
  const endDateForDuration = includeEndDate
    ? addCalendarDays(input.endDate, 1)
    : input.endDate;
  const totalCalendarDays = Math.max(
    differenceInCalendarDays(input.startDate, endDateForDuration),
    0,
  );
  const totalWeeks = Math.floor(totalCalendarDays / 7);
  const remainingDays = totalCalendarDays % 7;
  const calendarBreakdown = decomposeCalendarDuration(
    input.startDate,
    endDateForDuration,
  );

  return {
    totalCalendarDays,
    totalWeeks,
    remainingDays,
    calendarBreakdown,
  };
}

export function calculateNearestWeekday(
  input: NearestWeekdayInput,
): NearestWeekdayResult {
  const includeToday = input.includeToday ?? false;
  const startWeekday = getIsoWeekday(input.startDate);
  let deltaDays = 0;

  if (input.direction === "next") {
    deltaDays = (input.targetWeekday - startWeekday + 7) % 7;
    if (!includeToday && deltaDays === 0) {
      deltaDays = 7;
    }
  } else {
    deltaDays = (startWeekday - input.targetWeekday + 7) % 7;
    if (!includeToday && deltaDays === 0) {
      deltaDays = 7;
    }
    deltaDays *= -1;
  }

  const calculatedDate = addCalendarDays(input.startDate, deltaDays);

  return {
    calculatedDate,
    formattedDate: formatDateNl(calculatedDate),
    targetWeekday: input.targetWeekday,
    targetWeekdayName: getWeekdayNameNl(input.targetWeekday),
    dayDifference: Math.abs(deltaDays),
    direction: input.direction,
    includesStartDate: deltaDays === 0,
  };
}
