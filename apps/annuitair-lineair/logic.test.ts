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

  it("keeps investment scenario optional", () => {
    const baseOnly = calculateMortgageComparison({
      loanAmount: 300000,
      interestRatePercent: 4,
      loanTermYears: 30,
    });
    const withDeepDive = calculateMortgageComparison({
      loanAmount: 300000,
      interestRatePercent: 4,
      loanTermYears: 30,
      annualReturnPercent: 5,
      includeInvestmentScenario: true,
    });

    expect(baseOnly.investmentScenario).toBeUndefined();
    expect(withDeepDive.investmentScenario).toBeDefined();
    expect(withDeepDive.investmentScenario?.yearly.length).toBe(30);
  });

  it("applies optional box 3 impact only when enabled", () => {
    const withoutBox3 = calculateMortgageComparison({
      loanAmount: 300000,
      interestRatePercent: 4,
      loanTermYears: 30,
      annualReturnPercent: 5,
      includeInvestmentScenario: true,
      box3EffectEnabled: false,
    });
    const withBox3 = calculateMortgageComparison({
      loanAmount: 300000,
      interestRatePercent: 4,
      loanTermYears: 30,
      annualReturnPercent: 5,
      includeInvestmentScenario: true,
      box3EffectEnabled: true,
      taxYear: 2026,
      box3BankDeposits: 50000,
      box3InvestmentsAndOtherAssets: 30000,
      box3Debts: 0,
    });

    expect(withoutBox3.investmentScenario?.totalBox3TaxExtra ?? 0).toBe(0);
    expect(withBox3.investmentScenario?.totalBox3TaxExtra ?? 0).toBeGreaterThanOrEqual(0);
  });
});
