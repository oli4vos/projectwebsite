import {
  getAvailableDuoRateYears,
  getDuoHistoricalRateYearForRule,
} from "@/lib/financial-constants";
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
  "studentDebt.mortgageAssessmentMonthlyPayment",
  "studentDebt.repaymentRule",
  "studentDebt.duoSituation",
  "studentDebt.duoInterestRate",
  "studentDebt.duoRateYear",
  "studentDebt.remainingTermYears",
  "studentDebt.debtParts",
  "housing.targetHomePrice",
  "housing.ownFunds",
  "housing.mortgageRate",
  "housing.mortgageTermYears",
  "housing.maxMortgageWithoutStudentDebt",
] as const;

export const PROFILE_FIELDS_DUO_MONTHLY_PAYMENT = [
  "studentDebt.remainingDebt",
  "studentDebt.repaymentRule",
  "studentDebt.duoInterestRate",
  "studentDebt.duoRateYear",
  "studentDebt.debtParts",
  "income.householdType",
] as const;

export const PROFILE_FIELDS_DUO_EXTRA_REPAYMENT = [
  "studentDebt.remainingDebt",
  "studentDebt.repaymentRule",
  "studentDebt.duoInterestRate",
  "studentDebt.duoRateYear",
  "studentDebt.currentMonthlyPayment",
  "studentDebt.debtParts",
] as const;

export const PROFILE_FIELDS_MAX_MORTGAGE = [
  "income.grossAnnualIncome",
  "income.partnerGrossAnnualIncome",
  "studentDebt.remainingDebt",
  "studentDebt.currentMonthlyPayment",
  "studentDebt.statutoryMonthlyPayment",
  "studentDebt.mortgageAssessmentMonthlyPayment",
  "studentDebt.duoSituation",
  "housing.targetHomePrice",
  "housing.ownFunds",
  "housing.mortgageRate",
  "housing.mortgageTermYears",
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

export const PROFILE_FIELDS_PRIVE_BELEGGEN_EINDVERMOGEN = [
  "savingInvesting.currentSavings",
  "savingInvesting.monthlyFreeCashflow",
  "savingInvesting.expectedAnnualReturn",
  "savingInvesting.investmentHorizonYears",
  "tax.preferredTaxYear",
  "tax.hasFiscalPartner",
  "tax.preferredBox3Method",
] as const;

export const PROFILE_FIELDS_HYPOTHEEK_AFLOSSEN_VS_BELEGGEN = [
  "income.grossAnnualIncome",
  "housing.mortgageRate",
  "housing.mortgageTermYears",
  "savingInvesting.currentSavings",
  "savingInvesting.expectedAnnualReturn",
  "savingInvesting.investmentHorizonYears",
  "tax.hasFiscalPartner",
  "tax.preferredTaxYear",
  "savingInvesting.targetEmergencyFund",
  "savingInvesting.monthlyFreeCashflow",
] as const;

export const PROFILE_FIELDS_ZZP_UURTARIEF = [
  "income.employmentType",
  "income.grossAnnualIncome",
  "savingInvesting.targetEmergencyFund",
  "tax.preferredTaxYear",
  "employment.grossAnnualSalary",
  "employment.businessProfitBeforeTax",
  "employment.aovPremiumAnnual",
  "employment.pensionContributionAnnual",
] as const;

type MortgageImpactDefaults = Partial<{
  grossIncomeUser: string;
  grossIncomePartner: string;
  remainingStudentDebt: string;
  actualMonthlyPayment: string;
  statutoryMonthlyPayment: string;
  repaymentRule: ProfileRepaymentRule;
  situation: ProfileDuoSituation;
  duoRateYear: string;
  remainingTermYears: string;
  desiredHomePrice: string;
  ownMoney: string;
  mortgageRate: string;
  mortgageTermYears: string;
  maxMortgageWithoutStudentDebt: string;
  useDebtParts: boolean;
  debtParts: ProfileDebtPartFormDefault[];
}>;

type DuoMonthlyPaymentDefaults = Partial<{
  remainingDebt: string;
  repaymentRule: ProfileRepaymentRule;
  duoRateYear: string;
  householdSituation: "single" | "partner";
  useDebtParts: boolean;
  debtParts: ProfileDebtPartFormDefault[];
}>;

type DuoExtraRepaymentDefaults = Partial<{
  remainingDebt: string;
  repaymentRule: ProfileRepaymentRule;
  duoRateYear: string;
  currentMonthlyPayment: string;
  useDebtParts: boolean;
  debtParts: ProfileDebtPartFormDefault[];
}>;

type ProfileDebtPartFormDefault = {
  id: string;
  amount: string;
  rateYear: string;
};

type MaxMortgageDefaults = Partial<{
  grossAnnualHouseholdIncome: string;
  grossAnnualPartnerIncome: string;
  annualMortgageRate: string;
  mortgageTermYears: string;
  purchasePrice: string;
  marketValue: string;
  ownFunds: string;
  hasStudentLoan: boolean;
  studentLoanStatus:
    | "repaying"
    | "start_phase"
    | "reduced_capacity"
    | "payment_pause"
    | "unknown";
  actualMonthlyPayment: string;
  statutoryMonthlyPayment: string;
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

type PriveBeleggenEindvermogenDefaults = Partial<{
  taxYear: string;
  hasFiscalPartner: boolean;
  box3Method: "actual" | "forfaitary";
  startVermogen: string;
  maandelijkseInleg: string;
  verwachtRendementPct: string;
  horizonJaren: string;
}>;

type HypotheekAflossenVsBeleggenDefaults = Partial<{
  mortgageRate: string;
  remainingTermYears: string;
  taxableIncome: string;
  expectedAnnualReturn: string;
  investmentHorizonYears: string;
  currentInvestableAssets: string;
  hasFiscalPartner: boolean;
  taxYear: string;
  minimumBuffer: string;
  annualExtraRepayment: string;
}>;

type ZzpUurtariefDefaults = Partial<{
  taxYear: string;
  targetNetMonthlyIncome: string;
  monthlyBufferReserve: string;
  monthlyPensionReserve: string;
  pensionReservePercent: string;
  monthlyAovPremium: string;
  grossAnnualSalaryComparison: string;
  monthlyBusinessCosts: string;
}>;

function toStringValue(value?: number) {
  return value === undefined ? undefined : String(value);
}

function getProfileDuoRateYear(profile: UserProfile) {
  const storedRateYear = profile.studentDebt?.duoRateYear;
  if (
    storedRateYear !== undefined &&
    getAvailableDuoRateYears().includes(storedRateYear)
  ) {
    return String(storedRateYear);
  }

  const repaymentRule = profile.studentDebt?.repaymentRule;
  const duoInterestRate = profile.studentDebt?.duoInterestRate;

  if (
    !repaymentRule ||
    repaymentRule === "UNKNOWN" ||
    duoInterestRate === undefined
  ) {
    return undefined;
  }

  const rateYear = getDuoHistoricalRateYearForRule(
    repaymentRule,
    duoInterestRate,
  );
  return rateYear === undefined ? undefined : String(rateYear);
}

function getProfileDebtPartDefaults(
  profile: UserProfile,
): ProfileDebtPartFormDefault[] {
  const availableRateYears = new Set(getAvailableDuoRateYears());

  return (profile.studentDebt?.debtParts ?? [])
    .filter(
      (part) =>
        part.remainingDebt > 0 && availableRateYears.has(part.rateYear),
    )
    .map((part, index) => ({
      id: `profile-duo-debt-part-${index + 1}`,
      amount: String(part.remainingDebt),
      rateYear: String(part.rateYear),
    }));
}

export function getDuoMonthlyPaymentDefaultsFromProfile(
  profile: UserProfile,
): DuoMonthlyPaymentDefaults {
  const defaults: DuoMonthlyPaymentDefaults = {};
  const remainingDebt = toStringValue(profile.studentDebt?.remainingDebt);
  const duoRateYear = getProfileDuoRateYear(profile);
  const debtParts = getProfileDebtPartDefaults(profile);

  if (remainingDebt !== undefined) {
    defaults.remainingDebt = remainingDebt;
  }
  if (profile.studentDebt?.repaymentRule) {
    defaults.repaymentRule = profile.studentDebt.repaymentRule;
  }
  if (duoRateYear) {
    defaults.duoRateYear = duoRateYear;
  }
  if (debtParts.length > 0) {
    defaults.useDebtParts = true;
    defaults.debtParts = debtParts;
  }
  if (profile.income?.householdType === "single") {
    defaults.householdSituation = "single";
  } else if (profile.income?.householdType === "withPartner") {
    defaults.householdSituation = "partner";
  }

  return defaults;
}

export function getDuoExtraRepaymentDefaultsFromProfile(
  profile: UserProfile,
): DuoExtraRepaymentDefaults {
  const defaults: DuoExtraRepaymentDefaults = {};
  const remainingDebt = toStringValue(profile.studentDebt?.remainingDebt);
  const currentMonthlyPayment = toStringValue(
    profile.studentDebt?.currentMonthlyPayment,
  );
  const duoRateYear = getProfileDuoRateYear(profile);
  const debtParts = getProfileDebtPartDefaults(profile);

  if (remainingDebt !== undefined) {
    defaults.remainingDebt = remainingDebt;
  }
  if (profile.studentDebt?.repaymentRule) {
    defaults.repaymentRule = profile.studentDebt.repaymentRule;
  }
  if (duoRateYear) {
    defaults.duoRateYear = duoRateYear;
  }
  if (currentMonthlyPayment !== undefined) {
    defaults.currentMonthlyPayment = currentMonthlyPayment;
  }
  if (debtParts.length > 0) {
    defaults.useDebtParts = true;
    defaults.debtParts = debtParts;
  }

  return defaults;
}

function mapDuoSituationToMortgageStatus(
  situation?: ProfileDuoSituation,
): MaxMortgageDefaults["studentLoanStatus"] {
  const statusBySituation: Partial<
    Record<
      ProfileDuoSituation,
      NonNullable<MaxMortgageDefaults["studentLoanStatus"]>
    >
  > = {
    repaying: "repaying",
    gracePeriod: "start_phase",
    incomeBasedReduction: "reduced_capacity",
    paymentPause: "payment_pause",
    unknown: "unknown",
  };

  return situation ? statusBySituation[situation] : undefined;
}

export function getMaxMortgageDefaultsFromProfile(
  profile: UserProfile,
): MaxMortgageDefaults {
  const defaults: MaxMortgageDefaults = {};
  const grossIncome = toStringValue(profile.income?.grossAnnualIncome);
  const partnerIncome = toStringValue(
    profile.income?.partnerGrossAnnualIncome,
  );
  const mortgageRate = toStringValue(profile.housing?.mortgageRate);
  const mortgageTerm = toStringValue(profile.housing?.mortgageTermYears);
  const targetHomePrice = toStringValue(profile.housing?.targetHomePrice);
  const ownFunds = toStringValue(profile.housing?.ownFunds);
  const actualMonthlyPayment = toStringValue(
    profile.studentDebt?.currentMonthlyPayment,
  );
  const statutoryMonthlyPayment = toStringValue(
    profile.studentDebt?.statutoryMonthlyPayment ??
      profile.studentDebt?.mortgageAssessmentMonthlyPayment,
  );
  const studentLoanAmounts = [
    profile.studentDebt?.remainingDebt,
    profile.studentDebt?.currentMonthlyPayment,
    profile.studentDebt?.statutoryMonthlyPayment,
    profile.studentDebt?.mortgageAssessmentMonthlyPayment,
  ];
  const hasStudentLoan = studentLoanAmounts.some(
    (value) => value !== undefined && value > 0,
  );
  const hasStudentLoanAnswer = studentLoanAmounts.some(
    (value) => value !== undefined,
  );
  const studentLoanStatus = mapDuoSituationToMortgageStatus(
    profile.studentDebt?.duoSituation,
  );

  if (grossIncome !== undefined) {
    defaults.grossAnnualHouseholdIncome = grossIncome;
  }
  if (partnerIncome !== undefined) {
    defaults.grossAnnualPartnerIncome = partnerIncome;
  }
  if (mortgageRate !== undefined) {
    defaults.annualMortgageRate = mortgageRate;
  }
  if (mortgageTerm !== undefined) {
    defaults.mortgageTermYears = mortgageTerm;
  }
  if (targetHomePrice !== undefined) {
    defaults.purchasePrice = targetHomePrice;
    defaults.marketValue = targetHomePrice;
  }
  if (ownFunds !== undefined) {
    defaults.ownFunds = ownFunds;
  }
  if (hasStudentLoanAnswer) {
    defaults.hasStudentLoan = hasStudentLoan;
  }
  if (studentLoanStatus) {
    defaults.studentLoanStatus = studentLoanStatus;
  }
  if (actualMonthlyPayment !== undefined) {
    defaults.actualMonthlyPayment = actualMonthlyPayment;
  }
  if (statutoryMonthlyPayment !== undefined) {
    defaults.statutoryMonthlyPayment = statutoryMonthlyPayment;
  }

  return defaults;
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
    profile.studentDebt?.statutoryMonthlyPayment ??
      profile.studentDebt?.mortgageAssessmentMonthlyPayment,
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

  const duoRateYear = getProfileDuoRateYear(profile);
  if (duoRateYear !== undefined) {
    defaults.duoRateYear = duoRateYear;
  }

  const debtParts = getProfileDebtPartDefaults(profile);
  if (debtParts.length > 0) {
    defaults.useDebtParts = true;
    defaults.debtParts = debtParts;
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

export function getPriveBeleggenEindvermogenDefaultsFromProfile(
  profile: UserProfile,
): PriveBeleggenEindvermogenDefaults {
  const defaults: PriveBeleggenEindvermogenDefaults = {};

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

  if (profile.tax?.preferredBox3Method !== undefined) {
    defaults.box3Method = profile.tax.preferredBox3Method;
  }

  const startVermogen = toStringValue(profile.savingInvesting?.currentSavings);
  if (startVermogen !== undefined) {
    defaults.startVermogen = startVermogen;
  }

  const maandelijkseInleg = toStringValue(profile.savingInvesting?.monthlyFreeCashflow);
  if (maandelijkseInleg !== undefined) {
    defaults.maandelijkseInleg = maandelijkseInleg;
  }

  const verwachtRendementPct = toStringValue(
    profile.savingInvesting?.expectedAnnualReturn,
  );
  if (verwachtRendementPct !== undefined) {
    defaults.verwachtRendementPct = verwachtRendementPct;
  }

  const horizonJaren = toStringValue(
    profile.savingInvesting?.investmentHorizonYears,
  );
  if (horizonJaren !== undefined) {
    defaults.horizonJaren = horizonJaren;
  }

  return defaults;
}

export function getHypotheekAflossenVsBeleggenDefaultsFromProfile(
  profile: UserProfile,
): HypotheekAflossenVsBeleggenDefaults {
  const defaults: HypotheekAflossenVsBeleggenDefaults = {};

  const mortgageRate = toStringValue(profile.housing?.mortgageRate);
  if (mortgageRate !== undefined) {
    defaults.mortgageRate = mortgageRate;
  }

  const remainingTermYears = toStringValue(profile.housing?.mortgageTermYears);
  if (remainingTermYears !== undefined) {
    defaults.remainingTermYears = remainingTermYears;
  }

  const taxableIncome = toStringValue(profile.income?.grossAnnualIncome);
  if (taxableIncome !== undefined) {
    defaults.taxableIncome = taxableIncome;
  }

  const expectedAnnualReturn = toStringValue(
    profile.savingInvesting?.expectedAnnualReturn,
  );
  if (expectedAnnualReturn !== undefined) {
    defaults.expectedAnnualReturn = expectedAnnualReturn;
  }

  const investmentHorizonYears = toStringValue(
    profile.savingInvesting?.investmentHorizonYears,
  );
  if (investmentHorizonYears !== undefined) {
    defaults.investmentHorizonYears = investmentHorizonYears;
  }

  const currentInvestableAssets = toStringValue(
    profile.savingInvesting?.currentSavings,
  );
  if (currentInvestableAssets !== undefined) {
    defaults.currentInvestableAssets = currentInvestableAssets;
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

  const taxYear = toStringValue(profile.tax?.preferredTaxYear);
  if (taxYear !== undefined) {
    defaults.taxYear = taxYear;
  }

  const minimumBuffer = toStringValue(profile.savingInvesting?.targetEmergencyFund);
  if (minimumBuffer !== undefined) {
    defaults.minimumBuffer = minimumBuffer;
  }

  const monthlyFreeCashflow = profile.savingInvesting?.monthlyFreeCashflow;
  if (monthlyFreeCashflow !== undefined && Number.isFinite(monthlyFreeCashflow)) {
    defaults.annualExtraRepayment = String(Math.max(monthlyFreeCashflow, 0) * 12);
  }

  return defaults;
}

export function getZzpUurtariefDefaultsFromProfile(
  profile: UserProfile,
): ZzpUurtariefDefaults {
  const defaults: ZzpUurtariefDefaults = {};

  const taxYear = toStringValue(profile.tax?.preferredTaxYear);
  if (taxYear !== undefined) {
    defaults.taxYear = taxYear;
  }

  const grossAnnualIncome = toStringValue(profile.income?.grossAnnualIncome);
  if (grossAnnualIncome !== undefined) {
    defaults.grossAnnualSalaryComparison = grossAnnualIncome;
    defaults.targetNetMonthlyIncome = String(Math.round(Number(grossAnnualIncome) * 0.5 / 12));
  }

  const monthlyBufferReserve = toStringValue(profile.savingInvesting?.targetEmergencyFund);
  if (monthlyBufferReserve !== undefined) {
    defaults.monthlyBufferReserve = String(
      Math.round(Math.max(Number(monthlyBufferReserve), 0) / 12),
    );
  }

  const employmentProfile = profile as UserProfile & {
    employment?: {
      grossAnnualSalary?: number;
      businessProfitBeforeTax?: number;
      aovPremiumAnnual?: number;
      pensionContributionAnnual?: number;
    };
  };

  const grossAnnualSalary = toStringValue(
    employmentProfile.employment?.grossAnnualSalary,
  );
  if (grossAnnualSalary !== undefined) {
    defaults.grossAnnualSalaryComparison = grossAnnualSalary;
  }

  const businessProfitBeforeTax = toStringValue(
    employmentProfile.employment?.businessProfitBeforeTax,
  );
  if (businessProfitBeforeTax !== undefined) {
    defaults.targetNetMonthlyIncome = String(
      Math.round(Math.max(Number(businessProfitBeforeTax), 0) * 0.5 / 12),
    );
  }

  const aovPremiumAnnual = toStringValue(
    employmentProfile.employment?.aovPremiumAnnual,
  );
  if (aovPremiumAnnual !== undefined) {
    defaults.monthlyAovPremium = String(
      Math.round(Math.max(Number(aovPremiumAnnual), 0) / 12),
    );
  }

  const pensionContributionAnnual = toStringValue(
    employmentProfile.employment?.pensionContributionAnnual,
  );
  if (pensionContributionAnnual !== undefined) {
    defaults.monthlyPensionReserve = String(
      Math.round(Math.max(Number(pensionContributionAnnual), 0) / 12),
    );
  } else if (profile.savingInvesting?.pensionBuildUp === "none") {
    defaults.pensionReservePercent = "15";
  }

  if (profile.savingInvesting?.hasAov === false) {
    defaults.monthlyAovPremium = defaults.monthlyAovPremium ?? "0";
  }

  if (profile.savingInvesting?.monthlyFreeCashflow !== undefined) {
    defaults.monthlyBusinessCosts = String(
      Math.round(Math.max(profile.savingInvesting.monthlyFreeCashflow * 0.25, 0)),
    );
  }

  return defaults;
}
