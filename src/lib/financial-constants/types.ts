export type AssumptionStatus = "definitief" | "voorlopig" | "indicatief";

export type AssumptionMeta = {
  sourceLabel: string;
  lastChecked: string;
  status: AssumptionStatus;
  notes?: string;
};

export type GrossUpFactorBand = {
  minRate: number;
  maxRate: number | null;
  factor: number;
  label: string;
};

export type RepaymentRuleKey =
  | "SF35"
  | "SF15"
  | "SF15_OLD"
  | "SF15_LLLK"
  | "UNKNOWN";

export type AnnualFinancialConstants = {
  year: number;
  duo: {
    meta: AssumptionMeta;
    rates: Record<RepaymentRuleKey, number>;
    defaultTerms: Record<RepaymentRuleKey, number>;
  };
  mortgage: {
    meta: AssumptionMeta;
    defaultMortgageRate: number;
    defaultMortgageTermYears: number;
    studentDebtGrossUpFactors: GrossUpFactorBand[];
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
