import { describe, expect, it } from "vitest";
import { calculateStudyDebtVsInvesting } from "./logic";

const baseInput = {
  monthlyAmount: 150,
  annualDebtRate: 2.33,
  annualInvestmentReturn: 6,
  years: 10,
};

describe("calculateStudyDebtVsInvesting", () => {
  it("keeps base calculation working without box 3 effect", () => {
    const result = calculateStudyDebtVsInvesting(baseInput);

    expect(result.totalExtraRepayment).toBeGreaterThan(0);
    expect(result.expectedInvestmentValue).toBeGreaterThan(0);
    expect(result.projections.length).toBe(11);
    expect(result.box3Scenario).toBeUndefined();
  });

  it("does not change core result when box3EffectEnabled is false", () => {
    const withoutOption = calculateStudyDebtVsInvesting(baseInput);
    const withOptionFalse = calculateStudyDebtVsInvesting({
      ...baseInput,
      box3EffectEnabled: false,
      taxYear: 2026,
      hasFiscalPartner: true,
      box3BankDeposits: 50000,
      box3InvestmentsAndOtherAssets: 30000,
      box3Debts: 10000,
    });

    expect(withOptionFalse.difference).toBeCloseTo(withoutOption.difference, 2);
    expect(withOptionFalse.expectedInvestmentValue).toBeCloseTo(
      withoutOption.expectedInvestmentValue,
      2,
    );
    expect(withOptionFalse.box3Scenario).toBeUndefined();
  });

  it("returns non-negative additional box 3 effect when enabled", () => {
    const result = calculateStudyDebtVsInvesting({
      ...baseInput,
      box3EffectEnabled: true,
      taxYear: 2026,
      hasFiscalPartner: false,
      box3BankDeposits: 70000,
      box3InvestmentsAndOtherAssets: 60000,
      box3Debts: 5000,
    });

    expect(result.box3Scenario).toBeDefined();
    expect(result.box3Scenario?.additionalBox3TaxIndicative ?? -1).toBeGreaterThanOrEqual(0);
  });

  it("keeps additional box 3 effect low when wealth is below allowance", () => {
    const result = calculateStudyDebtVsInvesting({
      ...baseInput,
      box3EffectEnabled: true,
      taxYear: 2026,
      hasFiscalPartner: false,
      box3BankDeposits: 1000,
      box3InvestmentsAndOtherAssets: 0,
      box3Debts: 0,
    });

    expect(result.box3Scenario?.additionalBox3TaxIndicative ?? 0).toBeGreaterThanOrEqual(0);
    expect(result.box3Scenario?.additionalBox3TaxIndicative ?? 0).toBeLessThan(500);
  });

  it("sanitizes negative box 3 input values safely", () => {
    const result = calculateStudyDebtVsInvesting({
      ...baseInput,
      box3EffectEnabled: true,
      taxYear: 2026,
      hasFiscalPartner: false,
      box3BankDeposits: -1000,
      box3InvestmentsAndOtherAssets: -5000,
      box3Debts: -3000,
    });

    const box3 = result.box3Scenario;
    expect(box3).toBeDefined();
    expect(Number.isFinite(box3?.additionalBox3TaxIndicative ?? Number.NaN)).toBe(true);
    expect(box3?.additionalBox3TaxIndicative ?? -1).toBeGreaterThanOrEqual(0);
  });

  it("uses higher fiscal partner allowance where applicable", () => {
    const single = calculateStudyDebtVsInvesting({
      ...baseInput,
      box3EffectEnabled: true,
      taxYear: 2026,
      hasFiscalPartner: false,
      box3BankDeposits: 120000,
      box3InvestmentsAndOtherAssets: 0,
      box3Debts: 0,
    });
    const partner = calculateStudyDebtVsInvesting({
      ...baseInput,
      box3EffectEnabled: true,
      taxYear: 2026,
      hasFiscalPartner: true,
      box3BankDeposits: 120000,
      box3InvestmentsAndOtherAssets: 0,
      box3Debts: 0,
    });

    expect((partner.box3Scenario?.taxFreeAllowance ?? 0)).toBeGreaterThan(
      single.box3Scenario?.taxFreeAllowance ?? 0,
    );
    expect((partner.box3Scenario?.additionalBox3TaxIndicative ?? 0)).toBeLessThanOrEqual(
      single.box3Scenario?.additionalBox3TaxIndicative ?? 0,
    );
  });
});
