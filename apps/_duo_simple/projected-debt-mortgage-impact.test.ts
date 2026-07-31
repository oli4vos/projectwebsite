import { describe, expect, it } from "vitest";
import { calculateProjectedDebtMortgageImpact } from "./projected-debt-mortgage-impact";

describe("indicative mortgage impact from projected DUO debt", () => {
  it("uses the latest central SF35 rate and 35-year statutory payment", () => {
    const result = calculateProjectedDebtMortgageImpact(30_000);

    expect(result).toMatchObject({
      debtAtStudyEnd: 30_000,
      duoRateYear: 2026,
      duoAnnualInterestRate: 2.33,
      duoRepaymentTermYears: 35,
      mortgageAnnualInterestRate: 4,
      mortgageTermYears: 30,
      mortgageGrossUpFactor: 1.25,
    });
    expect(result.statutoryMonthlyPayment).toBeGreaterThan(0);
    expect(result.indicativeMortgageSpaceReduction).toBeGreaterThan(0);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.assumptions)).toBe(true);
  });

  it("is deterministic and safely handles zero or negative debt", () => {
    expect(calculateProjectedDebtMortgageImpact(30_000)).toEqual(
      calculateProjectedDebtMortgageImpact(30_000),
    );
    expect(calculateProjectedDebtMortgageImpact(0)).toMatchObject({
      statutoryMonthlyPayment: 0,
      indicativeMortgageSpaceReduction: 0,
    });
    expect(calculateProjectedDebtMortgageImpact(-10_000)).toMatchObject({
      debtAtStudyEnd: 0,
      statutoryMonthlyPayment: 0,
      indicativeMortgageSpaceReduction: 0,
    });
  });

  it("shows a larger impact for a larger projected debt", () => {
    const lower = calculateProjectedDebtMortgageImpact(10_000);
    const higher = calculateProjectedDebtMortgageImpact(40_000);

    expect(higher.statutoryMonthlyPayment).toBeGreaterThan(lower.statutoryMonthlyPayment);
    expect(higher.indicativeMortgageSpaceReduction).toBeGreaterThan(
      lower.indicativeMortgageSpaceReduction,
    );
  });
});
