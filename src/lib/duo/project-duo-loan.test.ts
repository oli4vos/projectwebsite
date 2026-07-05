import { describe, expect, it } from "vitest";
import { getDuoRateForRule } from "@/lib/financial-constants";
import { projectDuoLoan } from "@/lib/duo";

const ZERO_RATE_CONTEXT = {
  calculationMonth: "2026-01",
  duoRateVersion: "fixture-zero",
  getAnnualInterestRateForYear: () => 0,
};

const FIXED_RATE_CONTEXT = {
  calculationMonth: "2026-01",
  duoRateVersion: "fixture-12-percent",
  getAnnualInterestRateForYear: () => 12,
};

describe("projectDuoLoan", () => {
  it("counts the current month and last loan month inclusively", () => {
    const result = projectDuoLoan(
      {
        currentDebt: 0,
        monthlyLoanAmount: 300,
        expectedLastLoanMonth: "2026-01",
      },
      ZERO_RATE_CONTEXT,
    );

    expect(result.borrowingMonths).toBe(1);
    expect(result.futurePrincipalBorrowed).toBe(300);
    expect(result.debtAtLastLoanMonth).toBe(300);
  });

  it("handles zero monthly borrowing while interest keeps accruing on existing debt", () => {
    const result = projectDuoLoan(
      {
        currentDebt: 1_000,
        monthlyLoanAmount: 0,
        expectedLastLoanMonth: "2026-12",
      },
      FIXED_RATE_CONTEXT,
    );

    expect(result.futurePrincipalBorrowed).toBe(0);
    expect(result.interestDuringBorrowingPhase).toBeGreaterThan(0);
    expect(result.debtAtLastLoanMonth).toBeGreaterThan(1_000);
  });

  it("projects 300 euro per month for 12 months without interest", () => {
    const result = projectDuoLoan(
      {
        currentDebt: 1_000,
        monthlyLoanAmount: 300,
        expectedLastLoanMonth: "2026-12",
      },
      ZERO_RATE_CONTEXT,
    );

    expect(result.borrowingMonths).toBe(12);
    expect(result.futurePrincipalBorrowed).toBe(3_600);
    expect(result.debtAtLastLoanMonth).toBe(4_600);
    expect(result.debtAtRepaymentStart).toBe(4_600);
    expect(result.repaymentTermMonths).toBe(420);
    expect(result.theoreticalMonthlyPayment).toBeCloseTo(10.95, 2);
  });

  it("projects 600 euro per month for 36 months and includes borrowing interest", () => {
    const result = projectDuoLoan(
      {
        currentDebt: 0,
        monthlyLoanAmount: 600,
        expectedLastLoanMonth: "2028-12",
      },
      FIXED_RATE_CONTEXT,
    );

    expect(result.borrowingMonths).toBe(36);
    expect(result.futurePrincipalBorrowed).toBe(21_600);
    expect(result.interestDuringBorrowingPhase).toBeGreaterThan(0);
    expect(result.debtAtLastLoanMonth).toBeGreaterThan(21_600);
  });

  it("handles an existing debt plus future monthly borrowing", () => {
    const result = projectDuoLoan(
      {
        currentDebt: 8_000,
        monthlyLoanAmount: 300,
        expectedLastLoanMonth: "2026-12",
      },
      ZERO_RATE_CONTEXT,
    );

    expect(result.debtAtLastLoanMonth).toBe(11_600);
    expect(result.futurePrincipalBorrowed).toBe(3_600);
  });

  it("adds monthly interest during the grace period before repayment starts", () => {
    const result = projectDuoLoan(
      {
        currentDebt: 10_000,
        monthlyLoanAmount: 0,
        expectedLastLoanMonth: "2026-08",
      },
      FIXED_RATE_CONTEXT,
    );

    expect(result.repaymentStartMonth).toBe("2029-01");
    expect(result.gracePeriodMonths).toBe(28);
    expect(result.interestDuringGracePeriod).toBeGreaterThan(0);
    expect(result.debtAtRepaymentStart).toBeGreaterThan(result.debtAtLastLoanMonth);
  });

  it("uses 1 January after two full calendar years for January and December endings", () => {
    const january = projectDuoLoan(
      {
        currentDebt: 1_000,
        monthlyLoanAmount: 0,
        expectedLastLoanMonth: "2026-01",
      },
      ZERO_RATE_CONTEXT,
    );
    const december = projectDuoLoan(
      {
        currentDebt: 1_000,
        monthlyLoanAmount: 0,
        expectedLastLoanMonth: "2026-12",
      },
      ZERO_RATE_CONTEXT,
    );

    expect(january.repaymentStartMonth).toBe("2029-01");
    expect(january.gracePeriodMonths).toBe(35);
    expect(december.repaymentStartMonth).toBe("2029-01");
    expect(december.gracePeriodMonths).toBe(24);
  });

  it("uses an annuity payment over 420 months", () => {
    const result = projectDuoLoan(
      {
        currentDebt: 42_000,
        monthlyLoanAmount: 0,
        expectedLastLoanMonth: "2026-01",
      },
      ZERO_RATE_CONTEXT,
    );

    expect(result.repaymentTermMonths).toBe(420);
    expect(result.theoreticalMonthlyPayment).toBe(100);
    expect(result.totalRepayment).toBe(42_000);
  });

  it("uses current central DUO rate and norm version in production mode", () => {
    const result = projectDuoLoan({
      currentDebt: 10_000,
      monthlyLoanAmount: 100,
      expectedLastLoanMonth: "2026-01",
    }, {
      calculationMonth: "2026-01",
    });

    expect(result.projectedAnnualInterestRate).toBe(getDuoRateForRule("SF35", 2026));
    expect(result.normVersion).toContain("2026");
  });

  it("does not call the mortgage calculator when mortgage impact is disabled", () => {
    const result = projectDuoLoan(
      {
        currentDebt: 10_000,
        monthlyLoanAmount: 300,
        expectedLastLoanMonth: "2026-12",
        includeMortgageImpact: false,
      },
      {
        ...ZERO_RATE_CONTEXT,
        calculateMortgageCapacityReduction: () => {
          throw new Error("mortgage calculator should not be called");
        },
      },
    );

    expect(result.mortgageImpact).toBeUndefined();
  });

  it("fills mortgage impact only when enabled and compares stop-now with borrowing", () => {
    const result = projectDuoLoan(
      {
        currentDebt: 10_000,
        monthlyLoanAmount: 300,
        expectedLastLoanMonth: "2026-12",
        includeMortgageImpact: true,
      },
      {
        ...ZERO_RATE_CONTEXT,
        calculateMortgageCapacityReduction: (monthlyPayment) => monthlyPayment * 100,
      },
    );

    expect(result.mortgageImpact).toBeDefined();
    expect(result.mortgageImpact?.reductionKeepBorrowing).toBeGreaterThan(
      result.mortgageImpact?.reductionStopNow ?? 0,
    );
    expect(result.mortgageImpact?.difference).toBeGreaterThan(0);
  });

  it("sanitizes negative amounts defensively", () => {
    const result = projectDuoLoan(
      {
        currentDebt: -10_000,
        monthlyLoanAmount: -300,
        expectedLastLoanMonth: "2026-01",
      },
      ZERO_RATE_CONTEXT,
    );

    expect(result.debtAtRepaymentStart).toBe(0);
    expect(result.theoreticalMonthlyPayment).toBe(0);
    expect(result.futurePrincipalBorrowed).toBe(0);
  });

  it("keeps required assumptions in the result", () => {
    const result = projectDuoLoan(
      {
        currentDebt: 1_000,
        monthlyLoanAmount: 100,
        expectedLastLoanMonth: "2026-01",
      },
      ZERO_RATE_CONTEXT,
    );

    expect(result.assumptions.join(" ")).toContain("huidige DUO-rentepercentage");
    expect(result.assumptions.join(" ")).toContain("draagkracht");
  });
});
