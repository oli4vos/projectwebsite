import { describe, expect, it } from "vitest";
import { createDuoDebtPartFormValue } from "@/lib/duo/debt-parts-form";
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
        duoRateYear: "2026",
        useDebtParts: false,
        debtParts: [createDuoDebtPartFormValue()],
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
        duoRateYear: "2026",
        useDebtParts: false,
        debtParts: [createDuoDebtPartFormValue()],
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
      duoRateYear: "2026",
      useDebtParts: false,
      debtParts: [createDuoDebtPartFormValue()],
      assessmentIncome: "",
      householdSituation: "single",
    }).remainingDebt).toBeDefined();

    expect(validateDuoMonthlyPaymentForm({
      remainingDebt: "-1",
      repaymentRule: "SF35",
      duoRateYear: "2026",
      useDebtParts: false,
      debtParts: [createDuoDebtPartFormValue()],
      assessmentIncome: "-2",
      householdSituation: "single",
    }).assessmentIncome).toBeDefined();
  });

  it("supports debt parts with separate DUO rate years", () => {
    const partA = createDuoDebtPartFormValue(2026);
    const partB = createDuoDebtPartFormValue(2024);
    const view = calculateDuoMonthlyPaymentView({
      remainingDebt: "",
      repaymentRule: "SF35",
      duoRateYear: "2026",
      useDebtParts: true,
      debtParts: [
        { ...partA, amount: "18000", rateYear: "2026" },
        { ...partB, amount: "9000", rateYear: "2024" },
      ],
      assessmentIncome: "",
      householdSituation: "single",
    });

    expect(view.isValid).toBe(true);
    if (!view.isValid) throw new Error("expected valid view");
    expect(view.debtPortfolio.usesDebtParts).toBe(true);
    expect(view.debtPortfolio.parts).toHaveLength(2);
    expect(view.remainingDebt).toBe(27000);
    expect(view.statutoryMonthlyPayment).toBeGreaterThan(0);
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
