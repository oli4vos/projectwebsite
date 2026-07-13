import { describe, expect, it } from "vitest";
import { createDuoDebtPartFormValue } from "@/lib/duo/debt-parts-form";
import {
  calculateDuoExtraRepaymentView,
  createDuoExtraRepaymentDefaultValues,
  validateDuoExtraRepaymentForm,
} from "./logic";

describe("duo-extra-aflossen logic", () => {
  it("calculates a shorter-term scenario through central DUO projection", () => {
    const view = calculateDuoExtraRepaymentView(
      {
        remainingDebt: "30000",
        repaymentRule: "SF35",
        duoRateYear: "2026",
        useDebtParts: false,
        debtParts: [createDuoDebtPartFormValue()],
        currentMonthlyPayment: "120",
        oneTimeExtraRepayment: "1000",
        monthlyExtraRepayment: "50",
        strategy: "shortenTerm",
      },
      { annualInterestRate: 0, remainingTermYears: 35, normVersion: "fixture-zero" },
    );

    expect(view.isValid).toBe(true);
    if (!view.isValid) throw new Error("expected valid view");
    expect(view.result.newRequiredMonthlyPayment).toBe(120);
    expect(view.result.effectiveNewMonthlyPayment).toBe(170);
    expect(view.result.timelineAfter.months).toBeLessThan(view.result.timelineBefore.months);
    expect(view.normVersion).toBe("fixture-zero");
  });

  it("calculates a lower monthly payment scenario", () => {
    const view = calculateDuoExtraRepaymentView(
      {
        remainingDebt: "30000",
        repaymentRule: "SF35",
        duoRateYear: "2026",
        useDebtParts: false,
        debtParts: [createDuoDebtPartFormValue()],
        currentMonthlyPayment: "",
        oneTimeExtraRepayment: "5000",
        monthlyExtraRepayment: "",
        strategy: "lowerMonthlyPayment",
      },
      { annualInterestRate: 0, remainingTermYears: 35 },
    );

    expect(view.isValid).toBe(true);
    if (!view.isValid) throw new Error("expected valid view");
    expect(view.result.newRequiredMonthlyPayment).toBeLessThan(
      view.result.originalMonthlyPayment,
    );
    expect(view.result.interestSaved).toBe(0);
  });

  it("validates negative and empty input", () => {
    expect(validateDuoExtraRepaymentForm({
      remainingDebt: "",
      repaymentRule: "SF35",
      duoRateYear: "2026",
      useDebtParts: false,
      debtParts: [createDuoDebtPartFormValue()],
      currentMonthlyPayment: "",
      oneTimeExtraRepayment: "",
      monthlyExtraRepayment: "",
      strategy: "shortenTerm",
    }).remainingDebt).toBeDefined();

    expect(validateDuoExtraRepaymentForm({
      remainingDebt: "-1",
      repaymentRule: "SF35",
      duoRateYear: "2026",
      useDebtParts: false,
      debtParts: [createDuoDebtPartFormValue()],
      currentMonthlyPayment: "-2",
      oneTimeExtraRepayment: "-3",
      monthlyExtraRepayment: "-4",
      strategy: "shortenTerm",
    }).currentMonthlyPayment).toBeDefined();
  });

  it("builds chart data from central timeline points", () => {
    const view = calculateDuoExtraRepaymentView(createDuoExtraRepaymentDefaultValues(), {
      annualInterestRate: 0,
      remainingTermYears: 35,
    });

    expect(view.isValid).toBe(true);
    if (!view.isValid) throw new Error("expected valid view");
    expect(view.chart.labels.length).toBeGreaterThan(0);
    expect(view.chart.before.length).toBe(view.chart.labels.length);
    expect(view.chart.after.length).toBe(view.chart.labels.length);
  });

  it("supports extra repayment across debt parts with different rate years", () => {
    const partA = createDuoDebtPartFormValue(2026);
    const partB = createDuoDebtPartFormValue(2024);
    const view = calculateDuoExtraRepaymentView({
      remainingDebt: "",
      repaymentRule: "SF35",
      duoRateYear: "2026",
      useDebtParts: true,
      debtParts: [
        { ...partA, amount: "15000", rateYear: "2026" },
        { ...partB, amount: "10000", rateYear: "2024" },
      ],
      currentMonthlyPayment: "",
      oneTimeExtraRepayment: "2000",
      monthlyExtraRepayment: "",
      strategy: "shortenTerm",
    });

    expect(view.isValid).toBe(true);
    if (!view.isValid) throw new Error("expected valid view");
    expect(view.debtPortfolio.usesDebtParts).toBe(true);
    expect(view.debtPortfolio.parts).toHaveLength(2);
    expect(view.result.extraRepaymentUsed).toBe(2000);
    expect(view.result.timelineAfter.months).toBeLessThan(view.result.timelineBefore.months);
  });
});
