import { describe, expect, it } from "vitest";

import { determineDuoMortgageAssessmentPayment } from "@/lib/duo/mortgage-assessment";

describe("DUO mortgage assessment payment", () => {
  it("uses the collected payment when it equals the statutory payment", () => {
    const result = determineDuoMortgageAssessmentPayment({
      situation: "collected-payment",
      collectedPayment: 125.5,
      statutoryPayment: 125.5,
    });

    expect(result.recommendedMonthlyAssessmentPayment).toBe(125.5);
    expect(result.basis).toBe("collectedPayment");
    expect(result.uncertainty).toBe("low");
  });

  it("prefers the statutory payment over temporary reductions and pauses", () => {
    for (const situation of [
      "temporary-reduction",
      "income-based-reduction",
      "payment-pause",
      "repayment-not-started",
    ] as const) {
      const result = determineDuoMortgageAssessmentPayment({
        situation,
        collectedPayment: 0,
        statutoryPayment: 144.1,
      });

      expect(result.recommendedMonthlyAssessmentPayment).toBe(144.1);
      expect(result.basis).toBe("statutoryPayment");
      expect(result.warnings).toContain(
        "temporary-or-zero-payment-may-not-be-accepted-as-assessment-payment",
      );
    }
  });

  it("ignores voluntary extra monthly payments for the structural assessment amount", () => {
    const result = determineDuoMortgageAssessmentPayment({
      situation: "voluntary-extra-payment",
      statutoryPayment: 120,
      voluntaryExtraPayment: 80,
    });

    expect(result.recommendedMonthlyAssessmentPayment).toBe(120);
    expect(result.reasonCode).toBe("voluntary-extra-payment-ignored");
    expect(result.userConfirmationRequired).toContain(
      "confirm-statutory-payment-after-voluntary-payments",
    );
  });

  it("requires confirmation when a principal repayment has not been processed by DUO", () => {
    const result = determineDuoMortgageAssessmentPayment({
      situation: "voluntary-principal-repayment",
      statutoryPayment: 90,
      voluntaryPrincipalRepayment: 5000,
      confirmsPrincipalRepaymentProcessedByDuo: false,
    });

    expect(result.reasonCode).toBe("processed-principal-repayment-required");
    expect(result.uncertainty).toBe("high");
    expect(result.userConfirmationRequired).toContain(
      "confirm-duo-has-recalculated-debt-or-statutory-payment",
    );
  });

  it("estimates a statutory payment from debt and rule when no DUO payment is supplied", () => {
    const result = determineDuoMortgageAssessmentPayment({
      situation: "unknown",
      repaymentRule: "SF35",
      remainingDebt: 30_000,
      annualInterestRate: 2.33,
      remainingTermYears: 35,
    });

    expect(result.basis).toBe("estimatedStatutoryPayment");
    expect(result.recommendedMonthlyAssessmentPayment).toBeCloseTo(104.53, 2);
    expect(result.warnings).toContain("estimated-statutory-payment-check-mijn-duo");
  });

  it("uses debt parts for a portfolio-level statutory total", () => {
    const result = determineDuoMortgageAssessmentPayment({
      situation: "debt-parts",
      repaymentRule: "SF35",
      remainingTermYears: 35,
      debtParts: [
        { label: "SF35 2026", remainingDebt: 20_000, annualInterestRate: 2.33 },
        { label: "SF35 2025", remainingDebt: 10_000, annualInterestRate: 2.21 },
      ],
    });

    expect(result.usedDebtParts).toBe(true);
    expect(result.basis).toBe("debtPartsStatutoryPayment");
    expect(result.recommendedMonthlyAssessmentPayment).toBeGreaterThan(0);
    expect(result.userConfirmationRequired).toContain(
      "confirm-debt-parts-match-mijn-duo",
    );
  });

  it("returns missing fields instead of inventing an assessment payment", () => {
    const result = determineDuoMortgageAssessmentPayment({
      situation: "unknown",
    });

    expect(result.basis).toBe("missingData");
    expect(result.recommendedMonthlyAssessmentPayment).toBe(0);
    expect(result.missingFields).toEqual(["remainingDebt", "repaymentRule"]);
  });
});
