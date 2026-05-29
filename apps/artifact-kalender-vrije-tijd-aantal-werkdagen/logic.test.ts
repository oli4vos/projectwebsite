import { describe, expect, it } from "vitest";
import { parseIsoDateInput } from "@/lib/calendar";
import { calculateAantalWerkdagen } from "./logic";

describe("calculateAantalWerkdagen", () => {
  it("returns 5 workdays in baseline week", () => {
    const result = calculateAantalWerkdagen({
      startDate: parseIsoDateInput("2024-01-01")!,
      endDate: parseIsoDateInput("2024-01-07")!,
      includeEndDate: true,
      workdayPattern: [1, 2, 3, 4, 5],
      excludeDutchHolidays: false,
      includeLiberationDay: true,
    });

    expect(result.totalWorkdays).toBe(5);
    expect(result.totalCalendarDays).toBe(7);
  });

  it("returns zero workdays for weekend period", () => {
    const result = calculateAantalWerkdagen({
      startDate: parseIsoDateInput("2024-01-06")!,
      endDate: parseIsoDateInput("2024-01-07")!,
      includeEndDate: true,
      workdayPattern: [1, 2, 3, 4, 5],
      excludeDutchHolidays: false,
      includeLiberationDay: true,
    });

    expect(result.totalWorkdays).toBe(0);
  });

  it("drops New Year's Day when holidays are excluded", () => {
    const result = calculateAantalWerkdagen({
      startDate: parseIsoDateInput("2024-01-01")!,
      endDate: parseIsoDateInput("2024-01-01")!,
      includeEndDate: true,
      workdayPattern: [1, 2, 3, 4, 5],
      excludeDutchHolidays: true,
      includeLiberationDay: true,
    });

    expect(result.totalWorkdays).toBe(0);
    expect(result.totalHolidayOnWorkday).toBe(1);
  });
});
