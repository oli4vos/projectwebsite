import { describe, expect, it } from "vitest";

import { calculateIndicativeMaxMortgage } from "@/lib/mortgage";

describe("calculateIndicativeMaxMortgage", () => {
  it("calculates a normal income-based maximum mortgage", () => {
    const result = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 80_000,
      annualMortgageRate: 4.5,
      mortgageTermYears: 30,
      property: {
        purchasePrice: 350_000,
        marketValue: 350_000,
      },
      ownFunds: 30_000,
    });

    expect(result.maxMortgageFinal).toBeGreaterThan(0);
    expect(result.breakdown.maxMortgageByIncome).toBe(result.maxMortgageFinal);
    expect(result.limitingFactor).toBe("income");
    expect(result.warnings.some((warning) => warning.code === "INDICATIVE_ONLY")).toBe(true);
  });

  it("uses the AFM stress rate for short fixed periods when higher", () => {
    const result = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 75_000,
      annualMortgageRate: 3.5,
      fixedRatePeriodMonths: 60,
      afmStressAnnualRate: 5,
      mortgageTermYears: 30,
    });

    expect(result.breakdown.testRateSource).toBe("afm_stress_rate");
    expect(result.breakdown.testRateUsed).toBe(5);
  });

  it("applies student loan gross-up and blocks missing loan payments", () => {
    const result = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 65_000,
      annualMortgageRate: 4.1,
      mortgageTermYears: 30,
      studentLoan: {
        hasStudentLoan: true,
        status: "payment_pause",
      },
    });

    expect(result.confidence).toBe("low");
    expect(result.warnings.some((warning) => warning.code === "MISSING_STUDENT_LOAN_PAYMENT")).toBe(true);
  });

  it("limits by LTV when the market value is lower than income capacity", () => {
    const result = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 120_000,
      annualMortgageRate: 4,
      mortgageTermYears: 30,
      property: {
        purchasePrice: 325_000,
        marketValue: 300_000,
      },
      ownFunds: 60_000,
    });

    expect(result.limitingFactor).toBe("ltv");
    expect(result.maxMortgageFinal).toBe(result.breakdown.maxMortgageByLtv);
  });
});
