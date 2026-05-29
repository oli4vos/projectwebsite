import { describe, expect, it } from "vitest";
import { parseIsoDateInput } from "@/lib/calendar";
import { calculateBeginOfEinddatum } from "./logic";

describe("calculateBeginOfEinddatum", () => {
  it("calculates end date from start date + 10 days", () => {
    const result = calculateBeginOfEinddatum({
      knownDate: parseIsoDateInput("2024-01-01")!,
      mode: "endFromStart",
      components: {
        years: 0,
        months: 0,
        weeks: 0,
        days: 10,
      },
    });

    expect(result.calculatedDate).toBe("11-01-2024");
  });

  it("handles month-end correction on leap year", () => {
    const result = calculateBeginOfEinddatum({
      knownDate: parseIsoDateInput("2024-01-31")!,
      mode: "endFromStart",
      components: {
        years: 0,
        months: 1,
        weeks: 0,
        days: 0,
      },
    });

    expect(result.calculatedDate).toBe("29-02-2024");
  });

  it("calculates begin date from end date - 1 month", () => {
    const result = calculateBeginOfEinddatum({
      knownDate: parseIsoDateInput("2024-03-01")!,
      mode: "startFromEnd",
      components: {
        years: 0,
        months: 1,
        weeks: 0,
        days: 0,
      },
    });

    expect(result.calculatedDate).toBe("01-02-2024");
  });
});
