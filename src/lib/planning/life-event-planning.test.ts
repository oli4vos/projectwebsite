import { describe, expect, it } from "vitest";
import { calculateBuyVsRent } from "@/lib/planning/buy-vs-rent";
import { calculateChild18Impact } from "@/lib/planning/child-18-impact";
import { calculateDebtPriority } from "@/lib/planning/debt-priority";

describe("life event planning helpers", () => {
  it("calculates buy-vs-rent month costs and stress test safely", () => {
    const result = calculateBuyVsRent({
      monthlyRent: 1500,
      purchasePrice: 400000,
      ownFunds: 30000,
      mortgageRate: 4,
      mortgageTermYears: 30,
      monthlyOwnerCosts: 250,
    });

    expect(result.estimatedBuyerCosts).toBe(24000);
    expect(result.ownFundsGap).toBe(0);
    expect(result.mortgagePrincipal).toBe(394000);
    expect(result.buyMonthlyCost).toBeGreaterThan(0);
    expect(result.stressBuyMonthlyCost).toBeGreaterThan(result.buyMonthlyCost);
  });

  it("keeps buy-vs-rent finite and non-negative for bad input", () => {
    const result = calculateBuyVsRent({
      monthlyRent: -1,
      purchasePrice: Number.NaN,
      ownFunds: -20,
      mortgageRate: Number.POSITIVE_INFINITY,
    });

    expect(result.monthlyRent).toBe(0);
    expect(result.purchasePrice).toBe(0);
    expect(result.buyMonthlyCost).toBe(0);
    expect(Number.isFinite(result.stressBuyMonthlyCost)).toBe(true);
  });

  it("orders expensive debt before flexible low-rate DUO debt", () => {
    const result = calculateDebtPriority({
      extraAmount: 1000,
      debts: [
        { kind: "duo", amount: 10000, interestRate: 2.1 },
        { kind: "creditCard", amount: 1500, interestRate: 18 },
      ],
    });

    expect(result.steps[0]?.kind).toBe("creditCard");
    expect(result.steps[1]?.kind).toBe("duo");
    expect(result.steps[0]?.allocatedAmount).toBe(1000);
    expect(result.steps[0]?.remainingAfterStep).toBe(0);
  });

  it("ignores empty debts and clamps negative values", () => {
    const result = calculateDebtPriority({
      extraAmount: -100,
      debts: [
        { kind: "bnpl", amount: 0, interestRate: 0 },
        { kind: "other", amount: -50, interestRate: Number.NaN },
      ],
    });

    expect(result.steps).toEqual([]);
    expect(result.ignoredCount).toBe(2);
    expect(result.extraAmount).toBe(0);
  });

  it("calculates child-turns-18 monthly and annual impact", () => {
    const result = calculateChild18Impact({
      childBenefitMonthly: 95,
      childBudgetMonthly: 120,
      healthInsuranceMonthly: 150,
      healthAllowanceMonthly: 120,
      studyCostsMonthly: 80,
      childContributionMonthly: 50,
    });

    expect(result.lostSupportMonthly).toBe(215);
    expect(result.newCostsMonthly).toBe(230);
    expect(result.offsetsMonthly).toBe(170);
    expect(result.netMonthlyImpact).toBe(275);
    expect(result.netAnnualImpact).toBe(3300);
  });
});
