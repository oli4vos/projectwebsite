import type {
  ProfileDuoSituation,
  ProfileRepaymentRule,
  UserProfile,
} from "@/lib/user-profile";

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

  return defaults;
}
