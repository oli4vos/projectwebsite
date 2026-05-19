import { describe, expect, it } from "vitest";
import { calculateMortgageInterestDeduction } from "@/lib/tax/mortgage-interest-deduction";

describe("calculateMortgageInterestDeduction", () => {
  it("returns zero tax benefit for zero mortgage interest", () => {
    const result = calculateMortgageInterestDeduction({
      annualMortgageInterest: 0,
      taxableIncome: 60000,
      year: 2026,
    });

    expect(result.estimatedTaxBenefit).toBe(0);
    expect(result.netInterestCost).toBe(0);
  });

  it("returns positive tax benefit for positive interest and taxable income", () => {
    const result = calculateMortgageInterestDeduction({
      annualMortgageInterest: 9000,
      taxableIncome: 70000,
      year: 2026,
    });

    expect(result.appliedDeductionRate).toBeGreaterThan(0);
    expect(result.estimatedTaxBenefit).toBeGreaterThan(0);
    expect(result.netInterestCost).toBeCloseTo(
      result.grossInterest - result.estimatedTaxBenefit,
      2,
    );
  });

  it("sanitizes negative mortgage interest to zero", () => {
    const result = calculateMortgageInterestDeduction({
      annualMortgageInterest: -2500,
      taxableIncome: 70000,
      year: 2026,
    });

    expect(result.grossInterest).toBe(0);
    expect(result.estimatedTaxBenefit).toBe(0);
    expect(result.netInterestCost).toBe(0);
  });
});
