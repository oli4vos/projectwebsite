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

export type ExtraRepaymentStrategy = "lowerMonthlyPayment" | "shortenTerm";

export type DuoDebtPartInput = {
  label?: string;
  remainingDebt?: number;
  rateYear?: number;
  annualInterestRate?: number;
};

export type DuoDebtPartResolved = {
  key: string;
  label: string;
  remainingDebt: number;
  rateYear: number;
  annualInterestRate: number;
  statutoryMonthlyPayment: number;
  debtShare: number;
};

export type DuoDebtPortfolioSummary = {
  usesDebtParts: boolean;
  totalDebt: number;
  totalStatutoryMonthlyPayment: number;
  blendedAnnualInterestRate: number;
  rateYearUsed: number;
  parts: DuoDebtPartResolved[];
  warnings: string[];
};

export type DuoRepaymentInput = {
  remainingDebt?: number;
  annualInterestRate?: number;
  duoRateYear?: number;
  remainingTermYears?: number;
  repaymentRule?: RepaymentRule;
  debtParts?: DuoDebtPartInput[];
};

export type DuoIncomeBasedInput = {
  grossAnnualIncome?: number;
  partnerGrossAnnualIncome?: number;
  hasPartner?: boolean;
  repaymentRule?: RepaymentRule;
  statutoryMonthlyPayment?: number;
};

export type DuoIncomeBasedMonthlyPaymentResult = {
  annualIncomeUsed: number;
  allowanceUsed: number;
  amountAboveAllowance: number;
  percentageUsed: number | null;
  incomeBasedMonthlyPayment: number;
  requiredMonthlyPayment: number;
  source: "incomeBased" | "statutoryOnly" | "unknownRuleFallback";
  warnings: string[];
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

export type DuoPayoffTimingInput = DuoRepaymentInput & {
  monthlyPayment?: number;
  startDate?: string;
};

export type DuoPayoffTimingResult = {
  monthsRemaining: number;
  yearsRemaining: number;
  payoffDate: string | null;
  explanation: string;
  warnings: string[];
};

export type ExtraRepaymentPayoffImpactInput = DuoPayoffTimingInput & {
  extraRepaymentAmount?: number;
  strategy?: ExtraRepaymentStrategy;
};

export type ExtraRepaymentPayoffImpactResult = {
  strategy: ExtraRepaymentStrategy;
  extraRepaymentUsed: number;
  originalMonthsRemaining: number;
  newMonthsRemaining: number;
  monthsSaved: number;
  yearsSaved: number;
  originalPayoffDate: string | null;
  newPayoffDate: string | null;
  newRemainingDebt: number;
  oldMonthlyPayment: number;
  newMonthlyPayment: number;
  explanation: string;
  warnings: string[];
};

export type DuoRepaymentTimelinePoint = {
  month: number;
  date: string;
  openingDebt: number;
  interest: number;
  payment: number;
  principalPaid: number;
  closingDebt: number;
};

export type DuoRepaymentTimelineSummary = {
  months: number;
  payoffDate: string | null;
  totalPaid: number;
  totalInterest: number;
  finalDebt: number;
  points: DuoRepaymentTimelinePoint[];
};

export type DuoExtraRepaymentProjectionInput = DuoRepaymentInput & {
  monthlyPayment?: number;
  extraRepaymentAmount?: number;
  extraMonthlyAmount?: number;
  strategy?: ExtraRepaymentStrategy;
  startDate?: string;
};

export type DuoExtraRepaymentProjectionResult = {
  repaymentRule: RepaymentRule;
  annualInterestRateUsed: number;
  remainingTermYearsUsed: number;
  originalMonthlyPayment: number;
  extraRepaymentUsed: number;
  extraMonthlyAmountUsed: number;
  newRemainingDebt: number;
  newRequiredMonthlyPayment: number;
  effectiveNewMonthlyPayment: number;
  interestSaved: number;
  payoffImpact: ExtraRepaymentPayoffImpactResult;
  timelineBefore: DuoRepaymentTimelineSummary;
  timelineAfter: DuoRepaymentTimelineSummary;
  warnings: string[];
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

export type DuoLoanProjectionInput = {
  currentDebt: number;
  monthlyLoanAmount: number;
  expectedLastLoanMonth: string;
  includeMortgageImpact?: boolean;
};

export type DuoLoanProjectionContext = {
  calculationMonth?: string;
  repaymentRegime?: "SF35";
  duoRateVersion?: string;
  normYear?: number;
  getAnnualInterestRateForYear?: (year: number) => number;
  calculateMortgageCapacityReduction?: (monthlyPayment: number) => number;
};

export type DuoLoanProjectionMortgageImpact = {
  reductionStopNow: number;
  reductionKeepBorrowing: number;
  difference: number;
};

export type DuoLoanProjectionResult = {
  calculationMonth: string;
  lastLoanMonth: string;
  borrowingMonths: number;
  futurePrincipalBorrowed: number;
  interestDuringBorrowingPhase: number;
  debtAtLastLoanMonth: number;
  repaymentStartMonth: string;
  gracePeriodMonths: number;
  interestDuringGracePeriod: number;
  debtAtRepaymentStart: number;
  projectedAnnualInterestRate: number;
  repaymentTermMonths: number;
  theoreticalMonthlyPayment: number;
  totalRepayment: number;
  totalInterest: number;
  mortgageImpact?: DuoLoanProjectionMortgageImpact;
  assumptions: string[];
  normVersion: string;
};
