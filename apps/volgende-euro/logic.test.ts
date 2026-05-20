import { describe, expect, it } from "vitest";
import { calculateVolgendeEuroPriorities } from "./logic";

describe("calculateVolgendeEuroPriorities", () => {
  it("prioritizes buffer when there is a clear buffer gap", () => {
    const result = calculateVolgendeEuroPriorities({
      year: 2026,
      extraAmount: 1000,
      monthlyFreeRoom: 200,
      currentBuffer: 1000,
      targetBuffer: 10000,
      hasExpensiveDebt: false,
      studentDebtAmount: 0,
      expectedAnnualReturn: 5,
      horizonYears: 10,
      riskProfile: "neutral",
    });

    expect(result.topRecommendation.key).toBe("buffer");
  });

  it("prioritizes expensive debt at high interest with no buffer gap", () => {
    const result = calculateVolgendeEuroPriorities({
      year: 2026,
      extraAmount: 1500,
      monthlyFreeRoom: 300,
      currentBuffer: 12000,
      targetBuffer: 12000,
      hasExpensiveDebt: true,
      expensiveDebtRate: 18,
      expensiveDebtAmount: 6000,
      studentDebtAmount: 0,
      expectedAnnualReturn: 4,
      horizonYears: 8,
      riskProfile: "neutral",
    });

    expect(result.topRecommendation.key).toBe("expensiveDebt");
  });

  it("increases investing priority with sufficient buffer and long horizon", () => {
    const result = calculateVolgendeEuroPriorities({
      year: 2026,
      extraAmount: 1000,
      monthlyFreeRoom: 400,
      currentBuffer: 20000,
      targetBuffer: 12000,
      hasExpensiveDebt: false,
      studentDebtAmount: 0,
      expectedAnnualReturn: 7,
      horizonYears: 20,
      riskProfile: "offensive",
    });

    const investing = result.priorities.find((item) => item.key === "freeInvesting");
    const buffer = result.priorities.find((item) => item.key === "buffer");

    expect(investing).toBeDefined();
    expect(buffer).toBeDefined();
    expect((investing?.score ?? 0) > (buffer?.score ?? 0)).toBe(true);
  });

  it("does not make extra student debt repayment top by default at low DUO rate", () => {
    const result = calculateVolgendeEuroPriorities({
      year: 2026,
      extraAmount: 1000,
      monthlyFreeRoom: 250,
      currentBuffer: 15000,
      targetBuffer: 12000,
      hasExpensiveDebt: false,
      studentDebtAmount: 30000,
      duoRate: 2.1,
      expectedAnnualReturn: 6,
      horizonYears: 15,
      riskProfile: "neutral",
    });

    expect(result.topRecommendation.key).not.toBe("studentDebtExtra");
  });

  it("includes pension option when jaarruimte is provided", () => {
    const result = calculateVolgendeEuroPriorities({
      year: 2026,
      extraAmount: 1000,
      monthlyFreeRoom: 250,
      currentBuffer: 18000,
      targetBuffer: 12000,
      hasExpensiveDebt: false,
      availableJaarruimte: 5000,
      studentDebtAmount: 0,
      expectedAnnualReturn: 5,
      horizonYears: 12,
      riskProfile: "neutral",
    });

    const pension = result.priorities.find(
      (item) => item.key === "pensionJaarruimte",
    );
    expect(pension).toBeDefined();
    expect((pension?.score ?? 0) > 0).toBe(true);
  });

  it("sanitizes negative input and avoids NaN/Infinity", () => {
    const result = calculateVolgendeEuroPriorities({
      year: 3026,
      extraAmount: -1000,
      monthlyFreeRoom: -300,
      currentBuffer: -5000,
      targetBuffer: -10000,
      hasExpensiveDebt: true,
      expensiveDebtRate: -8,
      expensiveDebtAmount: -7000,
      studentDebtAmount: -32000,
      duoRate: -2.33,
      mortgageRate: -4,
      availableJaarruimte: -3000,
      horizonYears: -12,
      expectedAnnualReturn: -6,
      hasHousingGoal: true,
      targetHomePrice: -400000,
      ownFunds: -20000,
      riskProfile: "neutral",
    });

    expect(Number.isFinite(result.duoContext.estimatedStatutoryMonthlyPayment)).toBe(
      true,
    );
    expect(result.duoContext.estimatedStatutoryMonthlyPayment).toBeGreaterThanOrEqual(0);
    expect(
      result.priorities.every(
        (item) =>
          Number.isFinite(item.score) &&
          item.score >= 0 &&
          item.score <= 100 &&
          Number.isFinite(result.year),
      ),
    ).toBe(true);
  });
});
