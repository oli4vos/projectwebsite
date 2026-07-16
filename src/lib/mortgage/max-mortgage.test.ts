import { describe, expect, it } from "vitest";

import { calculateIndicativeMaxMortgage } from "@/lib/mortgage";

describe("calculateIndicativeMaxMortgage", () => {
  it("splits income capacity from collateral and keeps own funds out of the income cap", () => {
    const withoutOwnFunds = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 100_000,
      annualMortgageRate: 4.1,
      mortgageTermYears: 30,
    });
    const withOwnFunds = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 100_000,
      annualMortgageRate: 4.1,
      mortgageTermYears: 30,
      ownFunds: 50_000,
    });

    expect(withOwnFunds.maxMortgageByIncome).toBe(withoutOwnFunds.maxMortgageByIncome);
    expect(withOwnFunds.maxMortgageByCollateral).toBeNull();
    expect(withOwnFunds.finalMaxMortgage).toBe(withoutOwnFunds.finalMaxMortgage);
    expect(withOwnFunds.maxHomeBudget).toBeNull();
    expect(withOwnFunds.debug.ownFunds).toBe(50_000);
    expect(withOwnFunds.fundingGap).toBe(0);
  });

  it("does not impose an artificial collateral cap when no property value is known", () => {
    const result = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 80_000,
      annualMortgageRate: 4.5,
      mortgageTermYears: 30,
      ownFunds: 30_000,
    });

    expect(result.maxMortgageByCollateral).toBeNull();
    expect(result.finalMaxMortgage).toBe(result.maxMortgageByIncome);
    expect(result.limitingFactorDetailed).toBe("income");
    expect(result.limitingFactor).toBe("income");
  });

  it("limits the final mortgage by collateral when property value is known", () => {
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

    expect(result.maxMortgageByCollateral).toBeGreaterThan(0);
    expect(result.finalMaxMortgage).toBeLessThanOrEqual(result.maxMortgageByIncome);
    expect(result.finalMaxMortgage).toBeLessThanOrEqual(result.maxMortgageByCollateral ?? 0);
    expect(result.limitingFactorDetailed).toBe("collateral");
    expect(result.limitingFactor).toBe("ltv");
    expect(result.breakdown.maxMortgageByLtv).toBe(result.maxMortgageByCollateral);
    expect(result.maxHomeBudget).toBeGreaterThan(0);
  });

  it("does not add the energy-label income allowance to the property-value limit", () => {
    const result = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 80_000,
      annualMortgageRate: 4.5,
      mortgageTermYears: 30,
      property: {
        propertyValue: 350_000,
        marketValue: 350_000,
        purchasePrice: 350_000,
        ltvPercentage: 100,
        energyLabel: "A",
        energySavingMeasuresAmount: 0,
      },
    });

    expect(result.breakdown.energyLabelAllowance).toBe(10_000);
    expect(result.breakdown.energySavingAllowance).toBe(0);
    expect(result.breakdown.baseMaxMortgageByLtv).toBe(350_000);
    expect(result.maxMortgageByIncome).toBe(
      result.breakdown.baseMaxMortgageByIncome + 10_000,
    );
    expect(result.maxMortgageByCollateral).toBe(350_000);
  });

  it("only adds actual eligible energy-saving measures to the LTV limit", () => {
    const result = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 120_000,
      annualMortgageRate: 4.5,
      mortgageTermYears: 30,
      property: {
        propertyValue: 350_000,
        marketValue: 350_000,
        purchasePrice: 350_000,
        ltvPercentage: 100,
        energyLabel: "A",
        energySavingMeasuresAmount: 18_000,
      },
    });

    expect(result.breakdown.energyLabelAllowance).toBe(10_000);
    expect(result.breakdown.energySavingAllowance).toBe(10_000);
    expect(result.breakdown.baseMaxMortgageByLtv).toBe(350_000);
    expect(result.maxMortgageByCollateral).toBe(360_000);
  });

  it("keeps the expected collateral and budget split visible in the debug output", () => {
    const result = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 95_000,
      annualMortgageRate: 4.1,
      mortgageTermYears: 30,
      monthlyFinancialObligations: 250,
      property: {
        propertyValue: 380_000,
        ltvPercentage: 95,
        purchasePrice: 380_000,
      },
      ownFunds: 20_000,
    });

    expect(result.debug.toetsinkomen).toBe(95_000);
    expect(result.debug.maxAnnualHousingCost).toBeGreaterThan(0);
    expect(result.debug.maxMonthlyHousingCost).toBeGreaterThan(result.debug.availableMortgageMonthlyCost);
    expect(result.debug.monthlyObligations).toBe(250);
    expect(result.debug.collateralValue).toBeCloseTo(361_000, 2);
    expect(result.debug.ltvPercentage).toBe(95);
    expect(result.maxHomeBudget).toBeCloseTo(
      result.finalMaxMortgage + 20_000 - result.breakdown.buyerCostsEstimate,
      2,
    );
  });

  it("reduces mortgage room when the rate rises and exposes the annuity factor driver", () => {
    const rates = [3, 3.8, 4.5, 5.2, 5.8];
    const results = rates.map((annualMortgageRate) =>
      calculateIndicativeMaxMortgage({
        grossAnnualHouseholdIncome: 45_000,
        annualMortgageRate,
        mortgageTermYears: 30,
        incomeHousingCostRatio: 24,
      }),
    );

    for (let index = 1; index < results.length; index += 1) {
      expect(results[index].maxMortgageByIncome).toBeLessThan(results[index - 1].maxMortgageByIncome);
      expect(results[index].debug.annuityFactor).toBeLessThan(results[index - 1].debug.annuityFactor);
      expect(results[index].debug.availableMortgageMonthlyCost).toBe(results[0].debug.availableMortgageMonthlyCost);
    }
  });

  it("uses the AFM test rate for financing-load lookup and principal conversion when fixed for less than ten years", () => {
    const result = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 60_000,
      annualMortgageRate: 3.8,
      fixedRatePeriodMonths: 60,
      afmStressAnnualRate: 5,
      mortgageTermYears: 30,
    });

    expect(result.breakdown.testRateUsed).toBe(5);
    expect(result.breakdown.testRateSource).toBe("afm_stress_rate");
    expect(result.breakdown.annualHousingCostRatio).toBe(24.6);
    expect(result.debug.interestRate).toBe(5);
    expect(result.breakdown.financingLoadTableYear).toBe(2026);
    expect(result.breakdown.financingLoadTableVersion).toContain("2026");
  });

  it("tracks student-loan impacts separately from generic obligations", () => {
    const withoutLoan = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 65_000,
      annualMortgageRate: 4.1,
      mortgageTermYears: 30,
    });
    const withLoan = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 65_000,
      annualMortgageRate: 4.1,
      mortgageTermYears: 30,
      studentLoan: {
        hasStudentLoan: true,
        status: "repaying",
        actualMonthlyPayment: 165,
      },
    });

    expect(withLoan.maxMortgageByIncome).toBeLessThan(withoutLoan.maxMortgageByIncome);
    expect(withLoan.breakdown.studentLoanMonthlyImpact).toBeGreaterThan(0);
    expect(withLoan.breakdown.studentLoanBorrowingCapacityImpact).toBeCloseTo(
      withoutLoan.maxMortgageByIncome - withLoan.maxMortgageByIncome,
      1,
    );
    expect(withoutLoan.breakdown.studentLoanBorrowingCapacityImpact).toBe(0);
    expect(withLoan.debug.monthlyObligations).toBeGreaterThan(0);
  });

  it("handles a missing student-loan amount defensively", () => {
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

  it("uses the explicit student-debt abstraction when provided", () => {
    const normativeDebt = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 70_000,
      annualMortgageRate: 4.1,
      mortgageTermYears: 30,
      studentDebtNormativeMonthlyPayment: 200,
      studentDebtRegime: "SF35",
    });
    const actualDebt = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 70_000,
      annualMortgageRate: 4.1,
      mortgageTermYears: 30,
      studentDebtMonthlyPayment: 100,
      studentDebtRegime: "unknown",
    });

    expect(normativeDebt.debug.monthlyObligations).toBeGreaterThan(0);
    expect(actualDebt.debug.monthlyObligations).toBeGreaterThan(0);
    expect(normativeDebt.maxMortgageByIncome).toBeLessThan(actualDebt.maxMortgageByIncome);
  });

  it("exposes the old public result fields as backward-compatible aliases", () => {
    const result = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 80_000,
      annualMortgageRate: 4.1,
      mortgageTermYears: 30,
      property: {
        propertyValue: 350_000,
        ltvPercentage: 100,
      },
      ownFunds: 30_000,
    });

    expect(result.maxMortgageFinal).toBe(result.finalMaxMortgage);
    expect(result.breakdown.maxMortgageByIncome).toBe(result.maxMortgageByIncome);
    expect(result.breakdown.maxMortgageByLtv).toBe(result.maxMortgageByCollateral);
  });

  it("flags a higher mortgage when a higher official rate band increases the final result", () => {
    const result = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 80_000,
      annualMortgageRate: 4.99,
      mortgageTermYears: 30,
    });

    expect(result.breakdown.higherMortgageOpportunity).toBeDefined();
    expect(result.breakdown.higherMortgageOpportunity?.higherMortgagePossible).toBe(true);
    expect(result.breakdown.higherMortgageOpportunity?.alternativeTestRate).toBeGreaterThan(
      result.breakdown.higherMortgageOpportunity?.referenceTestRate ?? 0,
    );
    expect(result.breakdown.higherMortgageOpportunity?.alternativeFinalMaxMortgage).toBeGreaterThan(
      result.finalMaxMortgage,
    );
    expect(result.breakdown.higherMortgageOpportunity?.increaseInMaxMortgage).toBeGreaterThan(0);
    expect(result.breakdown.loanPartSplit?.hasUsefulSplit).toBe(true);
    expect(result.breakdown.loanPartSplit?.shortFixedPart?.calculationRate).toBe(5);
    expect(result.breakdown.loanPartSplit?.totalMortgage).toBeGreaterThan(result.finalMaxMortgage);
  });

  it("keeps the higher-rate check silent when collateral already limits the result", () => {
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

    expect(result.breakdown.higherMortgageOpportunity).toBeUndefined();
  });
});
