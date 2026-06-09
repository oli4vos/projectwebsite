import { describe, expect, it } from "vitest";
import { calculateFamilyLoan } from "@/lib/family-financing/family-loan";

describe("family loan engine", () => {
  it("calculates a normal annuity scenario", () => {
    const result = calculateFamilyLoan({
      principal: 1200,
      annualRate: 12,
      termYears: 1,
      repaymentType: "annuity",
    });

    expect(result.periods).toBe(12);
    expect(result.schedule).toHaveLength(12);
    expect(result.monthlyPayment).toBe(106.62);
    expect(result.schedule[0].interestPayment).toBe(12);
    expect(result.schedule[0].principalPayment).toBe(94.62);
    expect(result.schedule.at(-1)?.payment).toBe(106.6);
    expect(result.schedule.at(-1)?.closingBalance).toBe(0);
    expect(result.totalPrincipal).toBe(1200);
    expect(result.remainingDebt).toBe(0);
  });

  it("calculates a normal linear scenario", () => {
    const result = calculateFamilyLoan({
      principal: 1200,
      annualRate: 12,
      termYears: 1,
      repaymentType: "linear",
    });

    expect(result.periods).toBe(12);
    expect(result.schedule).toHaveLength(12);
    expect(result.schedule[0].principalPayment).toBe(100);
    expect(result.schedule[0].interestPayment).toBe(12);
    expect(result.schedule[0].payment).toBe(112);
    expect(result.schedule.at(-1)?.principalPayment).toBe(100);
    expect(result.schedule.at(-1)?.payment).toBe(101);
    expect(result.remainingDebt).toBe(0);
    expect(result.totalPrincipal).toBe(1200);
  });

  it("works when interest is 0%", () => {
    const result = calculateFamilyLoan({
      principal: 1200,
      annualRate: 0,
      termYears: 1,
      repaymentType: "annuity",
    });

    expect(result.monthlyPayment).toBe(100);
    expect(result.schedule[0].interestPayment).toBe(0);
    expect(result.schedule[0].principalPayment).toBe(100);
    expect(result.remainingDebt).toBe(0);
  });

  it("handles zero and negative input safely", () => {
    const zeroResult = calculateFamilyLoan({
      principal: 0,
      annualRate: 12,
      termYears: 1,
      repaymentType: "annuity",
    });

    const negativeResult = calculateFamilyLoan({
      principal: -1200,
      annualRate: -12,
      termYears: -1,
      repaymentType: "linear",
    });

    expect(zeroResult.schedule).toHaveLength(0);
    expect(zeroResult.remainingDebt).toBe(0);
    expect(negativeResult.schedule).toHaveLength(0);
    expect(negativeResult.remainingDebt).toBe(0);
  });

  it("keeps the first and last term aligned with the table", () => {
    const result = calculateFamilyLoan({
      principal: 2400,
      annualRate: 6,
      termYears: 2,
      repaymentType: "linear",
    });

    expect(result.schedule[0].period).toBe(1);
    expect(result.schedule[0].openingBalance).toBe(2400);
    expect(result.schedule.at(-1)?.period).toBe(24);
    expect(result.schedule.at(-1)?.closingBalance).toBe(0);
  });

  it("sums principal exactly to the original hoofdsom", () => {
    const annuity = calculateFamilyLoan({
      principal: 1200,
      annualRate: 12,
      termYears: 1,
      repaymentType: "annuity",
    });
    const linear = calculateFamilyLoan({
      principal: 1200,
      annualRate: 12,
      termYears: 1,
      repaymentType: "linear",
    });

    expect(annuity.schedule.reduce((sum, row) => sum + row.principalPayment, 0)).toBe(
      1200,
    );
    expect(linear.schedule.reduce((sum, row) => sum + row.principalPayment, 0)).toBe(
      1200,
    );
  });

  it("closes borrower and lender cashflows on the same totals", () => {
    const result = calculateFamilyLoan({
      principal: 1200,
      annualRate: 12,
      termYears: 1,
      repaymentType: "annuity",
    });

    expect(result.borrowerCashflow.totalPayments).toBe(result.lenderCashflow.totalPayments);
    expect(result.borrowerCashflow.totalInterest).toBe(result.lenderCashflow.totalInterest);
    expect(result.borrowerCashflow.totalPrincipal).toBe(result.lenderCashflow.totalPrincipal);
    expect(result.borrowerCashflow.endingDebt).toBe(result.lenderCashflow.endingDebt);
  });
});
