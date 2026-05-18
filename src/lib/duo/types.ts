export type DuoSituation =
  | "repaying"
  | "gracePeriod"
  | "incomeBasedReduction"
  | "paymentPause"
  | "unknown";

export type RepaymentRule =
  | "SF35"
  | "SF15"
  | "SF15_OLD"
  | "SF15_LLLK"
  | "UNKNOWN";

export type DuoPaymentSource =
  | "actual"
  | "statutory"
  | "estimated"
  | "incomeBased"
  | "mixed";

export type DuoRepaymentInput = {
  remainingDebt?: number;
  annualInterestRate?: number;
  remainingTermYears?: number;
  repaymentRule?: RepaymentRule;
};

export type DuoIncomeBasedInput = {
  grossAnnualIncome?: number;
  partnerGrossAnnualIncome?: number;
  hasPartner?: boolean;
  repaymentRule?: RepaymentRule;
  statutoryMonthlyPayment?: number;
};

export type DuoRelevantPaymentInput = DuoRepaymentInput & {
  situation?: DuoSituation;
  currentMonthlyPayment?: number;
  statutoryMonthlyPayment?: number;
  grossAnnualIncome?: number;
  partnerGrossAnnualIncome?: number;
};

export type ExtraRepaymentVsInvestingInput = {
  remainingDebt?: number;
  repaymentRule?: RepaymentRule;
  annualDuoInterestRate?: number;
  remainingTermYears?: number;
  extraRepaymentAmount?: number;
  monthlyExtraAmount?: number;
  expectedAnnualReturn?: number;
  investmentHorizonYears?: number;
  box3TaxDragPercent?: number;
};

export type DuoMonthlyPaymentAfterExtraRepaymentInput = DuoRepaymentInput & {
  extraRepaymentAmount?: number;
};

export type RelevantDuoPaymentResult = {
  primaryMonthlyPayment: number;
  optimisticMonthlyPayment: number;
  conservativeMonthlyPayment: number;
  statutoryMonthlyPayment: number;
  estimatedStatutoryMonthlyPayment: number;
  source: DuoPaymentSource;
  explanation: string;
  warnings: string[];
};
