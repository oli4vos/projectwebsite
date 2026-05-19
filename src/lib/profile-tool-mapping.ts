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
  "savingInvesting.monthlyFreeCashflow",
  "studentDebt.duoInterestRate",
  "savingInvesting.expectedAnnualReturn",
  "savingInvesting.investmentHorizonYears",
  "savingInvesting.currentSavings",
  "income.householdType",
  "income.partnerGrossAnnualIncome",
  "tax.hasFiscalPartner",
  "tax.preferredTaxYear",
  "tax.preferredBox3Method",
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
  monthlyAmount: string;
  annualDebtRate: string;
  annualInvestmentReturn: string;
  years: string;
  box3BankDeposits: string;
  hasFiscalPartner: boolean;
  taxYear: string;
  box3Method: "actual" | "forfaitary";
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

  const monthlyAmount = toStringValue(profile.savingInvesting?.monthlyFreeCashflow);
  if (monthlyAmount !== undefined) {
    defaults.monthlyAmount = monthlyAmount;
  }

  const annualDebtRate = toStringValue(profile.studentDebt?.duoInterestRate);
  if (annualDebtRate !== undefined) {
    defaults.annualDebtRate = annualDebtRate;
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
