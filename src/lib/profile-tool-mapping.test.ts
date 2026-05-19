import { describe, expect, it } from "vitest";
import {
  getMortgageImpactDefaultsFromProfile,
  getStudentDebtVsInvestingDefaultsFromProfile,
} from "@/lib/profile-tool-mapping";
import type { UserProfile } from "@/lib/user-profile";

describe("profile tool mapping", () => {
  it("maps mortgage-impact defaults from profile fields", () => {
    const profile: UserProfile = {
      income: {
        grossAnnualIncome: 54000,
        partnerGrossAnnualIncome: 18000,
      },
      studentDebt: {
        remainingDebt: 21000,
        currentMonthlyPayment: 155,
        statutoryMonthlyPayment: 190,
        repaymentRule: "SF35",
        duoSituation: "repaying",
        duoInterestRate: 2.33,
        remainingTermYears: 30,
      },
      housing: {
        targetHomePrice: 420000,
        ownFunds: 25000,
        mortgageRate: 4.1,
        mortgageTermYears: 30,
        maxMortgageWithoutStudentDebt: 390000,
      },
    };

    const mapped = getMortgageImpactDefaultsFromProfile(profile);
    expect(mapped.grossIncomeUser).toBe("54000");
    expect(mapped.repaymentRule).toBe("SF35");
    expect(mapped.situation).toBe("repaying");
    expect(mapped.mortgageRate).toBe("4.1");
  });

  it("maps student-debt-vs-investing defaults and falls back fiscal partner from household", () => {
    const profile: UserProfile = {
      income: {
        householdType: "withPartner",
      },
      savingInvesting: {
        monthlyFreeCashflow: 250,
        expectedAnnualReturn: 6,
        investmentHorizonYears: 12,
        currentSavings: 8000,
      },
      studentDebt: {
        duoInterestRate: 2.29,
      },
      tax: {
        preferredTaxYear: 2026,
        preferredBox3Method: "forfaitary",
      },
    };

    const mapped = getStudentDebtVsInvestingDefaultsFromProfile(profile);
    expect(mapped.monthlyAmount).toBe("250");
    expect(mapped.annualDebtRate).toBe("2.29");
    expect(mapped.hasFiscalPartner).toBe(true);
    expect(mapped.box3Method).toBe("forfaitary");
  });

  it("returns empty mappings for an empty profile", () => {
    expect(getMortgageImpactDefaultsFromProfile({})).toEqual({});
    expect(getStudentDebtVsInvestingDefaultsFromProfile({})).toEqual({});
  });
});
