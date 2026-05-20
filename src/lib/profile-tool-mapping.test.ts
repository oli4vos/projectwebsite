import { describe, expect, it } from "vitest";
import {
  getBox3ImpactDefaultsFromProfile,
  getBox3IndicatieDefaultsFromProfile,
  getJaarruimteVsVrijBeleggenDefaultsFromProfile,
  getMortgageImpactDefaultsFromProfile,
  getStudentDebtVsInvestingDefaultsFromProfile,
  getFireNaBelastingDefaultsFromProfile,
  getVolgendeEuroDefaultsFromProfile,
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
        grossAnnualIncome: 47000,
        householdType: "withPartner",
      },
      savingInvesting: {
        monthlyFreeCashflow: 250,
        expectedAnnualReturn: 6,
        investmentHorizonYears: 12,
        currentSavings: 8000,
      },
      studentDebt: {
        remainingDebt: 32000,
        duoInterestRate: 2.29,
        remainingTermYears: 20,
      },
      tax: {
        preferredTaxYear: 2026,
        preferredBox3Method: "forfaitary",
      },
    };

    const mapped = getStudentDebtVsInvestingDefaultsFromProfile(profile);
    expect(mapped.remainingDebt).toBe("32000");
    expect(mapped.voluntaryExtraMonthly).toBe("250");
    expect(mapped.grossAnnualIncome).toBe("47000");
    expect(mapped.remainingTermYears).toBe("20");
    expect(mapped.annualDebtRate).toBe("2.29");
    expect(mapped.hasFiscalPartner).toBe(true);
    expect(mapped.box3Method).toBe("forfaitary");
  });

  it("returns empty mappings for an empty profile", () => {
    expect(getMortgageImpactDefaultsFromProfile({})).toEqual({});
    expect(getStudentDebtVsInvestingDefaultsFromProfile({})).toEqual({});
    expect(getBox3IndicatieDefaultsFromProfile({})).toEqual({});
    expect(getBox3ImpactDefaultsFromProfile({})).toEqual({});
    expect(getJaarruimteVsVrijBeleggenDefaultsFromProfile({})).toEqual({});
    expect(getFireNaBelastingDefaultsFromProfile({})).toEqual({});
  });

  it("maps box3 indicatie defaults from profile values", () => {
    const profile: UserProfile = {
      income: {
        householdType: "withPartner",
      },
      savingInvesting: {
        currentSavings: 23000,
        expectedAnnualReturn: 4.5,
      },
      tax: {
        preferredTaxYear: 2026,
        preferredBox3Method: "forfaitary",
      },
    };

    const mapped = getBox3IndicatieDefaultsFromProfile(profile);
    expect(mapped.method).toBe("forfaitary");
    expect(mapped.year).toBe("2026");
    expect(mapped.bankDeposits).toBe("23000");
    expect(mapped.actualAnnualReturnRate).toBe("4.5");
    expect(mapped.hasFiscalPartner).toBe(true);
  });

  it("maps box3 impact defaults from profile values", () => {
    const profile: UserProfile = {
      savingInvesting: {
        currentSavings: 15000,
        expectedAnnualReturn: 5.2,
      },
      tax: {
        hasFiscalPartner: true,
        preferredTaxYear: 2026,
        preferredBox3Method: "actual",
      },
    };

    const mapped = getBox3ImpactDefaultsFromProfile(profile);
    expect(mapped.method).toBe("actual");
    expect(mapped.year).toBe("2026");
    expect(mapped.bankDeposits).toBe("15000");
    expect(mapped.hasFiscalPartner).toBe(true);
    expect(mapped.expectedSavingsReturn).toBe("5.2");
    expect(mapped.expectedInvestmentReturn).toBe("5.2");
  });

  it("maps jaarruimte-vs-vrij-beleggen defaults from profile values", () => {
    const profile = {
      income: {
        grossAnnualIncome: 62000,
        householdType: "withPartner",
      },
      savingInvesting: {
        currentSavings: 40000,
        expectedAnnualReturn: 6.1,
        investmentHorizonYears: 18,
        monthlyFreeCashflow: 350,
      },
      tax: {
        preferredTaxYear: 2026,
      },
      employment: {
        pensionContributionAnnual: 4200,
      },
    } as UserProfile & { employment: { pensionContributionAnnual: number } };

    const mapped = getJaarruimteVsVrijBeleggenDefaultsFromProfile(profile);
    expect(mapped.year).toBe("2026");
    expect(mapped.grossAnnualIncome).toBe("62000");
    expect(mapped.currentInvestableAssets).toBe("40000");
    expect(mapped.expectedAnnualReturn).toBe("6.1");
    expect(mapped.horizonYears).toBe("18");
    expect(mapped.hasFiscalPartner).toBe(true);
    expect(mapped.plannedContribution).toBe("4200");
  });

  it("maps volgende-euro defaults from profile values", () => {
    const profile: UserProfile = {
      savingInvesting: {
        currentSavings: 17000,
        targetEmergencyFund: 25000,
        monthlyFreeCashflow: 600,
        expectedAnnualReturn: 5.5,
        investmentHorizonYears: 14,
        riskProfile: "offensive",
      },
      studentDebt: {
        remainingDebt: 28000,
        duoInterestRate: 2.33,
      },
      housing: {
        mortgageRate: 4.2,
        targetHomePrice: 450000,
        ownFunds: 30000,
      },
    };

    const mapped = getVolgendeEuroDefaultsFromProfile(profile);
    expect(mapped.currentBuffer).toBe("17000");
    expect(mapped.targetBuffer).toBe("25000");
    expect(mapped.monthlyFreeRoom).toBe("600");
    expect(mapped.expectedAnnualReturn).toBe("5.5");
    expect(mapped.horizonYears).toBe("14");
    expect(mapped.riskProfile).toBe("offensive");
    expect(mapped.studentDebtAmount).toBe("28000");
    expect(mapped.duoRate).toBe("2.33");
    expect(mapped.mortgageRate).toBe("4.2");
    expect(mapped.targetHomePrice).toBe("450000");
    expect(mapped.ownFunds).toBe("30000");
    expect(mapped.hasHousingGoal).toBe(true);
  });

  it("maps fire-na-belasting defaults from profile values", () => {
    const profile: UserProfile = {
      income: {
        householdType: "withPartner",
      },
      savingInvesting: {
        currentSavings: 42000,
        monthlyFreeCashflow: 900,
        expectedAnnualReturn: 5.8,
        investmentHorizonYears: 22,
        riskProfile: "neutral",
      },
      tax: {
        preferredTaxYear: 2026,
      },
    };

    const mapped = getFireNaBelastingDefaultsFromProfile(profile);
    expect(mapped.currentSavings).toBe("42000");
    expect(mapped.currentNetWorth).toBe("42000");
    expect(mapped.monthlyContribution).toBe("900");
    expect(mapped.expectedAnnualReturn).toBe("5.8");
    expect(mapped.horizonYears).toBe("22");
    expect(mapped.riskProfile).toBe("neutral");
    expect(mapped.taxYear).toBe("2026");
    expect(mapped.hasFiscalPartner).toBe(true);
  });
});
