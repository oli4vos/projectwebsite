import { describe, expect, it } from "vitest";
import {
  calculateExtraRepaymentScenario,
  calculateHypotheekImpact,
  getBruteringFactor,
  type HypotheekImpactInput,
} from "./logic";

const baseInput: HypotheekImpactInput = {
  situation: "repaying",
  repaymentRule: "SF35",
  actualMonthlyPayment: 160,
  statutoryMonthlyPayment: 190,
  remainingStudentDebt: 28000,
  duoInterestRate: 2.33,
  remainingTermYears: 30,
  extraRepayment: 5000,
  grossIncomeUser: 52000,
  grossIncomePartner: 0,
  desiredHomePrice: 400000,
  ownMoney: 25000,
  mortgageRate: 4.1,
  mortgageTermYears: 30,
};

describe("hypotheek-impact-studieschuld logic", () => {
  it("returns finite non-negative core outputs", () => {
    const result = calculateHypotheekImpact(baseInput);

    expect(result.mortgageImpact.principalImpact).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(result.mortgageImpact.principalImpact)).toBe(true);
    expect(result.duoPayment.primaryNetMonthlyPayment).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(result.duoPayment.primaryNetMonthlyPayment)).toBe(true);
  });

  it("clamps extra repayment to remaining debt", () => {
    const scenario = calculateExtraRepaymentScenario({
      ...baseInput,
      extraRepayment: 100000,
      remainingStudentDebt: 5000,
    });

    expect(scenario.extraRepaymentUsed).toBe(5000);
    expect(scenario.newStudentDebt).toBe(0);
  });

  it("applies expected brutering bands", () => {
    expect(getBruteringFactor(3.6).factor).toBe(1.2);
    expect(getBruteringFactor(4.2).factor).toBe(1.25);
  });

  it("supports negative/invalid inputs defensively", () => {
    const result = calculateHypotheekImpact({
      ...baseInput,
      actualMonthlyPayment: -50,
      remainingStudentDebt: -1000,
      grossIncomeUser: -1,
      mortgageRate: -4,
      mortgageTermYears: 0,
    });

    expect(result.mortgageImpact.principalImpact).toBeGreaterThanOrEqual(0);
    expect(Number.isFinite(result.mortgageImpact.principalImpact)).toBe(true);
    expect(result.remainingStudentDebt).toBe(0);
  });
});
