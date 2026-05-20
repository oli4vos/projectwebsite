import type {
  ProfileDuoSituation,
  ProfileRepaymentRule,
  UserProfile,
} from "@/lib/user-profile";

export const PROFILE_FIELDS_MORTGAGE_IMPACT = [
  "income.grossAnnualIncome",
  "income.partnerGrossAnnualIncome",
  "studentDebt.remainingDebt",
  "studentDebt.currentMonthlyPayment",
  "studentDebt.statutoryMonthlyPayment",
  "studentDebt.repaymentRule",
  "studentDebt.duoSituation",
  "studentDebt.duoInterestRate",
  "studentDebt.remainingTermYears",
  "housing.targetHomePrice",
  "housing.ownFunds",
  "housing.mortgageRate",
  "housing.mortgageTermYears",
  "housing.maxMortgageWithoutStudentDebt",
] as const;

export const PROFILE_FIELDS_STUDENT_DEBT_VS_INVESTING = [
  "studentDebt.remainingDebt",
  "studentDebt.remainingTermYears",
  "income.grossAnnualIncome",
  "income.partnerGrossAnnualIncome",
  "savingInvesting.monthlyFreeCashflow",
  "studentDebt.duoInterestRate",
  "savingInvesting.expectedAnnualReturn",
  "savingInvesting.investmentHorizonYears",
  "savingInvesting.currentSavings",
  "income.householdType",
  "tax.hasFiscalPartner",
  "tax.preferredTaxYear",
  "tax.preferredBox3Method",
] as const;

export const PROFILE_FIELDS_JAARRUIMTE_VS_VRIJ_BELEGGEN = [
  "income.grossAnnualIncome",
  "savingInvesting.currentSavings",
  "savingInvesting.expectedAnnualReturn",
  "savingInvesting.investmentHorizonYears",
  "tax.hasFiscalPartner",
  "tax.preferredTaxYear",
  "savingInvesting.pensionBuildUp",
] as const;

export const PROFILE_FIELDS_VOLGENDE_EURO = [
  "savingInvesting.currentSavings",
  "savingInvesting.targetEmergencyFund",
  "savingInvesting.monthlyFreeCashflow",
  "savingInvesting.expectedAnnualReturn",
  "savingInvesting.investmentHorizonYears",
  "savingInvesting.riskProfile",
  "studentDebt.remainingDebt",
  "studentDebt.duoInterestRate",
  "housing.mortgageRate",
  "housing.targetHomePrice",
  "housing.ownFunds",
] as const;

export const PROFILE_FIELDS_FIRE_NA_BELASTING = [
  "savingInvesting.currentSavings",
  "savingInvesting.monthlyFreeCashflow",
  "savingInvesting.expectedAnnualReturn",
  "savingInvesting.investmentHorizonYears",
  "savingInvesting.riskProfile",
  "tax.preferredTaxYear",
  "tax.hasFiscalPartner",
] as const;

type MortgageImpactDefaults = Partial<{
  grossIncomeUser: string;
  grossIncomePartner: string;
  remainingStudentDebt: string;
  actualMonthlyPayment: string;
  statutoryMonthlyPayment: string;
  repaymentRule: ProfileRepaymentRule;
  situation: ProfileDuoSituation;
  duoInterestRate: string;
  remainingTermYears: string;
  desiredHomePrice: string;
  ownMoney: string;
  mortgageRate: string;
  mortgageTermYears: string;
  maxMortgageWithoutStudentDebt: string;
}>;

type StudentDebtVsInvestingDefaults = Partial<{
  remainingDebt: string;
  annualDebtRate: string;
  remainingTermYears: string;
  grossAnnualIncome: string;
  partnerGrossAnnualIncome: string;
  voluntaryExtraMonthly: string;
  annualInvestmentReturn: string;
  years: string;
  box3BankDeposits: string;
  hasFiscalPartner: boolean;
  taxYear: string;
  box3Method: "actual" | "forfaitary";
}>;

type Box3IndicatieDefaults = Partial<{
  method: "actual" | "forfaitary";
  year: string;
  bankDeposits: string;
  investmentsAndOtherAssets: string;
  debts: string;
  hasFiscalPartner: boolean;
  actualAnnualReturnRate: string;
}>;

type Box3ImpactDefaults = Partial<{
  method: "actual" | "forfaitary";
  year: string;
  bankDeposits: string;
  investmentsAndOtherAssets: string;
  debts: string;
  hasFiscalPartner: boolean;
  expectedSavingsReturn: string;
  expectedInvestmentReturn: string;
  horizonYears: string;
  investmentsContribution: string;
}>;

type JaarruimteVsVrijBeleggenDefaults = Partial<{
  year: string;
  grossAnnualIncome: string;
  currentInvestableAssets: string;
  expectedAnnualReturn: string;
  horizonYears: string;
  hasFiscalPartner: boolean;
  plannedContribution: string;
}>;

type VolgendeEuroDefaults = Partial<{
  currentBuffer: string;
  targetBuffer: string;
  monthlyFreeRoom: string;
  expectedAnnualReturn: string;
  horizonYears: string;
  riskProfile: "conservative" | "neutral" | "offensive";
  studentDebtAmount: string;
  duoRate: string;
  mortgageRate: string;
  targetHomePrice: string;
  ownFunds: string;
  hasHousingGoal: boolean;
}>;

type FireNaBelastingDefaults = Partial<{
  currentNetWorth: string;
  currentSavings: string;
  currentInvestments: string;
  monthlyContribution: string;
  yearlyContribution: string;
  expectedAnnualReturn: string;
  annualInflation: string;
  taxYear: string;
  hasFiscalPartner: boolean;
  horizonYears: string;
  riskProfile: "conservative" | "neutral" | "offensive";
}>;

function toStringValue(value?: number) {
  return value === undefined ? undefined : String(value);
}

export function getMortgageImpactDefaultsFromProfile(
  profile: UserProfile,
): MortgageImpactDefaults {
  const defaults: MortgageImpactDefaults = {};

  const grossIncomeUser = toStringValue(profile.income?.grossAnnualIncome);
  if (grossIncomeUser !== undefined) {
    defaults.grossIncomeUser = grossIncomeUser;
  }

  const grossIncomePartner = toStringValue(
    profile.income?.partnerGrossAnnualIncome,
  );
  if (grossIncomePartner !== undefined) {
    defaults.grossIncomePartner = grossIncomePartner;
  }

  const remainingStudentDebt = toStringValue(profile.studentDebt?.remainingDebt);
  if (remainingStudentDebt !== undefined) {
    defaults.remainingStudentDebt = remainingStudentDebt;
  }

  const actualMonthlyPayment = toStringValue(
    profile.studentDebt?.currentMonthlyPayment,
  );
  if (actualMonthlyPayment !== undefined) {
    defaults.actualMonthlyPayment = actualMonthlyPayment;
  }

  const statutoryMonthlyPayment = toStringValue(
    profile.studentDebt?.statutoryMonthlyPayment,
  );
  if (statutoryMonthlyPayment !== undefined) {
    defaults.statutoryMonthlyPayment = statutoryMonthlyPayment;
  }

  if (profile.studentDebt?.repaymentRule !== undefined) {
    defaults.repaymentRule = profile.studentDebt.repaymentRule;
  }

  if (profile.studentDebt?.duoSituation !== undefined) {
    defaults.situation = profile.studentDebt.duoSituation;
  }

  const duoInterestRate = toStringValue(profile.studentDebt?.duoInterestRate);
  if (duoInterestRate !== undefined) {
    defaults.duoInterestRate = duoInterestRate;
  }

  const remainingTermYears = toStringValue(profile.studentDebt?.remainingTermYears);
  if (remainingTermYears !== undefined) {
    defaults.remainingTermYears = remainingTermYears;
  }

  const desiredHomePrice = toStringValue(profile.housing?.targetHomePrice);
  if (desiredHomePrice !== undefined) {
    defaults.desiredHomePrice = desiredHomePrice;
  }

  const ownMoney = toStringValue(profile.housing?.ownFunds);
  if (ownMoney !== undefined) {
    defaults.ownMoney = ownMoney;
  }

  const mortgageRate = toStringValue(profile.housing?.mortgageRate);
  if (mortgageRate !== undefined) {
    defaults.mortgageRate = mortgageRate;
  }

  const mortgageTermYears = toStringValue(profile.housing?.mortgageTermYears);
  if (mortgageTermYears !== undefined) {
    defaults.mortgageTermYears = mortgageTermYears;
  }

  const maxMortgageWithoutStudentDebt = toStringValue(
    profile.housing?.maxMortgageWithoutStudentDebt,
  );
  if (maxMortgageWithoutStudentDebt !== undefined) {
    defaults.maxMortgageWithoutStudentDebt = maxMortgageWithoutStudentDebt;
  }

  return defaults;
}

export function getStudentDebtVsInvestingDefaultsFromProfile(
  profile: UserProfile,
): StudentDebtVsInvestingDefaults {
  const defaults: StudentDebtVsInvestingDefaults = {};

  const remainingDebt = toStringValue(profile.studentDebt?.remainingDebt);
  if (remainingDebt !== undefined) {
    defaults.remainingDebt = remainingDebt;
  }

  const annualDebtRate = toStringValue(profile.studentDebt?.duoInterestRate);
  if (annualDebtRate !== undefined) {
    defaults.annualDebtRate = annualDebtRate;
  }

  const remainingTermYears = toStringValue(profile.studentDebt?.remainingTermYears);
  if (remainingTermYears !== undefined) {
    defaults.remainingTermYears = remainingTermYears;
  }

  const grossAnnualIncome = toStringValue(profile.income?.grossAnnualIncome);
  if (grossAnnualIncome !== undefined) {
    defaults.grossAnnualIncome = grossAnnualIncome;
  }

  const partnerGrossAnnualIncome = toStringValue(
    profile.income?.partnerGrossAnnualIncome,
  );
  if (partnerGrossAnnualIncome !== undefined) {
    defaults.partnerGrossAnnualIncome = partnerGrossAnnualIncome;
  }

  const voluntaryExtraMonthly = toStringValue(
    profile.savingInvesting?.monthlyFreeCashflow,
  );
  if (voluntaryExtraMonthly !== undefined) {
    defaults.voluntaryExtraMonthly = voluntaryExtraMonthly;
  }

  const annualInvestmentReturn = toStringValue(
    profile.savingInvesting?.expectedAnnualReturn,
  );
  if (annualInvestmentReturn !== undefined) {
    defaults.annualInvestmentReturn = annualInvestmentReturn;
  }

  const years = toStringValue(profile.savingInvesting?.investmentHorizonYears);
  if (years !== undefined) {
    defaults.years = years;
  }

  const box3BankDeposits = toStringValue(profile.savingInvesting?.currentSavings);
  if (box3BankDeposits !== undefined) {
    defaults.box3BankDeposits = box3BankDeposits;
  }

  if (
    profile.tax?.hasFiscalPartner !== undefined ||
    profile.income?.householdType !== undefined ||
    profile.income?.partnerGrossAnnualIncome !== undefined
  ) {
    defaults.hasFiscalPartner =
      profile.tax?.hasFiscalPartner ??
      Boolean(
        profile.income?.householdType === "withPartner" ||
          profile.income?.householdType === "family" ||
          (profile.income?.partnerGrossAnnualIncome ?? 0) > 0,
      );
  }

  const preferredTaxYear = toStringValue(profile.tax?.preferredTaxYear);
  if (preferredTaxYear !== undefined) {
    defaults.taxYear = preferredTaxYear;
  }

  if (profile.tax?.preferredBox3Method !== undefined) {
    defaults.box3Method = profile.tax.preferredBox3Method;
  }

  return defaults;
}

export function getBox3IndicatieDefaultsFromProfile(
  profile: UserProfile,
): Box3IndicatieDefaults {
  const defaults: Box3IndicatieDefaults = {};

  const method = profile.tax?.preferredBox3Method;
  if (method !== undefined) {
    defaults.method = method;
  }

  const year = toStringValue(profile.tax?.preferredTaxYear);
  if (year !== undefined) {
    defaults.year = year;
  }

  const bankDeposits = toStringValue(profile.savingInvesting?.currentSavings);
  if (bankDeposits !== undefined) {
    defaults.bankDeposits = bankDeposits;
  }

  if (profile.tax?.hasFiscalPartner !== undefined) {
    defaults.hasFiscalPartner = profile.tax.hasFiscalPartner;
  } else if (
    profile.income?.householdType === "withPartner" ||
    profile.income?.householdType === "family" ||
    (profile.income?.partnerGrossAnnualIncome ?? 0) > 0
  ) {
    defaults.hasFiscalPartner = true;
  }

  if (profile.savingInvesting?.expectedAnnualReturn !== undefined) {
    defaults.actualAnnualReturnRate = toStringValue(
      profile.savingInvesting.expectedAnnualReturn,
    );
  }

  return defaults;
}

export function getBox3ImpactDefaultsFromProfile(
  profile: UserProfile,
): Box3ImpactDefaults {
  const indicatieDefaults = getBox3IndicatieDefaultsFromProfile(profile);
  const defaults: Box3ImpactDefaults = {};

  if (indicatieDefaults.method !== undefined) {
    defaults.method = indicatieDefaults.method;
  }
  if (indicatieDefaults.year !== undefined) {
    defaults.year = indicatieDefaults.year;
  }
  if (indicatieDefaults.bankDeposits !== undefined) {
    defaults.bankDeposits = indicatieDefaults.bankDeposits;
  }
  if (indicatieDefaults.hasFiscalPartner !== undefined) {
    defaults.hasFiscalPartner = indicatieDefaults.hasFiscalPartner;
  }

  if (profile.savingInvesting?.expectedAnnualReturn !== undefined) {
    const expected = toStringValue(profile.savingInvesting.expectedAnnualReturn);
    defaults.expectedSavingsReturn = expected;
    defaults.expectedInvestmentReturn = expected;
  }

  const horizonYears = toStringValue(profile.savingInvesting?.investmentHorizonYears);
  if (horizonYears !== undefined) {
    defaults.horizonYears = horizonYears;
  }

  const investmentsContribution = toStringValue(
    profile.savingInvesting?.monthlyFreeCashflow,
  );
  if (investmentsContribution !== undefined) {
    defaults.investmentsContribution = investmentsContribution;
  }

  return defaults;
}

export function getJaarruimteVsVrijBeleggenDefaultsFromProfile(
  profile: UserProfile,
): JaarruimteVsVrijBeleggenDefaults {
  const defaults: JaarruimteVsVrijBeleggenDefaults = {};

  const year = toStringValue(profile.tax?.preferredTaxYear);
  if (year !== undefined) {
    defaults.year = year;
  }

  const grossAnnualIncome = toStringValue(profile.income?.grossAnnualIncome);
  if (grossAnnualIncome !== undefined) {
    defaults.grossAnnualIncome = grossAnnualIncome;
  }

  const currentInvestableAssets = toStringValue(
    profile.savingInvesting?.currentSavings,
  );
  if (currentInvestableAssets !== undefined) {
    defaults.currentInvestableAssets = currentInvestableAssets;
  }

  const expectedAnnualReturn = toStringValue(
    profile.savingInvesting?.expectedAnnualReturn,
  );
  if (expectedAnnualReturn !== undefined) {
    defaults.expectedAnnualReturn = expectedAnnualReturn;
  }

  const horizonYears = toStringValue(
    profile.savingInvesting?.investmentHorizonYears,
  );
  if (horizonYears !== undefined) {
    defaults.horizonYears = horizonYears;
  }

  if (
    profile.tax?.hasFiscalPartner !== undefined ||
    profile.income?.householdType !== undefined ||
    profile.income?.partnerGrossAnnualIncome !== undefined
  ) {
    defaults.hasFiscalPartner =
      profile.tax?.hasFiscalPartner ??
      Boolean(
        profile.income?.householdType === "withPartner" ||
          profile.income?.householdType === "family" ||
          (profile.income?.partnerGrossAnnualIncome ?? 0) > 0,
      );
  }

  const fallbackContribution = toStringValue(
    profile.savingInvesting?.monthlyFreeCashflow,
  );
  if (fallbackContribution !== undefined) {
    defaults.plannedContribution = fallbackContribution;
  }

  const employmentProfile = profile as UserProfile & {
    employment?: { pensionContributionAnnual?: number };
  };
  const pensionContributionAnnual = toStringValue(
    employmentProfile.employment?.pensionContributionAnnual,
  );
  if (pensionContributionAnnual !== undefined) {
    defaults.plannedContribution = pensionContributionAnnual;
  }

  return defaults;
}

export function getVolgendeEuroDefaultsFromProfile(
  profile: UserProfile,
): VolgendeEuroDefaults {
  const defaults: VolgendeEuroDefaults = {};

  const currentBuffer = toStringValue(profile.savingInvesting?.currentSavings);
  if (currentBuffer !== undefined) {
    defaults.currentBuffer = currentBuffer;
  }

  const targetBuffer = toStringValue(profile.savingInvesting?.targetEmergencyFund);
  if (targetBuffer !== undefined) {
    defaults.targetBuffer = targetBuffer;
  }

  const monthlyFreeRoom = toStringValue(profile.savingInvesting?.monthlyFreeCashflow);
  if (monthlyFreeRoom !== undefined) {
    defaults.monthlyFreeRoom = monthlyFreeRoom;
  }

  const expectedAnnualReturn = toStringValue(
    profile.savingInvesting?.expectedAnnualReturn,
  );
  if (expectedAnnualReturn !== undefined) {
    defaults.expectedAnnualReturn = expectedAnnualReturn;
  }

  const horizonYears = toStringValue(profile.savingInvesting?.investmentHorizonYears);
  if (horizonYears !== undefined) {
    defaults.horizonYears = horizonYears;
  }

  if (profile.savingInvesting?.riskProfile !== undefined) {
    defaults.riskProfile = profile.savingInvesting.riskProfile;
  }

  const studentDebtAmount = toStringValue(profile.studentDebt?.remainingDebt);
  if (studentDebtAmount !== undefined) {
    defaults.studentDebtAmount = studentDebtAmount;
  }

  const duoRate = toStringValue(profile.studentDebt?.duoInterestRate);
  if (duoRate !== undefined) {
    defaults.duoRate = duoRate;
  }

  const mortgageRate = toStringValue(profile.housing?.mortgageRate);
  if (mortgageRate !== undefined) {
    defaults.mortgageRate = mortgageRate;
  }

  const targetHomePrice = toStringValue(profile.housing?.targetHomePrice);
  if (targetHomePrice !== undefined) {
    defaults.targetHomePrice = targetHomePrice;
  }

  const ownFunds = toStringValue(profile.housing?.ownFunds);
  if (ownFunds !== undefined) {
    defaults.ownFunds = ownFunds;
  }

  defaults.hasHousingGoal = Boolean(
    (profile.housing?.targetHomePrice ?? 0) > 0 || (profile.housing?.ownFunds ?? 0) > 0,
  );

  return defaults;
}

export function getFireNaBelastingDefaultsFromProfile(
  profile: UserProfile,
): FireNaBelastingDefaults {
  const defaults: FireNaBelastingDefaults = {};

  const currentSavings = toStringValue(profile.savingInvesting?.currentSavings);
  if (currentSavings !== undefined) {
    defaults.currentSavings = currentSavings;
    defaults.currentNetWorth = currentSavings;
  }

  const monthlyContribution = toStringValue(
    profile.savingInvesting?.monthlyFreeCashflow,
  );
  if (monthlyContribution !== undefined) {
    defaults.monthlyContribution = monthlyContribution;
  }

  const expectedAnnualReturn = toStringValue(
    profile.savingInvesting?.expectedAnnualReturn,
  );
  if (expectedAnnualReturn !== undefined) {
    defaults.expectedAnnualReturn = expectedAnnualReturn;
  }

  const horizonYears = toStringValue(profile.savingInvesting?.investmentHorizonYears);
  if (horizonYears !== undefined) {
    defaults.horizonYears = horizonYears;
  }

  if (profile.savingInvesting?.riskProfile !== undefined) {
    defaults.riskProfile = profile.savingInvesting.riskProfile;
  }

  const taxYear = toStringValue(profile.tax?.preferredTaxYear);
  if (taxYear !== undefined) {
    defaults.taxYear = taxYear;
  }

  if (
    profile.tax?.hasFiscalPartner !== undefined ||
    profile.income?.householdType !== undefined ||
    profile.income?.partnerGrossAnnualIncome !== undefined
  ) {
    defaults.hasFiscalPartner =
      profile.tax?.hasFiscalPartner ??
      Boolean(
        profile.income?.householdType === "withPartner" ||
          profile.income?.householdType === "family" ||
          (profile.income?.partnerGrossAnnualIncome ?? 0) > 0,
      );
  }

  return defaults;
}
