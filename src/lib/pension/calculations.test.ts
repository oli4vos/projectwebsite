import { describe, expect, it } from "vitest";
import {
  calculateFutureValueLumpSum,
  calculatePensionContributionScenario,
  sanitizePensionMoney,
  sanitizePensionPercent,
  sanitizePensionYears,
} from "@/lib/pension";

describe("pension calculations", () => {
  it("sanitizes money/percent/years safely", () => {
    expect(sanitizePensionMoney(-100)).toBe(0);
    expect(sanitizePensionPercent(150)).toBe(100);
    expect(sanitizePensionPercent(-10)).toBe(0);
    expect(sanitizePensionYears(-3)).toBe(1);
    expect(sanitizePensionYears(undefined)).toBe(10);
  });

  it("calculates future value lump sum", () => {
    const fv = calculateFutureValueLumpSum(10000, 5, 10);
    expect(fv).toBeGreaterThan(10000);
  });

  it("handles zero principal safely", () => {
    expect(calculateFutureValueLumpSum(0, 5, 20)).toBe(0);
  });

  it("calculates pension scenario with payout tax", () => {
    const result = calculatePensionContributionScenario({
      contribution: 5000,
      annualReturnPercent: 5,
      horizonYears: 20,
      currentTaxRatePercent: 37.56,
      payoutTaxRatePercent: 30,
    });

    expect(result.taxBenefitNow).toBeGreaterThan(0);
    expect(result.futureValueGross).toBeGreaterThan(result.contributionUsed);
    expect(result.estimatedTaxAtPayout).toBeGreaterThan(0);
    expect(result.futureValueNetIndicative).toBeLessThan(result.futureValueGross);
  });

  it("handles negative input without NaN/Infinity", () => {
    const result = calculatePensionContributionScenario({
      contribution: -5000,
      annualReturnPercent: -5,
      horizonYears: -20,
      currentTaxRatePercent: -30,
      payoutTaxRatePercent: -25,
    });

    expect(Number.isFinite(result.taxBenefitNow)).toBe(true);
    expect(Number.isFinite(result.futureValueGross)).toBe(true);
    expect(result.contributionUsed).toBe(0);
    expect(result.futureValueNetIndicative).toBeGreaterThanOrEqual(0);
  });
});
