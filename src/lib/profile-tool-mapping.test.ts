import { describe, expect, it } from "vitest";
import {
  getBox3ImpactDefaultsFromProfile,
  getBox3IndicatieDefaultsFromProfile,
  getDuoExtraRepaymentDefaultsFromProfile,
  getDuoMonthlyPaymentDefaultsFromProfile,
  getHypotheekAflossenVsBeleggenDefaultsFromProfile,
  getJaarruimteVsVrijBeleggenDefaultsFromProfile,
  getMortgageImpactDefaultsFromProfile,
  getMaxMortgageDefaultsFromProfile,
  getStudentDebtVsInvestingDefaultsFromProfile,
  getFireNaBelastingDefaultsFromProfile,
  getVolgendeEuroDefaultsFromProfile,
  getZzpUurtariefDefaultsFromProfile,
} from "@/lib/profile-tool-mapping";
import type { UserProfile } from "@/lib/user-profile";

describe("profile tool mapping", () => {
  it("maps only matching profile fields to DUO repayment tools", () => {
    const profile: UserProfile = {
      income: {
        grossAnnualIncome: 54000,
        householdType: "withPartner",
      },
      studentDebt: {
        remainingDebt: 21000,
        currentMonthlyPayment: 155,
        repaymentRule: "SF35",
        duoInterestRate: 2.33,
      },
    };

    expect(getDuoMonthlyPaymentDefaultsFromProfile(profile)).toEqual({
      remainingDebt: "21000",
      repaymentRule: "SF35",
      duoRateYear: "2026",
      householdSituation: "partner",
    });
    expect(getDuoExtraRepaymentDefaultsFromProfile(profile)).toEqual({
      remainingDebt: "21000",
      repaymentRule: "SF35",
      duoRateYear: "2026",
      currentMonthlyPayment: "155",
    });
  });

  it("does not treat gross income as DUO assessment income", () => {
    const profile: UserProfile = {
      income: { grossAnnualIncome: 54000 },
    };

    expect(getDuoMonthlyPaymentDefaultsFromProfile(profile)).toEqual({});
  });

  it("maps stored DUO debt parts to tools that support them", () => {
    const profile: UserProfile = {
      studentDebt: {
        remainingDebt: 26000,
        repaymentRule: "SF35",
        debtParts: [
          { remainingDebt: 11000, rateYear: 2025 },
          { remainingDebt: 15000, rateYear: 2026 },
        ],
      },
    };
    const expectedParts = [
      {
        id: "profile-duo-debt-part-1",
        amount: "11000",
        rateYear: "2025",
      },
      {
        id: "profile-duo-debt-part-2",
        amount: "15000",
        rateYear: "2026",
      },
    ];

    expect(getDuoMonthlyPaymentDefaultsFromProfile(profile)).toMatchObject({
      useDebtParts: true,
      debtParts: expectedParts,
    });
    expect(getDuoExtraRepaymentDefaultsFromProfile(profile)).toMatchObject({
      useDebtParts: true,
      debtParts: expectedParts,
    });
    expect(getMortgageImpactDefaultsFromProfile(profile)).toMatchObject({
      useDebtParts: true,
      debtParts: expectedParts,
    });
  });

  it("maps profile fields to the maximum-mortgage form", () => {
    const profile: UserProfile = {
      income: {
        grossAnnualIncome: 62000,
        partnerGrossAnnualIncome: 28000,
      },
      studentDebt: {
        remainingDebt: 18000,
        currentMonthlyPayment: 135,
        statutoryMonthlyPayment: 170,
        duoSituation: "paymentPause",
      },
      housing: {
        targetHomePrice: 410000,
        ownFunds: 22000,
        mortgageRate: 4.1,
        mortgageTermYears: 30,
      },
    };

    expect(getMaxMortgageDefaultsFromProfile(profile)).toEqual({
      grossAnnualHouseholdIncome: "62000",
      grossAnnualPartnerIncome: "28000",
      annualMortgageRate: "4.1",
      mortgageTermYears: "30",
      purchasePrice: "410000",
      marketValue: "410000",
      ownFunds: "22000",
      hasStudentLoan: true,
      studentLoanStatus: "payment_pause",
      actualMonthlyPayment: "135",
      statutoryMonthlyPayment: "170",
    });
  });

  it("maps an explicit zero studieschuld to no student loan", () => {
    const profile: UserProfile = {
      studentDebt: {
        remainingDebt: 0,
      },
    };

    expect(getMaxMortgageDefaultsFromProfile(profile)).toEqual({
      hasStudentLoan: false,
    });
  });

  it("uses a stored mortgage assessment amount when no statutory amount exists", () => {
    const profile: UserProfile = {
      studentDebt: {
        remainingDebt: 18000,
        mortgageAssessmentMonthlyPayment: 164.25,
      },
    };

    expect(getMaxMortgageDefaultsFromProfile(profile)).toMatchObject({
      hasStudentLoan: true,
      statutoryMonthlyPayment: "164.25",
    });
    expect(getMortgageImpactDefaultsFromProfile(profile)).toMatchObject({
      statutoryMonthlyPayment: "164.25",
    });
  });

  it("prefers an explicit statutory amount over the mortgage assessment amount", () => {
    const profile: UserProfile = {
      studentDebt: {
        statutoryMonthlyPayment: 170,
        mortgageAssessmentMonthlyPayment: 164.25,
      },
    };

    expect(getMaxMortgageDefaultsFromProfile(profile)).toMatchObject({
      statutoryMonthlyPayment: "170",
    });
    expect(getMortgageImpactDefaultsFromProfile(profile)).toMatchObject({
      statutoryMonthlyPayment: "170",
    });
  });

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

  it("maps mortgage-impact duo rate year from the stored DUO interest rate", () => {
    const profile: UserProfile = {
      studentDebt: {
        repaymentRule: "SF35",
        duoInterestRate: 2.33,
      },
    };

    const mapped = getMortgageImpactDefaultsFromProfile(profile);
    expect(mapped.duoRateYear).toBe("2026");
  });

  it("prefers the explicitly stored DUO rate year", () => {
    const profile: UserProfile = {
      studentDebt: {
        repaymentRule: "SF35",
        duoInterestRate: 2.33,
        duoRateYear: 2025,
      },
    };

    expect(getDuoMonthlyPaymentDefaultsFromProfile(profile).duoRateYear).toBe(
      "2025",
    );
    expect(getMortgageImpactDefaultsFromProfile(profile).duoRateYear).toBe(
      "2025",
    );
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
    expect(getDuoMonthlyPaymentDefaultsFromProfile({})).toEqual({});
    expect(getDuoExtraRepaymentDefaultsFromProfile({})).toEqual({});
    expect(getMaxMortgageDefaultsFromProfile({})).toEqual({});
    expect(getStudentDebtVsInvestingDefaultsFromProfile({})).toEqual({});
    expect(getBox3IndicatieDefaultsFromProfile({})).toEqual({});
    expect(getBox3ImpactDefaultsFromProfile({})).toEqual({});
    expect(getJaarruimteVsVrijBeleggenDefaultsFromProfile({})).toEqual({});
    expect(getFireNaBelastingDefaultsFromProfile({})).toEqual({});
    expect(getHypotheekAflossenVsBeleggenDefaultsFromProfile({})).toEqual({});
    expect(getZzpUurtariefDefaultsFromProfile({})).toEqual({});
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

  it("maps hypotheek-aflossen-vs-beleggen defaults from profile values", () => {
    const profile: UserProfile = {
      income: {
        grossAnnualIncome: 68000,
        householdType: "withPartner",
      },
      housing: {
        mortgageRate: 3.9,
        mortgageTermYears: 27,
      },
      savingInvesting: {
        currentSavings: 28000,
        expectedAnnualReturn: 5.7,
        investmentHorizonYears: 18,
        targetEmergencyFund: 20000,
        monthlyFreeCashflow: 450,
      },
      tax: {
        preferredTaxYear: 2026,
      },
    };

    const mapped = getHypotheekAflossenVsBeleggenDefaultsFromProfile(profile);
    expect(mapped.mortgageRate).toBe("3.9");
    expect(mapped.remainingTermYears).toBe("27");
    expect(mapped.taxableIncome).toBe("68000");
    expect(mapped.expectedAnnualReturn).toBe("5.7");
    expect(mapped.investmentHorizonYears).toBe("18");
    expect(mapped.currentInvestableAssets).toBe("28000");
    expect(mapped.hasFiscalPartner).toBe(true);
    expect(mapped.taxYear).toBe("2026");
    expect(mapped.minimumBuffer).toBe("20000");
    expect(mapped.annualExtraRepayment).toBe("5400");
  });

  it("maps zzp-uurtarief defaults from profile values", () => {
    const profile = {
      income: {
        grossAnnualIncome: 72000,
      },
      savingInvesting: {
        targetEmergencyFund: 18000,
        pensionBuildUp: "none",
        hasAov: false,
        monthlyFreeCashflow: 1000,
      },
      tax: {
        preferredTaxYear: 2026,
      },
      employment: {
        grossAnnualSalary: 68000,
        businessProfitBeforeTax: 90000,
        aovPremiumAnnual: 3600,
        pensionContributionAnnual: 7200,
      },
    } as UserProfile & {
      employment: {
        grossAnnualSalary: number;
        businessProfitBeforeTax: number;
        aovPremiumAnnual: number;
        pensionContributionAnnual: number;
      };
    };

    const mapped = getZzpUurtariefDefaultsFromProfile(profile);
    expect(mapped.taxYear).toBe("2026");
    expect(mapped.grossAnnualSalaryComparison).toBe("68000");
    expect(mapped.targetNetMonthlyIncome).toBe("3750");
    expect(mapped.monthlyBufferReserve).toBe("1500");
    expect(mapped.monthlyAovPremium).toBe("300");
    expect(mapped.monthlyPensionReserve).toBe("600");
    expect(mapped.monthlyBusinessCosts).toBe("250");
  });
});
