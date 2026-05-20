import { describe, expect, it } from "vitest";
import { calculateZzpUurtarief } from "./logic";

describe("calculateZzpUurtarief", () => {
  it("calculates billable hours per year from weekly hours and active weeks", () => {
    const result = calculateZzpUurtarief({
      billableHoursPerWeek: 20,
      workingWeeksPerYear: 48,
      vacationWeeksPerYear: 6,
    });

    expect(result.activeWeeksPerYear).toBe(42);
    expect(result.billableHoursPerYear).toBe(840);
  });

  it("returns higher hourly rate for higher net target", () => {
    const base = calculateZzpUurtarief({
      targetNetMonthlyIncome: 2500,
      billableHoursPerWeek: 24,
      workingWeeksPerYear: 48,
      vacationWeeksPerYear: 6,
      taxReservePercent: 35,
    });
    const higher = calculateZzpUurtarief({
      targetNetMonthlyIncome: 4500,
      billableHoursPerWeek: 24,
      workingWeeksPerYear: 48,
      vacationWeeksPerYear: 6,
      taxReservePercent: 35,
    });

    expect(higher.requiredHourlyRate).toBeGreaterThan(base.requiredHourlyRate);
  });

  it("increases hourly rate when AOV, pension and costs are higher", () => {
    const lean = calculateZzpUurtarief({
      targetNetMonthlyIncome: 3500,
      monthlyAovPremium: 0,
      monthlyPensionReserve: 0,
      monthlyBusinessCosts: 100,
      billableHoursPerWeek: 24,
      workingWeeksPerYear: 48,
      vacationWeeksPerYear: 6,
    });
    const heavy = calculateZzpUurtarief({
      targetNetMonthlyIncome: 3500,
      monthlyAovPremium: 400,
      monthlyPensionReserve: 500,
      monthlyBusinessCosts: 700,
      billableHoursPerWeek: 24,
      workingWeeksPerYear: 48,
      vacationWeeksPerYear: 6,
    });

    expect(heavy.requiredHourlyRate).toBeGreaterThan(lean.requiredHourlyRate);
  });

  it("handles zero billable hours safely", () => {
    const result = calculateZzpUurtarief({
      targetNetMonthlyIncome: 3000,
      billableHoursPerWeek: 0,
      workingWeeksPerYear: 48,
      vacationWeeksPerYear: 6,
    });

    expect(result.billableHoursPerYear).toBe(0);
    expect(result.requiredHourlyRate).toBe(0);
    expect(
      result.warnings.some((warning) =>
        warning.toLowerCase().includes("declarabele uren"),
      ),
    ).toBe(true);
  });

  it("sanitizes negative input values", () => {
    const result = calculateZzpUurtarief({
      targetNetMonthlyIncome: -2000,
      monthlyBufferReserve: -100,
      monthlyPensionReserve: -50,
      pensionReservePercent: -10,
      monthlyAovPremium: -200,
      monthlyBusinessCosts: -300,
      billableHoursPerWeek: -10,
      workingWeeksPerYear: -20,
      vacationWeeksPerYear: -2,
      taxReservePercent: -25,
      grossAnnualSalaryComparison: -60000,
    });

    expect(result.requiredAnnualRevenue).toBeGreaterThanOrEqual(0);
    expect(result.requiredHourlyRate).toBeGreaterThanOrEqual(0);
    expect(result.billableHoursPerYear).toBeGreaterThanOrEqual(0);
  });

  it("never returns NaN or Infinity in key outputs", () => {
    const result = calculateZzpUurtarief({
      targetNetMonthlyIncome: 3200,
      monthlyBufferReserve: 300,
      monthlyPensionReserve: 250,
      monthlyAovPremium: 200,
      monthlyBusinessCosts: 500,
      billableHoursPerWeek: 22,
      workingWeeksPerYear: 48,
      vacationWeeksPerYear: 7,
      taxReservePercent: 37,
    });

    expect(Number.isFinite(result.billableHoursPerYear)).toBe(true);
    expect(Number.isFinite(result.requiredAnnualRevenue)).toBe(true);
    expect(Number.isFinite(result.requiredHourlyRate)).toBe(true);
    expect(Number.isFinite(result.annualTaxReserve)).toBe(true);
    expect(Number.isFinite(result.box1Reference.indicativeTaxOnRequiredRevenue)).toBe(
      true,
    );
  });
});
