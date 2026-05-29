import { describe, expect, it } from "vitest";
import { parseIsoDateInput } from "@/lib/calendar";
import { calculateEerstvolgendeOfVorigeWeekdag } from "./logic";

describe("calculateEerstvolgendeOfVorigeWeekdag", () => {
  it("finds next Monday from Friday", () => {
    const result = calculateEerstvolgendeOfVorigeWeekdag({
      startDate: parseIsoDateInput("2026-05-29")!,
      targetWeekday: 1,
      direction: "next",
      includeToday: false,
    });

    expect(result.calculatedDate).toBe("01-06-2026");
    expect(result.dayDifference).toBe(3);
  });

  it("returns same day when includeToday is true", () => {
    const result = calculateEerstvolgendeOfVorigeWeekdag({
      startDate: parseIsoDateInput("2026-06-01")!,
      targetWeekday: 1,
      direction: "next",
      includeToday: true,
    });

    expect(result.calculatedDate).toBe("01-06-2026");
    expect(result.includesStartDate).toBe(true);
  });

  it("finds previous Friday from Monday", () => {
    const result = calculateEerstvolgendeOfVorigeWeekdag({
      startDate: parseIsoDateInput("2026-06-01")!,
      targetWeekday: 5,
      direction: "previous",
      includeToday: false,
    });

    expect(result.calculatedDate).toBe("29-05-2026");
    expect(result.dayDifference).toBe(3);
  });
});
