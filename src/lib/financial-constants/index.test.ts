import { describe, expect, it } from "vitest";
import {
  getAvailableFinancialYears,
  getDefaultFinancialYear,
  getDuoRateForRule,
  getFinancialConstants,
  getMortgageFinancingLoadRatio,
  getMortgageFinancingLoadTable,
  getStudentDebtGrossUpFactor,
} from "@/lib/financial-constants";

describe("financial constants helpers", () => {
  it("returns the configured default year", () => {
    expect(getDefaultFinancialYear()).toBe(2026);
  });

  it("falls back to default constants for unknown year", () => {
    const fallback = getFinancialConstants(2099);
    const defaults = getFinancialConstants(getDefaultFinancialYear());

    expect(fallback.year).toBe(defaults.year);
    expect(fallback.duo.rates.SF35).toBe(defaults.duo.rates.SF35);
  });

  it("returns expected DUO rate for SF35 in 2026", () => {
    expect(getDuoRateForRule("SF35", 2026)).toBe(2.33);
  });

  it("selects the gross-up factor band by mortgage rate", () => {
    expect(getStudentDebtGrossUpFactor(3.6, 2026).factor).toBe(1.2);
    expect(getStudentDebtGrossUpFactor(4.2, 2026).factor).toBe(1.25);
  });

  it("looks up the official financing-load table for the expected age group and rate band", () => {
    expect(
      getMortgageFinancingLoadRatio({
        annualIncome: 55_000,
        mortgageRate: 4.5,
      }),
    ).toBe(23.6);

    expect(
      getMortgageFinancingLoadRatio({
        annualIncome: 55_000,
        mortgageRate: 4.5,
        ageYears: 68,
      }),
    ).toBe(31.1);

    const table = getMortgageFinancingLoadTable();
    expect(table.normYear).toBe(2026);
    expect(table.versionLabel).toContain("2026");
    expect(table.sourceUrl).toContain("officielebekendmakingen.nl");
  });

  it("returns available years in ascending order", () => {
    const years = getAvailableFinancialYears();
    expect(years.length).toBeGreaterThan(0);
    expect(years).toEqual([...years].sort((a, b) => a - b));
    expect(years).toContain(2026);
  });
});
