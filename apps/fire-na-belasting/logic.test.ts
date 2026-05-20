import { describe, expect, it } from "vitest";
import { calculateFireNaBelasting } from "./logic";

describe("calculateFireNaBelasting", () => {
  it("calculates FIRE number from expenses and withdrawal rate", () => {
    const result = calculateFireNaBelasting({
      annualExpensesNow: 30000,
      withdrawalRate: 4,
      horizonYears: 10,
    });

    expect(result.fireNumberToday).toBeCloseTo(750000, 2);
  });

  it("grows assets with positive returns", () => {
    const result = calculateFireNaBelasting({
      currentNetWorth: 100000,
      expectedAnnualReturn: 6,
      annualExpensesNow: 30000,
      withdrawalRate: 4,
      horizonYears: 5,
      includeBox3Effect: false,
    });

    expect(result.endAssetsAtHorizon).toBeGreaterThan(100000);
  });

  it("reaches FIRE with high contribution", () => {
    const result = calculateFireNaBelasting({
      currentNetWorth: 200000,
      monthlyContribution: 4000,
      expectedAnnualReturn: 7,
      annualExpensesNow: 24000,
      withdrawalRate: 4,
      horizonYears: 30,
      includeBox3Effect: false,
    });

    expect(result.fireReachedWithinHorizon).toBe(true);
    expect(result.yearsToFire).not.toBeNull();
  });

  it("can fail to reach FIRE within horizon", () => {
    const result = calculateFireNaBelasting({
      currentNetWorth: 10000,
      monthlyContribution: 100,
      expectedAnnualReturn: 2,
      annualExpensesNow: 50000,
      withdrawalRate: 3,
      horizonYears: 10,
      includeBox3Effect: false,
    });

    expect(result.fireReachedWithinHorizon).toBe(false);
    expect(result.yearsToFire).toBeNull();
  });

  it("box3 toggle affects net assets", () => {
    const withoutBox3 = calculateFireNaBelasting({
      currentNetWorth: 250000,
      monthlyContribution: 1000,
      expectedAnnualReturn: 5,
      annualExpensesNow: 35000,
      withdrawalRate: 4,
      horizonYears: 20,
      includeBox3Effect: false,
    });
    const withBox3 = calculateFireNaBelasting({
      currentNetWorth: 250000,
      monthlyContribution: 1000,
      expectedAnnualReturn: 5,
      annualExpensesNow: 35000,
      withdrawalRate: 4,
      horizonYears: 20,
      includeBox3Effect: true,
      taxYear: 2026,
    });

    expect(withBox3.totalBox3TaxPaid).toBeGreaterThanOrEqual(0);
    expect(withBox3.endAssetsAtHorizon).toBeLessThanOrEqual(withoutBox3.endAssetsAtHorizon);
  });

  it("sanitizes negative input and avoids NaN/Infinity", () => {
    const result = calculateFireNaBelasting({
      currentNetWorth: -100000,
      currentSavings: -20000,
      currentInvestments: -30000,
      monthlyContribution: -500,
      yearlyContribution: -1000,
      expectedAnnualReturn: -10,
      annualInflation: -3,
      annualExpensesNow: -40000,
      withdrawalRate: 0,
      horizonYears: -5,
      includeBox3Effect: true,
    });

    expect(Number.isFinite(result.endAssetsAtHorizon)).toBe(true);
    expect(Number.isFinite(result.annualContributionUsed)).toBe(true);
    expect(Number.isFinite(result.totalBox3TaxPaid)).toBe(true);
    expect(result.endAssetsAtHorizon).toBeGreaterThanOrEqual(0);
  });

  it("handles withdrawal rate 0 safely", () => {
    const result = calculateFireNaBelasting({
      currentNetWorth: 150000,
      annualExpensesNow: 30000,
      withdrawalRate: 0,
      horizonYears: 20,
    });

    expect(result.fireReachedWithinHorizon).toBe(false);
    expect(result.warnings.some((warning) => warning.includes("Withdrawal rate"))).toBe(
      true,
    );
  });

  it("never returns NaN or Infinity in projection", () => {
    const result = calculateFireNaBelasting({
      currentNetWorth: 40000,
      currentSavings: 10000,
      currentInvestments: 30000,
      monthlyContribution: 800,
      expectedAnnualReturn: 5,
      annualInflation: 2,
      annualExpensesNow: 28000,
      withdrawalRate: 4,
      horizonYears: 40,
      includeBox3Effect: true,
      taxYear: 2026,
    });

    expect(
      result.projection.every(
        (point) =>
          Number.isFinite(point.assets) &&
          Number.isFinite(point.fireTarget) &&
          Number.isFinite(point.box3Tax) &&
          point.assets >= 0 &&
          point.box3Tax >= 0,
      ),
    ).toBe(true);
  });
});
