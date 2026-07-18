export type AssumptionStatus = "definitief" | "voorlopig" | "indicatief";

export type SourceTier =
  | "wet"
  | "normadvies"
  | "toezicht"
  | "overheidsuitleg"
  | "praktijk"
  | "indicatieve-benadering"
  | "projectaanname";

export type AssumptionMeta = {
  sourceLabel: string;
  lastChecked: string;
  status: AssumptionStatus;
  notes?: string;
  sourceUrl: string | null;
  sourceTier: SourceTier;
  publishedAt?: string;
  validFrom?: string;
  validUntil?: string;
  appliesTo?: string;
  unit?: string;
  ruleType?: "wet" | "uitvoeringsbeleid" | "marktpraktijk" | "projectaanname" | "interpretatie";
  uncertainties?: string;
};

export type GrossUpFactorBand = {
  minRate: number;
  maxRate: number | null;
  factor: number;
  label: string;
};

export type MortgageEnergyLabelKey =
  | "G"
  | "F"
  | "E"
  | "D"
  | "C"
  | "B"
  | "A"
  | "A+"
  | "A++"
  | "A+++"
  | "A++++"
  | "APLUSGUARANTEE"
  | "unknown";

export type MortgageNhgRules = {
  meta: AssumptionMeta;
  standardLimit: number;
  withEnergyMeasuresLimit: number;
  guaranteeFeePercent: number;
};

export type MortgageLtvRules = {
  meta: AssumptionMeta;
  baseMaxLtvPercent: number;
  energySavingMeasuresMaxLtvPercent: number;
  energySavingMeasuresAllowanceCapRatio: number;
};

export type MortgageEnergyRules = {
  meta: AssumptionMeta;
  purchaseAllowances: Record<MortgageEnergyLabelKey, number>;
  energySavingMeasureAllowances: Record<MortgageEnergyLabelKey, number>;
};

export type MortgageAfmTestRate = {
  meta: AssumptionMeta;
  quarter: string;
  rate: number;
};

export type MortgageFinancingLoadAgeGroup = "beforeAow" | "fromAow";

export type MortgageFinancingLoadRateBand = {
  maxRate: number | null;
  label: string;
};

export type MortgageFinancingLoadRow = {
  minIncome: number;
  percentages: readonly number[];
};

export type MortgageFinancingLoadData = {
  normYear: number;
  versionLabel: string;
  sourceLabel: string;
  sourceUrl: string;
  lastChecked: string;
  status: AssumptionStatus;
  rateBands: readonly MortgageFinancingLoadRateBand[];
  beforeAow: readonly MortgageFinancingLoadRow[];
  fromAow: readonly MortgageFinancingLoadRow[];
};

export type MortgageFinancingLoadTable = {
  normYear: number;
  versionLabel: string;
  sourceLabel: string;
  sourceUrl: string;
  lastChecked: string;
  status: AssumptionStatus;
  ageGroup: MortgageFinancingLoadAgeGroup;
  rateBands: readonly MortgageFinancingLoadRateBand[];
  rows: readonly MortgageFinancingLoadRow[];
};

export type MortgageFinancingLoadLookupInput = {
  annualIncome: number;
  mortgageRate: number;
  ageYears?: number;
  year?: number;
};

export type RepaymentRuleKey =
  | "SF35"
  | "SF15"
  | "SF15_OLD"
  | "SF15_LLLK"
  | "UNKNOWN";

export type DuoIncomeBasedRule = {
  singleAllowance: number;
  partnerOrSingleParentAllowance: number;
  percentage: number | null;
  notes?: string;
};

export type AnnualFinancialConstants = {
  year: number;
  duo: {
    meta: AssumptionMeta;
    rates: Record<RepaymentRuleKey, number>;
    defaultTerms: Record<RepaymentRuleKey, number>;
    incomeBasedRules: Record<RepaymentRuleKey, DuoIncomeBasedRule>;
    borrowingLimits: {
      monthlyLoanAmountMax: number;
      monthlyLoanAmountStep: number;
      sourceUrl: string;
      notes: string;
    };
  };
  mortgage: {
    meta: AssumptionMeta;
    defaultMortgageRate: number;
    defaultMortgageTermYears: number;
    indicativeIncomeHousingCostRatio: number;
    studentDebtGrossUpFactors: GrossUpFactorBand[];
    nhg: MortgageNhgRules;
    ltv: MortgageLtvRules;
    energy: MortgageEnergyRules;
    afmTestRates: MortgageAfmTestRate[];
    defaultAfmTestRateQuarter: string;
  };
  box1: {
    meta: AssumptionMeta;
    brackets: Array<{
      upTo: number | null;
      rate: number;
      label: string;
    }>;
    mortgageInterestDeductionMaxRate?: number;
  };
  box3: {
    meta: AssumptionMeta;
    taxRate: number;
    taxFreeAllowanceSingle: number;
    taxFreeAllowancePartners: number;
    deemedReturns: {
      bankDeposits: number;
      investmentsAndOtherAssets: number;
      debts: number;
    };
  };
  charts: {
    meta: AssumptionMeta;
    defaultCurrency: "EUR";
    defaultTimeUnit: "years";
  };
};
