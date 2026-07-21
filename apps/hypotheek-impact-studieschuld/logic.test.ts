import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { DuoDebtPartInput } from "@/lib/duo";
import {
  calculateAnnuityPayment,
  calculateExtraRepaymentScenario,
  calculateHypotheekImpact,
  calculatePresentValueFromMonthlyPayment,
  getBruteringFactor,
  type HypotheekImpactInput,
} from "./logic";
import {
  calculateAnnuityPayment as calculateSharedAnnuityPayment,
  calculatePresentValueFromMonthlyPayment as calculateSharedPresentValue,
} from "@/lib/mortgage";

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
  it("keeps the visible source-check date tied to central metadata", () => {
    const componentSource = readFileSync(
      new URL("./Calculator.tsx", import.meta.url),
      "utf8",
    );

    expect(componentSource).not.toContain("18 mei 2026");
    expect(componentSource).toContain("formatIsoDateLabel(LAST_CHECKED)");
  });

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

  it("uses the annuity-to-zero amount for lender brutering", () => {
    const result = calculateHypotheekImpact({
      ...baseInput,
      actualMonthlyPayment: 145,
      statutoryMonthlyPayment: 230,
      remainingStudentDebt: 28500,
      duoInterestRate: 2.4,
      remainingTermYears: 30,
      mortgageRate: 4.1,
      mortgageTermYears: 30,
    });

    const bruteringFactor = getBruteringFactor(4.1).factor;

    expect(result.mortgageImpact.legalMonthlyPayment).toBe(145);
    expect(result.mortgageImpact.bruteringBaseMonthlyPayment).toBe(230);
    expect(result.mortgageImpact.grossDuoMonthlyImpact).toBeCloseTo(
      230 * bruteringFactor,
      2,
    );
    expect(result.mortgageImpact.principalImpact).toBeCloseTo(
      calculateSharedPresentValue({
        monthlyPayment: result.mortgageImpact.grossDuoMonthlyImpact,
        annualRate: 4.1,
        years: 30,
      }),
      2,
    );
    expect(result.mortgageImpact.grossDuoMonthlyImpact).not.toBeCloseTo(
      145 * bruteringFactor,
      2,
    );
    expect(result.mortgageImpact.principalImpact).toBeGreaterThan(0);
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

  it("supports historical DUO rate years and split debt parts", () => {
    const duoDebtParts: DuoDebtPartInput[] = [
      { label: "Deel 1", remainingDebt: 16000, rateYear: 2026 },
      { label: "Deel 2", remainingDebt: 9000, rateYear: 2024 },
    ];

    const result = calculateHypotheekImpact({
      ...baseInput,
      remainingStudentDebt: 0,
      duoRateYear: 2026,
      duoDebtParts,
      duoInterestRate: undefined,
    });

    expect(result.debtPortfolio.usesDebtParts).toBe(true);
    expect(result.debtPortfolio.parts).toHaveLength(2);
    expect(result.remainingStudentDebt).toBe(25000);
    expect(result.duoRateUsed).toBeGreaterThan(2.33);
    expect(result.mortgageImpact.bruteringBaseMonthlyPayment).toBeGreaterThan(0);
  });

  it("keeps public mortgage helper facades aligned with the shared mortgage layer", () => {
    expect(calculateAnnuityPayment(300000, 4.1, 30)).toBe(
      calculateSharedAnnuityPayment({
        principal: 300000,
        annualRate: 4.1,
        years: 30,
      }),
    );
    expect(calculatePresentValueFromMonthlyPayment(1200, 4.1, 30)).toBe(
      calculateSharedPresentValue({
        monthlyPayment: 1200,
        annualRate: 4.1,
        years: 30,
      }),
    );
  });
});
