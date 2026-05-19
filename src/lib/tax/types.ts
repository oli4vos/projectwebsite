export type TaxYear = number;
export type Box3Method = "actual" | "forfaitary";

export type Box1IncomeInput = {
  taxableIncome: number;
  year?: TaxYear;
};

export type Box1TaxResult = {
  year: TaxYear;
  taxableIncome: number;
  totalTax: number;
  effectiveRate: number;
  marginalRate: number;
  bracketBreakdown: Array<{
    label: string;
    taxableAmount: number;
    rate: number;
    tax: number;
  }>;
  warnings: string[];
};

export type MortgageInterestDeductionInput = {
  annualMortgageInterest: number;
  taxableIncome: number;
  year?: TaxYear;
};

export type MortgageInterestDeductionResult = {
  year: TaxYear;
  annualMortgageInterest: number;
  appliedDeductionRate: number;
  grossInterest: number;
  estimatedTaxBenefit: number;
  netInterestCost: number;
  warnings: string[];
};

export type Box3Input = {
  bankDeposits?: number;
  investmentsAndOtherAssets?: number;
  debts?: number;
  hasFiscalPartner?: boolean;
  method?: Box3Method;
  actualAnnualReturnRate?: number;
  year?: TaxYear;
};

export type Box3Result = {
  year: TaxYear;
  assetsTotal: number;
  debtsTotal: number;
  taxFreeAllowance: number;
  taxableBase: number;
  deemedReturnBankDeposits: number;
  deemedReturnInvestments: number;
  deemedReturnDebts: number;
  taxableDeemedReturn: number;
  box3Tax: number;
  effectiveTaxRateOnNetWorth: number;
  method: Box3Method;
  warnings: string[];
};
