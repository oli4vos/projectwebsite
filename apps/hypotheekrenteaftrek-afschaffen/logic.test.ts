import { describe, expect, it } from "vitest";
import { calculateMortgageDeductionAbolitionImpact } from "./logic";

describe("calculateMortgageDeductionAbolitionImpact", () => {
  it("returns a positive difference when interest and income are positive", () => {
    const result = calculateMortgageDeductionAbolitionImpact({
      taxYear: 2026,
      firstMortgageYear: 2018,
      taxableIncome: 65000,
      remainingMortgageDebt: 300000,
      mortgageRatePercent: 4,
      mortgageType: "annuity",
      remainingMortgageTermYears: 30,
      horizonYears: 10,
    });

    expect(result.annualGrossInterestUsed).toBeGreaterThan(0);
    expect(result.annualDifference).toBeGreaterThanOrEqual(0);
    expect(result.cumulativeDifference).toBeGreaterThanOrEqual(result.annualDifference);
  });

  it("supports explicit annual interest override", () => {
    const result = calculateMortgageDeductionAbolitionImpact({
      taxYear: 2026,
      firstMortgageYear: 2015,
      taxableIncome: 50000,
      remainingMortgageDebt: 300000,
      mortgageRatePercent: 4,
      mortgageType: "annuity",
      remainingMortgageTermYears: 30,
      annualMortgageInterestOverride: 9000,
      horizonYears: 5,
    });

    expect(result.annualGrossInterestUsed).toBe(9000);
    expect(result.timeline).toHaveLength(5);
  });

  it("sanitizes invalid and negative inputs safely", () => {
    const result = calculateMortgageDeductionAbolitionImpact({
      taxYear: Number.NaN,
      firstMortgageYear: Number.NaN,
      taxableIncome: -100,
      remainingMortgageDebt: -100,
      mortgageRatePercent: -2,
      mortgageType: "annuity",
      remainingMortgageTermYears: -10,
      annualMortgageInterestOverride: -50,
      horizonYears: -2,
    });

    expect(result.horizonYears).toBeGreaterThanOrEqual(1);
    expect(result.annualGrossInterestUsed).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(result.cumulativeDifference)).toBe(true);
  });

  it("stops applying deduction after the configured deduction years", () => {
    const result = calculateMortgageDeductionAbolitionImpact({
      taxYear: 2026,
      firstMortgageYear: 1998,
      taxableIncome: 65000,
      remainingMortgageDebt: 300000,
      mortgageRatePercent: 4,
      mortgageType: "annuity",
      remainingMortgageTermYears: 30,
      horizonYears: 5,
    });

    expect(result.timeline[0]?.deductionApplies).toBe(true);
    expect(result.timeline[1]?.deductionApplies).toBe(true);
    expect(result.timeline[2]?.deductionApplies).toBe(false);
    expect(result.timeline[2]?.annualDifference).toBe(0);
  });

  it("reflects mortgage type in the yearly interest path", () => {
    const linear = calculateMortgageDeductionAbolitionImpact({
      taxYear: 2026,
      firstMortgageYear: 2018,
      taxableIncome: 65000,
      remainingMortgageDebt: 300000,
      mortgageRatePercent: 4,
      mortgageType: "linear",
      remainingMortgageTermYears: 30,
      horizonYears: 5,
    });
    const interestOnly = calculateMortgageDeductionAbolitionImpact({
      taxYear: 2026,
      firstMortgageYear: 2018,
      taxableIncome: 65000,
      remainingMortgageDebt: 300000,
      mortgageRatePercent: 4,
      mortgageType: "interestOnly",
      remainingMortgageTermYears: 30,
      horizonYears: 5,
    });

    expect(linear.timeline[4]?.grossInterest ?? 0).toBeLessThan(
      linear.timeline[0]?.grossInterest ?? Number.POSITIVE_INFINITY,
    );
    expect(interestOnly.timeline[4]?.grossInterest).toBeCloseTo(
      interestOnly.timeline[0]?.grossInterest ?? 0,
      0,
    );
  });
});
