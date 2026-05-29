import { describe, expect, it } from "vitest";
import {
  addCalendarMonths,
  calculateNearestWeekday,
  calculatePeriodDuration,
  calculateWorkdays,
  formatDateNl,
  getIsoWeekday,
  getWeekdayNameNl,
  parseIsoDateInput,
} from "@/lib/calendar";

describe("calendar date and period utilities", () => {
  it("parses and formats valid ISO dates", () => {
    const date = parseIsoDateInput("2026-05-29");
    expect(date).not.toBeNull();
    expect(formatDateNl(date!)).toBe("29-05-2026");
    expect(getWeekdayNameNl(getIsoWeekday(date!))).toBe("vrijdag");
  });

  it("rejects impossible dates", () => {
    expect(parseIsoDateInput("2024-02-31")).toBeNull();
    expect(parseIsoDateInput("2024/02/01")).toBeNull();
  });

  it("keeps month-end behavior when adding months", () => {
    const date = parseIsoDateInput("2024-01-31");
    const moved = addCalendarMonths(date!, 1);
    expect(formatDateNl(moved)).toBe("29-02-2024");
  });

  it("calculates period duration and breakdown", () => {
    const start = parseIsoDateInput("2024-01-01")!;
    const end = parseIsoDateInput("2024-01-08")!;
    const result = calculatePeriodDuration({
      startDate: start,
      endDate: end,
      includeEndDate: false,
    });

    expect(result.totalCalendarDays).toBe(7);
    expect(result.totalWeeks).toBe(1);
    expect(result.remainingDays).toBe(0);
  });

  it("finds nearest weekday correctly", () => {
    const start = parseIsoDateInput("2026-05-29")!;
    const nextMonday = calculateNearestWeekday({
      startDate: start,
      targetWeekday: 1,
      direction: "next",
      includeToday: false,
    });

    expect(nextMonday.formattedDate).toBe("01-06-2026");
    expect(nextMonday.dayDifference).toBe(3);
  });
});

describe("workday calculation", () => {
  it("counts Monday-Friday in a full week", () => {
    const start = parseIsoDateInput("2024-01-01")!;
    const end = parseIsoDateInput("2024-01-07")!;
    const result = calculateWorkdays({
      startDate: start,
      endDate: end,
      includeEndDate: true,
      workdayPattern: [1, 2, 3, 4, 5],
      excludeDutchHolidays: false,
    });

    expect(result.totalWorkdays).toBe(5);
    expect(result.totalCalendarDays).toBe(7);
  });

  it("returns zero workdays in weekend-only period", () => {
    const start = parseIsoDateInput("2024-01-06")!;
    const end = parseIsoDateInput("2024-01-07")!;
    const result = calculateWorkdays({
      startDate: start,
      endDate: end,
      includeEndDate: true,
      workdayPattern: [1, 2, 3, 4, 5],
      excludeDutchHolidays: false,
    });

    expect(result.totalWorkdays).toBe(0);
    expect(result.totalWeekendDays).toBe(2);
  });

  it("excludes Dutch holidays when requested", () => {
    const start = parseIsoDateInput("2024-01-01")!;
    const end = parseIsoDateInput("2024-01-01")!;
    const result = calculateWorkdays({
      startDate: start,
      endDate: end,
      includeEndDate: true,
      workdayPattern: [1, 2, 3, 4, 5],
      excludeDutchHolidays: true,
    });

    expect(result.totalWorkdays).toBe(0);
    expect(result.totalHolidayOnWorkday).toBe(1);
  });
});
