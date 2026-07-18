import { describe, expect, it, vi } from "vitest";

import { calculateIndicativeMaxMortgage } from "@/lib/mortgage/max-mortgage";
import { calculateSalaryBorrowingPower } from "@/lib/mortgage/salary-borrowing-power";
import type { MortgageMaxMortgageInput } from "@/lib/mortgage/types";

const baseInput: MortgageMaxMortgageInput = {
  grossAnnualHouseholdIncome: 60_000,
  annualMortgageRate: 4.5,
  fixedRatePeriodMonths: 120,
  mortgageTermYears: 30,
  liabilities: [],
};

describe("salary borrowing power", () => {
  it("builds stable salary increase scenarios through the central mortgage engine", () => {
    const calculateMortgage = vi.fn(calculateIndicativeMaxMortgage);
    const result = calculateSalaryBorrowingPower({
      baseMortgageInput: baseInput,
      customGrossAnnualIncome: 66_000,
      calculateMortgage,
    });

    expect(result.scenarios.map((scenario) => scenario.key)).toEqual([
      "current",
      "plus-100-month",
      "plus-250-month",
      "plus-500-month",
      "custom",
    ]);
    expect(result.scenarios[1].grossAnnualIncome).toBe(61_200);
    expect(result.scenarios[1].monthlyIncrease).toBe(100);
    expect(result.scenarios[4].annualIncrease).toBe(6000);
    expect(result.scenarios[1].maxMortgage).toBeGreaterThan(
      result.scenarios[0].maxMortgage,
    );
    expect(calculateMortgage).toHaveBeenCalledTimes(5);
  });

  it("returns a null per-100 figure when the custom scenario equals current income", () => {
    const result = calculateSalaryBorrowingPower({
      baseMortgageInput: baseInput,
      customGrossAnnualIncome: 60_000,
    });
    const custom = result.scenarios.find((scenario) => scenario.key === "custom");

    expect(custom?.additionalBorrowingPower).toBe(0);
    expect(custom?.additionalBorrowingPowerPer100GrossMonthly).toBeNull();
  });

  it("warns when the custom income is lower than the current income", () => {
    const result = calculateSalaryBorrowingPower({
      baseMortgageInput: baseInput,
      customGrossAnnualIncome: 30_000,
    });

    expect(result.warnings).toContain("custom-income-below-current-income");
    expect(
      result.scenarios.find((scenario) => scenario.key === "custom")
        ?.additionalBorrowingPower,
    ).toBeLessThan(0);
  });

  it("finds the gross income needed for a target mortgage", () => {
    const result = calculateSalaryBorrowingPower({
      baseMortgageInput: baseInput,
      targetMortgage: 300_000,
      search: {
        minGrossAnnualIncome: 40_000,
        maxGrossAnnualIncome: 120_000,
        tolerance: 50,
      },
    });

    expect(result.requiredIncome?.status).toBe("found");
    if (result.requiredIncome?.status === "found") {
      expect(result.requiredIncome.requiredGrossAnnualIncome).toBeGreaterThan(40_000);
      expect(result.requiredIncome.requiredGrossAnnualIncome).toBeLessThan(120_000);
      expect(result.requiredIncome.result.finalMaxMortgage).toBeGreaterThanOrEqual(300_000);
    }
  });

  it("reports target-above-maximum instead of extrapolating", () => {
    const result = calculateSalaryBorrowingPower({
      baseMortgageInput: baseInput,
      targetMortgage: 2_000_000,
      search: {
        minGrossAnnualIncome: 40_000,
        maxGrossAnnualIncome: 120_000,
      },
    });

    expect(result.requiredIncome).toMatchObject({
      status: "not-found",
      reason: "target-above-maximum",
    });
  });
});
