import { describe, expect, it } from "vitest";
import {
  buildFamilyLoanInput,
  buildFinancingScenario,
  buildProfilePatchFromProfile,
  calculateFamilyHomeScenario,
  exampleValues,
  type FamilyHomeFormState,
} from "./logic";
import type { UserProfile } from "@/lib/user-profile";

const baseForm: FamilyHomeFormState = {
  ...exampleValues,
  purchasePrice: "400000",
  acquisitionCosts: "15000",
  ownFunds: "25000",
  minimumBuffer: "10000",
  bankMortgagePrincipal: "360000",
  bankMortgageAnnualRate: "4.2",
  bankMortgageTermYears: "30",
  duoRemainingDebt: "18000",
  duoAnnualInterestRate: "2.33",
  duoRemainingTermYears: "30",
  duoCurrentMonthlyPayment: "165",
  duoStatutoryMonthlyPayment: "190",
  duoGrossAnnualIncome: "52000",
  extraDuoRepayment: "2500",
  familyLoanPrincipal: "25000",
  familyLoanAnnualRate: "3",
  familyLoanTermYears: "15",
  oneTimeGiftAmount: "10000",
  recurringGiftEnabled: true,
  recurringGiftAmountPerPeriod: "250",
  recurringGiftFrequency: "monthly",
  recurringGiftStartDate: "2026-01-01",
  recurringGiftEndDate: "",
  recurringGiftMaxPayments: "12",
};

describe("familiehulp-eerste-woning logic", () => {
  it("maps profile values into the form patch", () => {
    const profile: UserProfile = {
      income: { grossAnnualIncome: 52000, partnerGrossAnnualIncome: 18000 },
      studentDebt: {
        remainingDebt: 18500,
        currentMonthlyPayment: 165,
        statutoryMonthlyPayment: 190,
        repaymentRule: "SF35",
        duoSituation: "repaying",
        duoInterestRate: 2.33,
        remainingTermYears: 30,
      },
      housing: {
        targetHomePrice: 400000,
        ownFunds: 25000,
        mortgageRate: 4.2,
        mortgageTermYears: 30,
      },
      savingInvesting: { targetEmergencyFund: 10000 },
    };

    const patch = buildProfilePatchFromProfile(profile);

    expect(patch.purchasePrice).toBe("400000");
    expect(patch.ownFunds).toBe("25000");
    expect(patch.minimumBuffer).toBe("10000");
    expect(patch.duoRemainingDebt).toBe("18500");
    expect(patch.duoCurrentMonthlyPayment).toBe("165");
    expect(patch.duoRepaymentRule).toBe("SF35");
    expect(patch.duoSituation).toBe("repaying");
  });

  it("maps the input into a financing scenario with a separate extra DUO repayment", () => {
    const scenario = buildFinancingScenario(baseForm);

    expect(scenario.input.purchasePrice).toBe(400000);
    expect(scenario.input.extraDuoRepayment).toBe(2500);
    expect(scenario.input.gifts).toHaveLength(2);
    expect(scenario.input.bankMortgage?.principal).toBe(360000);
    expect(scenario.input.familyLoan?.principal).toBe(25000);
    expect(scenario.includesFutureGifts).toBe(true);
  });

  it("keeps gifts out of contractual monthly outflow and shows a no-gift scenario", () => {
    const result = calculateFamilyHomeScenario(baseForm);

    expect(result.primaryScenario.contractualMonthlyPayments?.receivedGift).toBe(250);
    expect(result.primaryScenario.contractualMonthlyPayments?.grossContractualOutflow).toBeGreaterThan(
      result.primaryScenario.contractualMonthlyPayments?.receivedGift ?? 0,
    );
    expect(result.primaryScenario.stressTests?.some((test) => test.type === "giftStops")).toBe(
      true,
    );
    expect(result.withoutRecurringGiftScenario.contractualMonthlyPayments?.receivedGift).toBe(0);
    expect(result.withoutRecurringGiftScenario.financingGap).toBeGreaterThanOrEqual(0);
  });

  it("builds a family loan input for annuity and lineair variants", () => {
    expect(
      buildFamilyLoanInput({
        ...baseForm,
        familyLoanRepaymentType: "linear",
      }),
    ).toMatchObject({
      principal: 25000,
      annualRate: 3,
      termYears: 15,
      repaymentType: "linear",
    });
  });
});
