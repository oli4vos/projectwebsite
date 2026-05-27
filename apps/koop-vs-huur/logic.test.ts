import { describe, expect, it } from "vitest";
import { calculateBuyVsRent } from "./logic";

describe("calculateBuyVsRent", () => {
  it("calculates own-funds gap and monthly difference", () => {
    const result = calculateBuyVsRent({
      monthlyRent: 1400,
      purchasePrice: 350000,
      ownFunds: 10000,
      mortgageRate: 4,
      mortgageTermYears: 30,
      buyerCostsPercent: 6,
      monthlyOwnerCosts: 250,
    });

    expect(result.estimatedBuyerCosts).toBe(21000);
    expect(result.ownFundsGap).toBe(11000);
    expect(result.buyMonthlyCost).toBeGreaterThan(result.monthlyRent);
  });

  it("keeps output finite and non-negative", () => {
    const result = calculateBuyVsRent({
      monthlyRent: -100,
      purchasePrice: Number.NaN,
      mortgageRate: Number.POSITIVE_INFINITY,
    });

    expect(result.monthlyRent).toBe(0);
    expect(result.purchasePrice).toBe(0);
    expect(Number.isFinite(result.buyMonthlyCost)).toBe(true);
    expect(result.buyMonthlyCost).toBeGreaterThanOrEqual(0);
  });
});
