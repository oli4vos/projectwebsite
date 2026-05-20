import { describe, expect, it } from "vitest";
import { calculateMortgageComparison } from "./logic";

describe("calculateMortgageComparison", () => {
  it("returns stable result for valid input", () => {
    const result = calculateMortgageComparison({
      loanAmount: 300000,
      interestRatePercent: 4,
      loanTermYears: 30,
      annualReturnPercent: 5,
    });

    expect(result.annuityRows.length).toBeGreaterThan(0);
    expect(result.linearRows.length).toBeGreaterThan(0);
    expect(Number.isFinite(result.totals.totalAnnuityInterest)).toBe(true);
    expect(Number.isFinite(result.totals.totalLinearInterest)).toBe(true);
  });
});

