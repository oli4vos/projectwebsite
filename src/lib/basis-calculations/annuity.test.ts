import { describe, expect, it } from "vitest";
import {
  calculateAnnuityPayment,
  calculatePrincipalFromAnnuity,
  generateAnnuitySchedule,
  getNumberOfPeriods,
  summarizeSchedule,
  toRatePerPeriod,
} from "./annuity";

describe("annuity helpers", () => {
  it("computes annuity payment for known case", () => {
    const payment = calculateAnnuityPayment({
      principal: 100_000,
      annualRatePercent: 5,
      termYears: 30,
    });
    expect(payment).toBeCloseTo(536.82, 2);
  });

  it("computes principal from annuity for known case", () => {
    const principal = calculatePrincipalFromAnnuity({
      payment: 536.82,
      annualRatePercent: 5,
      termYears: 30,
    });
    expect(principal).toBeCloseTo(100_000, 0);
  });

  it("handles zero interest as linear division", () => {
    const payment = calculateAnnuityPayment({
      principal: 12_000,
      annualRatePercent: 0,
      termYears: 1,
    });
    const principal = calculatePrincipalFromAnnuity({
      payment: 1_000,
      annualRatePercent: 0,
      termYears: 1,
    });
    expect(payment).toBe(1_000);
    expect(principal).toBe(12_000);
  });

  it("builds a schedule ending at zero balance", () => {
    const payment = calculateAnnuityPayment({
      principal: 10_000,
      annualRatePercent: 6,
      termYears: 1,
    });
    const schedule = generateAnnuitySchedule({
      principal: 10_000,
      payment,
      annualRatePercent: 6,
      termYears: 1,
    });
    expect(schedule).toHaveLength(12);
    expect(schedule.at(-1)?.endBalance).toBe(0);
    const summary = summarizeSchedule(schedule);
    expect(summary.totalInterest).toBeGreaterThan(0);
  });

  it("exposes conversion helpers", () => {
    expect(toRatePerPeriod(6, 12)).toBeCloseTo(0.005, 6);
    expect(getNumberOfPeriods(30, 12)).toBe(360);
  });
});

