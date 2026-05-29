import { describe, expect, it } from "vitest";
import { calculateFeestdagen } from "./logic";

describe("calculateFeestdagen", () => {
  it("contains key 2024 holidays", () => {
    const result = calculateFeestdagen({
      year: 2024,
      includeLiberationDay: true,
    });

    const names = result.holidays.map((holiday) => holiday.name);
    const dates = result.holidays.map((holiday) => holiday.date);

    expect(names).toContain("Nieuwjaarsdag");
    expect(dates).toContain("27-04-2024");
    expect(dates).toContain("25-12-2024");
    expect(dates).toContain("01-04-2024");
  });

  it("includes Easter-based dates", () => {
    const result = calculateFeestdagen({
      year: 2024,
      includeLiberationDay: true,
    });
    const dates = result.holidays.map((holiday) => holiday.date);

    expect(dates).toContain("31-03-2024");
    expect(dates).toContain("09-05-2024");
    expect(dates).toContain("19-05-2024");
  });
});
