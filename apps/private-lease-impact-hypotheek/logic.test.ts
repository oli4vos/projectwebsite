import { describe, expect, it } from "vitest";
import { calculatePrivateLeaseImpact } from "./logic";

describe("calculatePrivateLeaseImpact", () => {
  it("returns zero-safe output for empty input", () => {
    const result = calculatePrivateLeaseImpact({});
    expect(result.maxMortgageWithoutLease).toBe(0);
    expect(result.monthlyLeaseCost).toBe(0);
    expect(result.indicativeMortgageAfterLease).toBe(0);
  });

  it("calculates indicative reduction with default factor", () => {
    const result = calculatePrivateLeaseImpact({
      maxMortgageWithoutLease: 350000,
      monthlyLeaseCost: 400,
    });
    expect(result.yearlyLeaseCost).toBe(4800);
    expect(result.debtToMortgageFactor).toBe(4.5);
    expect(result.indicativeMortgageReduction).toBe(21600);
    expect(result.indicativeMortgageAfterLease).toBe(328400);
  });

  it("clamps negative values", () => {
    const result = calculatePrivateLeaseImpact({
      maxMortgageWithoutLease: -10,
      monthlyLeaseCost: -20,
      debtToMortgageFactor: -5,
    });
    expect(result.maxMortgageWithoutLease).toBe(0);
    expect(result.monthlyLeaseCost).toBe(0);
    expect(result.debtToMortgageFactor).toBe(0);
  });
});

