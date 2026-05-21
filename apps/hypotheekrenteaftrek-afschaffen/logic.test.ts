import { describe, expect, it } from "vitest";
import { calculateMortgageDeductionAbolitionImpact } from "./logic";

describe("calculateMortgageDeductionAbolitionImpact", () => {
  it("returns a positive difference when interest and income are positive", () => {
    const result = calculateMortgageDeductionAbolitionImpact({
      taxYear: 2026,
      taxableIncome: 65000,
      remainingMortgageDebt: 300000,
      mortgageRatePercent: 4,
      horizonYears: 10,
    });

    expect(result.annualGrossInterestUsed).toBeGreaterThan(0);
    expect(result.annualDifference).toBeGreaterThanOrEqual(0);
    expect(result.cumulativeDifference).toBeGreaterThanOrEqual(result.annualDifference);
  });

  it("supports explicit annual interest override", () => {
    const result = calculateMortgageDeductionAbolitionImpact({
      taxYear: 2026,
      taxableIncome: 50000,
      remainingMortgageDebt: 300000,
      mortgageRatePercent: 4,
      annualMortgageInterestOverride: 9000,
      horizonYears: 5,
    });

    expect(result.annualGrossInterestUsed).toBe(9000);
    expect(result.timeline).toHaveLength(5);
  });

  it("sanitizes invalid and negative inputs safely", () => {
    const result = calculateMortgageDeductionAbolitionImpact({
      taxYear: Number.NaN,
      taxableIncome: -100,
      remainingMortgageDebt: -100,
      mortgageRatePercent: -2,
      annualMortgageInterestOverride: -50,
      horizonYears: -2,
    });

    expect(result.horizonYears).toBeGreaterThanOrEqual(1);
    expect(result.annualGrossInterestUsed).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(result.cumulativeDifference)).toBe(true);
  });
});
