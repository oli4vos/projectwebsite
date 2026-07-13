import { describe, expect, it } from "vitest";
import {
  applyExtraRepaymentToDuoDebtPortfolio,
  calculateDuoDebtPortfolio,
  calculateDuoExtraRepaymentProjection,
  calculateDuoMonthlyPaymentAfterExtraRepayment,
  calculateExtraRepaymentVsInvesting,
  calculateRemainingDebtAfterExtraRepayment,
  calculateStatutoryDuoMonthlyPayment,
  determineRelevantDuoPayment,
} from "./calculations";

describe("DUO calculations", () => {
  it("calculates a lower SF35 monthly payment than SF15 for similar debt", () => {
    const sf35 = calculateStatutoryDuoMonthlyPayment({
      repaymentRule: "SF35",
      remainingDebt: 30000,
      annualInterestRate: 2.33,
      remainingTermYears: 35,
    });
    const sf15 = calculateStatutoryDuoMonthlyPayment({
      repaymentRule: "SF15",
      remainingDebt: 30000,
      annualInterestRate: 2.29,
      remainingTermYears: 15,
    });

    expect(sf35).toBeGreaterThan(0);
    expect(sf15).toBeGreaterThan(sf35);
  });

  it("supports zero interest PMT", () => {
    const payment = calculateStatutoryDuoMonthlyPayment({
      repaymentRule: "SF35",
      remainingDebt: 12000,
      annualInterestRate: 0,
      remainingTermYears: 10,
    });

    expect(payment).toBeCloseTo(100, 2);
  });

  it("returns 0 payment for 0 debt", () => {
    const payment = calculateStatutoryDuoMonthlyPayment({
      repaymentRule: "SF35",
      remainingDebt: 0,
      annualInterestRate: 2.33,
      remainingTermYears: 35,
    });

    expect(payment).toBe(0);
  });

  it("sanitizes negative input and never returns NaN/Infinity", () => {
    const payment = calculateStatutoryDuoMonthlyPayment({
      repaymentRule: "SF35",
      remainingDebt: -1000,
      annualInterestRate: -2,
      remainingTermYears: -5,
    });

    expect(Number.isFinite(payment)).toBe(true);
    expect(payment).toBeGreaterThanOrEqual(0);
  });

  it("uses future statutory payment in grace period and warns", () => {
    const result = determineRelevantDuoPayment({
      situation: "gracePeriod",
      repaymentRule: "SF35",
      currentMonthlyPayment: 0,
      remainingDebt: 30000,
      annualInterestRate: 2.33,
      remainingTermYears: 35,
    });

    expect(result.primaryMonthlyPayment).toBeGreaterThan(0);
    expect(
      result.warnings.some((warning) =>
        warning.toLowerCase().includes("straks"),
      ),
    ).toBe(true);
  });

  it("handles income-based reduction with optimistic vs conservative split", () => {
    const result = determineRelevantDuoPayment({
      situation: "incomeBasedReduction",
      repaymentRule: "SF35",
      currentMonthlyPayment: 75,
      statutoryMonthlyPayment: 150,
      remainingDebt: 30000,
      annualInterestRate: 2.33,
      remainingTermYears: 35,
    });

    expect(result.optimisticMonthlyPayment).toBe(75);
    expect(result.conservativeMonthlyPayment).toBeGreaterThanOrEqual(150);
    expect(result.primaryMonthlyPayment).toBe(result.conservativeMonthlyPayment);
    expect(
      result.warnings.some((warning) =>
        warning.toLowerCase().includes("draagkracht"),
      ),
    ).toBe(true);
  });

  it("keeps payment pause impact non-zero in primary scenario", () => {
    const result = determineRelevantDuoPayment({
      situation: "paymentPause",
      repaymentRule: "SF35",
      currentMonthlyPayment: 0,
      remainingDebt: 30000,
      annualInterestRate: 2.33,
      remainingTermYears: 35,
    });

    expect(result.primaryMonthlyPayment).toBeGreaterThan(0);
    expect(result.optimisticMonthlyPayment).toBe(0);
    expect(
      result.warnings.some((warning) =>
        warning.toLowerCase().includes("betaalpauze"),
      ),
    ).toBe(true);
  });

  it("uses estimated payment for unknown situation and warns", () => {
    const result = determineRelevantDuoPayment({
      situation: "unknown",
      repaymentRule: "UNKNOWN",
      remainingDebt: 30000,
      annualInterestRate: 2.33,
      remainingTermYears: 35,
    });

    expect(result.primaryMonthlyPayment).toBeGreaterThan(0);
    expect(result.source).toBe("estimated");
    expect(
      result.warnings.some((warning) =>
        warning.toLowerCase().includes("controleer mijn duo"),
      ),
    ).toBe(true);
  });

  it("clamps extra repayment to debt and never returns negative debt", () => {
    expect(calculateRemainingDebtAfterExtraRepayment(5000, 10000)).toBe(0);

    const result = calculateDuoMonthlyPaymentAfterExtraRepayment({
      repaymentRule: "SF35",
      remainingDebt: 5000,
      annualInterestRate: 2.33,
      remainingTermYears: 35,
      extraRepaymentAmount: 10000,
    });

    expect(result.extraRepaymentUsed).toBe(5000);
    expect(result.newRemainingDebt).toBe(0);
    expect(result.newStatutoryMonthlyPayment).toBe(0);
  });

  it("shows lower monthly payment after extra repayment", () => {
    const result = calculateDuoMonthlyPaymentAfterExtraRepayment({
      repaymentRule: "SF35",
      remainingDebt: 30000,
      annualInterestRate: 2.33,
      remainingTermYears: 35,
      extraRepaymentAmount: 5000,
    });

    expect(result.newStatutoryMonthlyPayment).toBeLessThan(
      result.oldStatutoryMonthlyPayment,
    );
    expect(result.monthlyPaymentReduction).toBeGreaterThan(0);
  });

  it("projects extra DUO repayment with lower monthly payment strategy", () => {
    const result = calculateDuoExtraRepaymentProjection({
      repaymentRule: "SF35",
      remainingDebt: 30000,
      annualInterestRate: 2.33,
      remainingTermYears: 35,
      extraRepaymentAmount: 5000,
      strategy: "lowerMonthlyPayment",
      startDate: "2026-01-01",
    });

    expect(result.extraRepaymentUsed).toBe(5000);
    expect(result.newRemainingDebt).toBe(25000);
    expect(result.newRequiredMonthlyPayment).toBeLessThan(result.originalMonthlyPayment);
    expect(result.interestSaved).toBeGreaterThan(0);
    expect(result.timelineBefore.points.length).toBeGreaterThan(0);
    expect(result.timelineAfter.points.length).toBeGreaterThan(0);
  });

  it("projects extra DUO repayment with shorter term strategy and monthly extra", () => {
    const result = calculateDuoExtraRepaymentProjection({
      repaymentRule: "SF35",
      remainingDebt: 30000,
      annualInterestRate: 2.33,
      remainingTermYears: 35,
      monthlyPayment: 120,
      extraRepaymentAmount: 1000,
      extraMonthlyAmount: 50,
      strategy: "shortenTerm",
      startDate: "2026-01-01",
    });

    expect(result.newRequiredMonthlyPayment).toBe(120);
    expect(result.effectiveNewMonthlyPayment).toBe(170);
    expect(result.timelineAfter.months).toBeLessThan(result.timelineBefore.months);
    expect(result.payoffImpact.strategy).toBe("shortenTerm");
  });

  it("sanitizes invalid DUO extra repayment projection input", () => {
    const result = calculateDuoExtraRepaymentProjection({
      repaymentRule: "SF35",
      remainingDebt: -1,
      annualInterestRate: -2,
      remainingTermYears: -5,
      monthlyPayment: -10,
      extraRepaymentAmount: -100,
      extraMonthlyAmount: -50,
      strategy: "lowerMonthlyPayment",
    });

    expect(result.newRemainingDebt).toBe(0);
    expect(result.interestSaved).toBe(0);
    expect(result.timelineBefore.points).toHaveLength(0);
    expect(result.timelineAfter.points).toHaveLength(0);
  });

  it("compares extra repayment vs investing without invalid numbers", () => {
    const result = calculateExtraRepaymentVsInvesting({
      repaymentRule: "SF35",
      remainingDebt: 30000,
      annualDuoInterestRate: 2.33,
      remainingTermYears: 35,
      extraRepaymentAmount: 5000,
      expectedAnnualReturn: 5,
      investmentHorizonYears: 10,
    });

    expect(result.futureValueIfInvested).toBeGreaterThan(5000);
    expect(Number.isFinite(result.differenceInvestingVsRepayment)).toBe(true);
    expect(Number.isFinite(result.monthlyPaymentReduction)).toBe(true);
  });

  it("supports selecting an official historical DUO rate year for a single debt", () => {
    const currentRate = calculateStatutoryDuoMonthlyPayment({
      repaymentRule: "SF35",
      remainingDebt: 30000,
      duoRateYear: 2026,
      remainingTermYears: 35,
    });
    const historicalRate = calculateStatutoryDuoMonthlyPayment({
      repaymentRule: "SF35",
      remainingDebt: 30000,
      duoRateYear: 2023,
      remainingTermYears: 35,
    });

    expect(historicalRate).toBeLessThan(currentRate);
  });

  it("sums statutory DUO payments across debt parts with different rate years", () => {
    const portfolio = calculateDuoDebtPortfolio({
      repaymentRule: "SF35",
      remainingTermYears: 35,
      debtParts: [
        { label: "2024-deel", remainingDebt: 10000, rateYear: 2024 },
        { label: "2026-deel", remainingDebt: 15000, rateYear: 2026 },
      ],
    });

    expect(portfolio.usesDebtParts).toBe(true);
    expect(portfolio.totalDebt).toBe(25000);
    expect(portfolio.parts).toHaveLength(2);
    expect(portfolio.totalStatutoryMonthlyPayment).toBeCloseTo(
      portfolio.parts[0].statutoryMonthlyPayment + portfolio.parts[1].statutoryMonthlyPayment,
      2,
    );
  });

  it("applies an extra repayment to the highest-rate debt part first", () => {
    const allocation = applyExtraRepaymentToDuoDebtPortfolio({
      repaymentRule: "SF35",
      remainingTermYears: 35,
      debtParts: [
        { label: "laag", remainingDebt: 10000, rateYear: 2023 },
        { label: "hoog", remainingDebt: 8000, rateYear: 2025 },
      ],
      extraRepaymentAmount: 3000,
    });

    const highRatePart = allocation.parts.find((part) => part.label === "hoog");
    const lowRatePart = allocation.parts.find((part) => part.label === "laag");

    expect(highRatePart?.extraRepaymentApplied).toBe(3000);
    expect(lowRatePart?.extraRepaymentApplied).toBe(0);
    expect(allocation.newRemainingDebt).toBe(15000);
  });
});
