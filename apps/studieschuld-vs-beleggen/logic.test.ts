import { describe, expect, it } from "vitest";
import {
  calculateStudyDebtVsInvesting,
  summarizeDebtParts,
} from "./logic";

const baseInput = {
  repaymentRule: "SF35" as const,
  remainingDebt: 30000,
  annualDebtRate: 2.33,
  remainingTermYears: 35,
  grossAnnualIncome: 45000,
  partnerGrossAnnualIncome: 0,
  voluntaryExtraMonthly: 150,
  annualInvestmentReturn: 6,
};

describe("calculateStudyDebtVsInvesting", () => {
  it("summarizes debt parts in the central logic layer", () => {
    const result = summarizeDebtParts([
      { amount: 1000, annualDebtRate: 2 },
      { amount: 3000, annualDebtRate: 4 },
    ]);

    expect(result.remainingDebt).toBe(4000);
    expect(result.annualDebtRate).toBeCloseTo(3.5, 3);
  });

  it("falls back safely when debt parts carry no positive amount", () => {
    const result = summarizeDebtParts([{ amount: 0, annualDebtRate: 5 }], {
      remainingDebt: 12345,
      annualDebtRate: 2.33,
    });

    expect(result.remainingDebt).toBe(12345);
    expect(result.annualDebtRate).toBe(2.33);
  });

  it("computes statutory and required DUO monthly payments", () => {
    const result = calculateStudyDebtVsInvesting(baseInput);

    expect(result.duoContext.statutoryMonthlyPayment).toBeGreaterThan(0);
    expect(result.duoContext.requiredMonthlyPayment).toBeGreaterThan(0);
    expect(result.duoContext.totalMonthlyToDuo).toBeGreaterThan(
      result.duoContext.requiredMonthlyPayment,
    );
  });

  it("treats voluntary amount as optional extra above required minimum", () => {
    const result = calculateStudyDebtVsInvesting({
      ...baseInput,
      voluntaryExtraMonthly: 0,
    });

    expect(result.totalVoluntaryAmount).toBe(0);
    expect(result.duoContext.totalMonthlyToDuo).toBeCloseTo(
      result.duoContext.requiredMonthlyPayment,
      2,
    );
  });

  it("shows earlier payoff when paying required + voluntary monthly amount", () => {
    const result = calculateStudyDebtVsInvesting(baseInput);

    expect(result.duoContext.monthsEarlierDebtFree).toBeGreaterThanOrEqual(0);
    expect(result.duoContext.yearsEarlierDebtFree).toBeGreaterThanOrEqual(0);
  });

  it("uses payoff-with-extra as automatic investment horizon", () => {
    const result = calculateStudyDebtVsInvesting(baseInput);

    expect(result.effectiveHorizonMonths).toBeGreaterThanOrEqual(1);
    expect(result.effectiveHorizonYears).toBe(
      Math.max(Math.ceil(result.effectiveHorizonMonths / 12), 1),
    );
    expect(result.projections[result.projections.length - 1]?.year).toBe(
      result.effectiveHorizonYears,
    );
  });

  it("includes debt balance projection that reaches zero by the end of horizon", () => {
    const result = calculateStudyDebtVsInvesting(baseInput);
    const firstPoint = result.projections[0];
    const lastPoint = result.projections[result.projections.length - 1];

    expect(firstPoint?.remainingDebtWithExtra).toBeGreaterThan(0);
    expect(lastPoint?.remainingDebtWithExtra ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(0.01);
  });

  it("keeps base result stable when box3 effect is disabled", () => {
    const withoutBox3 = calculateStudyDebtVsInvesting(baseInput);
    const withExplicitFalse = calculateStudyDebtVsInvesting({
      ...baseInput,
      box3EffectEnabled: false,
      taxYear: 2026,
      hasFiscalPartner: true,
      box3BankDeposits: 50000,
      box3InvestmentsAndOtherAssets: 30000,
      box3Debts: 5000,
    });

    expect(withoutBox3.box3Scenario).toBeUndefined();
    expect(withExplicitFalse.box3Scenario).toBeUndefined();
    expect(withExplicitFalse.difference).toBeCloseTo(withoutBox3.difference, 2);
  });

  it("returns non-negative box 3 deltas when enabled", () => {
    const result = calculateStudyDebtVsInvesting({
      ...baseInput,
      box3EffectEnabled: true,
      taxYear: 2026,
      box3BankDeposits: 80000,
      box3InvestmentsAndOtherAssets: 60000,
      box3Debts: 5000,
    });

    expect(result.box3Scenario).toBeDefined();
    expect(result.box3Scenario?.additionalBox3TaxIndicative ?? -1).toBeGreaterThanOrEqual(0);
    expect(
      result.box3Scenario?.cumulativeAdditionalBox3TaxIndicative ?? -1,
    ).toBeGreaterThanOrEqual(result.box3Scenario?.additionalBox3TaxIndicative ?? 0);
  });

  it("supports forfaitary box3 method when selected", () => {
    const result = calculateStudyDebtVsInvesting({
      ...baseInput,
      box3EffectEnabled: true,
      box3Method: "forfaitary",
      taxYear: 2026,
      box3BankDeposits: 20000,
      box3InvestmentsAndOtherAssets: 20000,
      box3Debts: 0,
    });

    expect(result.box3Scenario?.box3Method).toBe("forfaitary");
  });

  it("sanitizes negative values safely", () => {
    const result = calculateStudyDebtVsInvesting({
      ...baseInput,
      remainingDebt: -1000,
      annualDebtRate: -2,
      voluntaryExtraMonthly: -200,
      annualInvestmentReturn: -5,
      box3EffectEnabled: true,
      taxYear: 2026,
      box3BankDeposits: -1000,
      box3InvestmentsAndOtherAssets: -500,
      box3Debts: -100,
    });

    expect(Number.isFinite(result.difference)).toBe(true);
    expect(result.duoContext.requiredMonthlyPayment).toBeGreaterThanOrEqual(0);
    expect(result.box3Scenario?.additionalBox3TaxIndicative ?? 0).toBeGreaterThanOrEqual(0);
  });
});
