import { describe, expect, it } from "vitest";
import {
  calculateAnnuityPayment,
  calculateAnnuitySchedule,
  calculateAnnuityTermCount,
  calculateCombinedPercentage,
  calculateCompoundRateFromSimple,
  calculateDcf,
  calculateEffectiveRateFromNominal,
  calculateFutureValue,
  calculateLinearLoanSchedule,
  calculateLoanFromAnnuity,
  calculateNominalRateFromEffective,
  calculatePercentage,
  calculatePresentValue,
  calculatePresentValueAnnuity,
  calculateSimpleRateFromCompound,
  calculateTotalFromPercentage,
  calculateWeightedAverageRate,
  convertRomanOrArabic,
  fromRoman,
  percentageToFraction,
  toRoman,
} from "./basis-calculations";

describe("basis calculations", () => {
  it("calculates annuity payment", () => {
    const payment = calculateAnnuityPayment({
      principal: 100000,
      annualRatePercent: 5,
      years: 30,
      periodUnit: "month",
    });
    expect(payment).toBeCloseTo(536.82, 2);
  });

  it("builds annuity schedule ending at zero", () => {
    const result = calculateAnnuitySchedule({
      principal: 12000,
      annualRatePercent: 0,
      years: 1,
      periodUnit: "month",
    });
    expect(result.schedule.length).toBe(12);
    expect(result.schedule.at(-1)?.closingBalance).toBe(0);
    expect(result.totalInterest).toBe(0);
  });

  it("derives principal from annuity", () => {
    const principal = calculateLoanFromAnnuity({
      annuityPayment: 860.66,
      annualRatePercent: 6,
      years: 1,
      periodUnit: "month",
    });
    expect(principal).toBeCloseTo(10000, 0);
  });

  it("derives term count for annuity", () => {
    const result = calculateAnnuityTermCount({
      principal: 10000,
      annuityPayment: 860.66,
      annualRatePercent: 6,
      periodUnit: "month",
    });
    expect(result.periods).toBe(12);
  });

  it("calculates linear loan schedule", () => {
    const result = calculateLinearLoanSchedule({
      principal: 12000,
      annualRatePercent: 12,
      years: 1,
      periodUnit: "month",
    });
    expect(result.fixedPrincipal).toBe(1000);
    expect(result.firstPayment).toBeCloseTo(1120, 2);
    expect(result.schedule.at(-1)?.closingBalance).toBe(0);
  });

  it("calculates present value", () => {
    const result = calculatePresentValue({
      futureValue: 1000,
      annualRatePercent: 5,
      years: 1,
      periodUnit: "year",
    });
    expect(result.presentValue).toBeCloseTo(952.38, 2);
  });

  it("calculates present value for annuity stream", () => {
    const result = calculatePresentValueAnnuity({
      payment: 1000,
      annualRatePercent: 5,
      years: 5,
      periodUnit: "year",
    });
    expect(result.presentValue).toBeCloseTo(4329.48, 2);
  });

  it("calculates future value", () => {
    const result = calculateFutureValue({
      currentValue: 1000,
      periodicContribution: 100,
      annualRatePercent: 5,
      years: 1,
      periodUnit: "year",
    });
    expect(result.futureValue).toBeCloseTo(1150, 2);
  });

  it("converts effective and nominal rates", () => {
    const effective = calculateEffectiveRateFromNominal(12, 12);
    expect(effective).toBeCloseTo(12.6825, 3);
    const nominal = calculateNominalRateFromEffective(12.6825, 12);
    expect(nominal).toBeCloseTo(12, 2);
  });

  it("converts compound to simple and back", () => {
    const simple = calculateSimpleRateFromCompound(10, 2);
    expect(simple).toBeCloseTo(10.5, 3);
    const compound = calculateCompoundRateFromSimple(10, 2);
    expect(compound).toBeCloseTo(9.5445, 3);
  });

  it("calculates percentages", () => {
    expect(calculatePercentage(25, 200)).toBeCloseTo(12.5, 4);
    expect(calculateTotalFromPercentage(50, 20)).toBe(250);
    expect(calculateCombinedPercentage(10, 20)).toBeCloseTo(32, 4);
  });

  it("handles fraction conversion from percentage", () => {
    const result = percentageToFraction(25);
    expect(result.fraction).toBe("1/4");
    expect(result.numerator).toBe(1);
    expect(result.denominator).toBe(4);
  });

  it("calculates weighted average rate", () => {
    const result = calculateWeightedAverageRate([
      { amount: 1000, ratePercent: 2 },
      { amount: 3000, ratePercent: 4 },
    ]);
    expect(result.weightedRatePercent).toBeCloseTo(3.5, 3);
    expect(result.totalAmount).toBe(4000);
  });

  it("rejects weighted average rates without positive amounts", () => {
    expect(() =>
      calculateWeightedAverageRate([{ amount: 0, ratePercent: 5 }]),
    ).toThrow("De som van de bedragen moet groter zijn dan 0.");
  });

  it("converts roman numerals in both directions", () => {
    expect(toRoman(1984)).toBe("MCMLXXXIV");
    expect(fromRoman("MMXXVI")).toBe(2026);
    const converted = convertRomanOrArabic("3999");
    expect(converted.roman).toBe("MMMCMXCIX");
  });

  it("calculates DCF value", () => {
    const result = calculateDcf({
      discountRatePercent: 10,
      cashflows: [100, 100, 100],
      terminalValue: 1000,
    });
    expect(result.totalPresentValue).toBeCloseTo(1000, 0);
    expect(result.rows).toHaveLength(3);
  });

  it("throws validation errors for invalid inputs", () => {
    expect(() => calculatePercentage(10, 0)).toThrow();
    expect(() => fromRoman("IIII")).toThrow();
    expect(() =>
      calculateAnnuityTermCount({
        principal: 100000,
        annuityPayment: 100,
        annualRatePercent: 5,
        periodUnit: "month",
      }),
    ).toThrow();
  });
});
