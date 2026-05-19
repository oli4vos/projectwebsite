import { describe, expect, it } from "vitest";
import { calculateJaarruimteVsVrijBeleggen } from "./logic";

describe("calculateJaarruimteVsVrijBeleggen", () => {
  it("clamps contribution to available jaarruimte", () => {
    const result = calculateJaarruimteVsVrijBeleggen({
      year: 2026,
      grossAnnualIncome: 60000,
      availableJaarruimte: 3000,
      plannedContribution: 7000,
      expectedAnnualReturn: 5,
      horizonYears: 15,
    });

    expect(result.contributionEligibleForJaarruimte).toBe(3000);
    expect(result.contributionOutsideJaarruimte).toBe(4000);
  });

  it("handles zero contribution", () => {
    const result = calculateJaarruimteVsVrijBeleggen({
      year: 2026,
      grossAnnualIncome: 50000,
      availableJaarruimte: 8000,
      plannedContribution: 0,
      expectedAnnualReturn: 5,
      horizonYears: 20,
    });

    expect(result.scenarioPension.taxBenefitNow).toBe(0);
    expect(result.scenarioFreeInvesting.futureValueGross).toBe(0);
  });

  it("sanitizes negative values and avoids NaN/Infinity", () => {
    const result = calculateJaarruimteVsVrijBeleggen({
      year: 3026,
      grossAnnualIncome: -50000,
      availableJaarruimte: -9000,
      plannedContribution: -500,
      currentInvestableAssets: -100,
      expectedAnnualReturn: -3,
      horizonYears: -10,
      overrideCurrentTaxRate: -40,
      expectedTaxRateAtPayout: -15,
    });

    expect(Number.isFinite(result.scenarioPension.futureValueNetIndicative)).toBe(true);
    expect(Number.isFinite(result.scenarioFreeInvesting.futureValueNetIndicative)).toBe(true);
    expect(result.contributionEligibleForJaarruimte).toBeGreaterThanOrEqual(0);
    expect(result.contributionRequested).toBeGreaterThanOrEqual(0);
  });

  it("returns positive box1 benefit for positive income and contribution", () => {
    const result = calculateJaarruimteVsVrijBeleggen({
      year: 2026,
      grossAnnualIncome: 70000,
      availableJaarruimte: 10000,
      plannedContribution: 5000,
      expectedAnnualReturn: 5,
      horizonYears: 20,
    });

    expect(result.scenarioPension.taxBenefitNow).toBeGreaterThan(0);
  });

  it("grows free investing pot with positive return", () => {
    const result = calculateJaarruimteVsVrijBeleggen({
      year: 2026,
      grossAnnualIncome: 55000,
      availableJaarruimte: 5000,
      plannedContribution: 5000,
      expectedAnnualReturn: 6,
      horizonYears: 10,
    });

    expect(result.scenarioFreeInvesting.futureValueGross).toBeGreaterThan(
      result.scenarioFreeInvesting.contribution,
    );
  });

  it("keeps free investing gross scenario unchanged when box3 effect is off", () => {
    const withoutBox3 = calculateJaarruimteVsVrijBeleggen({
      year: 2026,
      grossAnnualIncome: 55000,
      availableJaarruimte: 6000,
      plannedContribution: 6000,
      expectedAnnualReturn: 5,
      horizonYears: 15,
      includeBox3Effect: false,
    });

    expect(withoutBox3.scenarioFreeInvesting.additionalBox3TaxIndicative).toBeUndefined();
    expect(withoutBox3.scenarioFreeInvesting.futureValueNetIndicative).toBe(
      withoutBox3.scenarioFreeInvesting.futureValueGross,
    );
  });

  it("never returns NaN or Infinity", () => {
    const result = calculateJaarruimteVsVrijBeleggen({
      grossAnnualIncome: 40000,
      plannedContribution: 2500,
      availableJaarruimte: 2500,
      expectedAnnualReturn: 4,
      horizonYears: 25,
      includeBox3Effect: true,
    });

    expect(Number.isFinite(result.scenarioPension.taxBenefitNow)).toBe(true);
    expect(Number.isFinite(result.scenarioPension.futureValueNetIndicative)).toBe(true);
    expect(Number.isFinite(result.scenarioFreeInvesting.futureValueNetIndicative)).toBe(true);
    expect(Number.isFinite(result.comparison.netDifferencePensionMinusInvesting)).toBe(
      true,
    );
  });
});
