import { describe, expect, it } from "vitest";
import { calculateChild18Impact } from "./logic";

describe("calculateChild18Impact", () => {
  it("calculates net monthly and annual impact", () => {
    const result = calculateChild18Impact({
      childBenefitMonthly: 100,
      childBudgetMonthly: 150,
      healthInsuranceMonthly: 160,
      healthAllowanceMonthly: 120,
      studyCostsMonthly: 90,
      childContributionMonthly: 50,
    });

    expect(result.lostSupportMonthly).toBe(250);
    expect(result.newCostsMonthly).toBe(250);
    expect(result.offsetsMonthly).toBe(170);
    expect(result.netMonthlyImpact).toBe(330);
    expect(result.netAnnualImpact).toBe(3960);
  });

  it("sanitizes invalid input", () => {
    const result = calculateChild18Impact({
      childBenefitMonthly: -100,
      childBudgetMonthly: Number.NaN,
    });

    expect(result.netMonthlyImpact).toBe(0);
    expect(Number.isFinite(result.netAnnualImpact)).toBe(true);
  });
});
