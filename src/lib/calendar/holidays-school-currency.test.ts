import { describe, expect, it } from "vitest";
import {
  calculateEasterSunday,
  convertCurrency,
  getDutchPublicHolidays,
  listDutchSchoolHolidays,
} from "@/lib/calendar";

describe("Dutch holidays", () => {
  it("calculates Easter-based dates for 2024", () => {
    const easter = calculateEasterSunday(2024);
    expect(easter.toISOString().slice(0, 10)).toBe("2024-03-31");
  });

  it("contains expected fixed and moving holidays", () => {
    const holidays = getDutchPublicHolidays(2024);
    const keys = holidays.map((holiday) => holiday.dateKey);

    expect(keys).toContain("2024-01-01");
    expect(keys).toContain("2024-04-27");
    expect(keys).toContain("2024-12-25");
    expect(keys).toContain("2024-04-01");
    expect(keys).toContain("2024-05-09");
    expect(keys).toContain("2024-05-19");
  });
});

describe("Dutch school holidays dataset", () => {
  it("returns known meivakantie duration", () => {
    const holidays = listDutchSchoolHolidays({
      schoolYear: "2024-2025",
      region: "noord",
    });
    const meivakantie = holidays.find((holiday) => holiday.name === "Meivakantie");

    expect(meivakantie).toBeDefined();
    expect(meivakantie?.formattedStartDate).toBe("27-04-2024");
    expect(meivakantie?.formattedEndDate).toBe("05-05-2024");
    expect(meivakantie?.durationCalendarDays).toBe(9);
  });
});

describe("currency conversion", () => {
  it("converts without fees", () => {
    const result = convertCurrency({
      amount: 100,
      fromCurrency: "EUR",
      toCurrency: "USD",
      rateOverride: 1.1,
      feePercent: 0,
      fixedFee: 0,
      feeCurrencyMode: "target",
    });

    expect(result.grossConvertedAmount).toBe(110);
    expect(result.netConvertedAmount).toBe(110);
  });

  it("applies percentage and fixed target fees", () => {
    const result = convertCurrency({
      amount: 100,
      fromCurrency: "EUR",
      toCurrency: "USD",
      rateOverride: 1.2,
      feePercent: 2,
      fixedFee: 1,
      feeCurrencyMode: "target",
    });

    expect(result.grossConvertedAmount).toBe(120);
    expect(result.totalFeeAmountTarget).toBe(3.4);
    expect(result.netConvertedAmount).toBe(116.6);
  });
});
