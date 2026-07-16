import { describe, expect, it } from "vitest";

import { calculateIndicativeMaxMortgage, calculateMortgageLoanPartSplit } from "@/lib/mortgage";

describe("calculateMortgageLoanPartSplit", () => {
  it("shows a useful split when a higher official rate band increases the capacity", () => {
    const result = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 80_000,
      annualMortgageRate: 4.99,
      mortgageTermYears: 30,
    });

    const split = calculateMortgageLoanPartSplit(result);

    expect(split.hasUsefulSplit).toBe(true);
    expect(split.shortFixedPart).not.toBeNull();
    expect(split.regularPart.calculationRate).toBe(result.breakdown.annualMortgageRateUsed);
    expect(split.regularPart.fixedRatePeriod).toBe("10y-or-longer");
    expect(split.shortFixedPart?.calculationRate).toBe(5);
    expect(split.shortFixedPart?.fixedRatePeriod).toBe("shorter-than-10y");
    expect(split.totalMortgage).toBeCloseTo(
      result.breakdown.higherMortgageOpportunity?.alternativeFinalMaxMortgage ?? result.finalMaxMortgage,
      2,
    );
    expect(split.totalMonthlyPayment).toBeCloseTo(
      split.regularPart.monthlyPayment + (split.shortFixedPart?.monthlyPayment ?? 0),
      2,
    );
  });

  it("returns a clear no-split message when there is no useful alternative", () => {
    const result = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 120_000,
      annualMortgageRate: 4,
      mortgageTermYears: 30,
      property: {
        propertyValue: 300_000,
        ltvPercentage: 100,
        purchasePrice: 325_000,
        marketValue: 300_000,
      },
      ownFunds: 60_000,
    });

    const split = calculateMortgageLoanPartSplit(result);

    expect(split.hasUsefulSplit).toBe(false);
    expect(split.shortFixedPart).toBeNull();
    expect(split.totalMortgage).toBe(result.finalMaxMortgage);
    expect(split.explanation).toContain("geen extra of zinvolle verdeling");
  });

  it("keeps the same central debt impact when studieschuld is present", () => {
    const result = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 65_000,
      annualMortgageRate: 4.1,
      mortgageTermYears: 30,
      studentLoan: {
        hasStudentLoan: true,
        status: "repaying",
        actualMonthlyPayment: 165,
      },
    });

    const split = calculateMortgageLoanPartSplit(result);

    expect(result.breakdown.studentLoanMonthlyImpact).toBeGreaterThan(0);
    expect(split.regularPart.amount).toBe(result.finalMaxMortgage);
    expect(split.totalMonthlyPayment).toBeGreaterThan(0);
  });
});
