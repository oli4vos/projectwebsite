import { describe, expect, it } from "vitest";
import { parseIsoDateInput } from "@/lib/calendar";
import { calculatePeriodeDuur } from "./logic";

describe("calculatePeriodeDuur", () => {
  it("returns 7 days between 1 and 8 january exclusive", () => {
    const result = calculatePeriodeDuur({
      startDate: parseIsoDateInput("2024-01-01")!,
      endDate: parseIsoDateInput("2024-01-08")!,
      includeEndDate: false,
    });

    expect(result.totalCalendarDays).toBe(7);
    expect(result.totalWeeks).toBe(1);
    expect(result.remainingDays).toBe(0);
  });

  it("returns zero days when start and end are equal and end is excluded", () => {
    const result = calculatePeriodeDuur({
      startDate: parseIsoDateInput("2024-01-01")!,
      endDate: parseIsoDateInput("2024-01-01")!,
      includeEndDate: false,
    });

    expect(result.totalCalendarDays).toBe(0);
  });

  it("returns 366 days for leap-year span", () => {
    const result = calculatePeriodeDuur({
      startDate: parseIsoDateInput("2024-01-01")!,
      endDate: parseIsoDateInput("2025-01-01")!,
      includeEndDate: false,
    });

    expect(result.totalCalendarDays).toBe(366);
  });
});
