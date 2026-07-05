import { describe, expect, it } from "vitest";
import {
  calculateDuoMonthlyPaymentView,
  createDuoMonthlyPaymentDefaultValues,
  validateDuoMonthlyPaymentForm,
} from "./logic";

describe("duo-maandbedrag logic", () => {
  it("calculates the statutory monthly DUO payment through the central engine", () => {
    const view = calculateDuoMonthlyPaymentView(
      {
        remainingDebt: "42000",
        repaymentRule: "SF35",
        assessmentIncome: "",
        householdSituation: "single",
      },
      { annualInterestRate: 0, remainingTermYears: 35, normVersion: "fixture-zero" },
    );

    expect(view.isValid).toBe(true);
    if (!view.isValid) throw new Error("expected valid view");
    expect(view.statutoryMonthlyPayment).toBe(100);
    expect(view.incomeBased).toBeUndefined();
    expect(view.normVersion).toBe("fixture-zero");
  });

  it("shows income-based payment only when assessment income is provided", () => {
    const view = calculateDuoMonthlyPaymentView(
      {
        remainingDebt: "42000",
        repaymentRule: "SF35",
        assessmentIncome: "30000",
        householdSituation: "single",
      },
      { annualInterestRate: 0, remainingTermYears: 35, normVersion: "fixture-zero" },
    );

    expect(view.isValid).toBe(true);
    if (!view.isValid) throw new Error("expected valid view");
    expect(view.incomeBased).toBeDefined();
    expect(view.duoMonthlyPaymentUsed).toBeLessThanOrEqual(view.statutoryMonthlyPayment);
    expect(view.warnings.join(" ")).toContain("inkomen van twee jaar terug");
  });

  it("validates negative and empty input", () => {
    expect(validateDuoMonthlyPaymentForm({
      remainingDebt: "",
      repaymentRule: "SF35",
      assessmentIncome: "",
      householdSituation: "single",
    }).remainingDebt).toBeDefined();

    expect(validateDuoMonthlyPaymentForm({
      remainingDebt: "-1",
      repaymentRule: "SF35",
      assessmentIncome: "-2",
      householdSituation: "single",
    }).assessmentIncome).toBeDefined();
  });

  it("provides realistic defaults", () => {
    const defaults = createDuoMonthlyPaymentDefaultValues();
    const view = calculateDuoMonthlyPaymentView(defaults, {
      annualInterestRate: 0,
      remainingTermYears: 35,
    });

    expect(view.isValid).toBe(true);
  });
});
