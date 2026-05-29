import { describe, expect, it } from "vitest";
import { calculateSchoolvakanties } from "./logic";

describe("calculateSchoolvakanties", () => {
  it("contains known meivakantie period", () => {
    const result = calculateSchoolvakanties({
      schoolYear: "2024-2025",
      region: "noord",
    });
    const meivakantie = result.holidays.find((holiday) => holiday.name === "Meivakantie");

    expect(meivakantie).toBeDefined();
    expect(meivakantie?.startDate).toBe("27-04-2024");
    expect(meivakantie?.endDate).toBe("05-05-2024");
    expect(meivakantie?.durationCalendarDays).toBe(9);
  });

  it("returns warning when no data is available", () => {
    const result = calculateSchoolvakanties({
      schoolYear: "2035-2036",
      region: "noord",
    });

    expect(result.totalHolidays).toBe(0);
    expect(result.warnings).toHaveLength(1);
  });
});
