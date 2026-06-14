export type MortgageAnnuityInput = {
  principal: number;
  annualRate: number;
  years: number;
};

export type MortgagePresentValueInput = {
  monthlyPayment: number;
  annualRate: number;
  years: number;
};

export type MortgageMaxMortgageHouseholdType = "single" | "partners";

export type MortgageMaxMortgageRepaymentType = "annuity" | "linear";

export type MortgageMaxMortgageLiabilityType =
  | "student_loan"
  | "personal_loan"
  | "revolving_credit"
  | "private_lease"
  | "credit_card"
  | "overdraft"
  | "partner_alimony"
  | "child_alimony"
  | "ground_lease"
  | "other";

export type MortgageMaxMortgageStudentLoanStatus =
  | "repaying"
  | "start_phase"
  | "reduced_capacity"
  | "payment_pause"
  | "unknown";

export type MortgageMaxMortgageWarningCode =
  | "INDICATIVE_ONLY"
  | "MISSING_STUDENT_LOAN_PAYMENT"
  | "MISSING_INCOME"
  | "MISSING_RATE"
  | "MISSING_TERM"
  | "FINANCING_LOAD_TABLE_FALLBACK"
  | "LTV_LIMITING"
  | "INCOME_LIMITING"
  | "NHG_LIMITING"
  | "OWN_FUNDS_SHORTAGE";

export type MortgageMaxMortgageLimitingFactor =
  | "income"
  | "ltv"
  | "nhg"
  | "own-funds"
  | "none";

export type MortgageMaxMortgageDetailedLimitingFactor =
  | "income"
  | "collateral"
  | "both"
  | "unknown";

export type MortgageMaxMortgageWarningSeverity =
  | "info"
  | "warning"
  | "blocking";

export type MortgageMaxMortgageWarning = {
  code: MortgageMaxMortgageWarningCode;
  severity: MortgageMaxMortgageWarningSeverity;
  message: string;
};

export type MortgageMaxMortgageLiabilityInput = {
  type: MortgageMaxMortgageLiabilityType;
  monthlyPayment?: number;
  currentBalance?: number;
  creditLimit?: number;
  annualCanon?: number;
};

export type MortgageMaxMortgageStudentLoanInput = {
  hasStudentLoan?: boolean;
  currentBalance?: number;
  actualMonthlyPayment?: number;
  statutoryMonthlyPayment?: number;
  status?: MortgageMaxMortgageStudentLoanStatus;
  plannedExtraRepayment?: number;
};

export type MortgageMaxMortgagePropertyInput = {
  propertyValue?: number;
  purchasePrice?: number;
  marketValue?: number;
  ltvPercentage?: number;
  energyLabel?:
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
    | "A++++_guarantee"
    | "unknown";
  energySavingMeasuresAmount?: number;
  renovationAmount?: number;
  nhgRequested?: boolean;
};

export type MortgageMaxMortgageInput = {
  grossAnnualHouseholdIncome: number;
  grossAnnualPartnerIncome?: number;
  annualMortgageRate?: number;
  fixedRatePeriodMonths?: number;
  mortgageTermYears?: number;
  borrowerAgeYears?: number;
  householdType?: MortgageMaxMortgageHouseholdType;
  repaymentType?: MortgageMaxMortgageRepaymentType;
  monthlyFinancialObligations?: number;
  monthlyDebtPayments?: number;
  liabilities?: MortgageMaxMortgageLiabilityInput[];
  studentLoan?: MortgageMaxMortgageStudentLoanInput;
  studentDebtMonthlyPayment?: number;
  studentDebtNormativeMonthlyPayment?: number;
  studentDebtRegime?: "SF15" | "SF35" | "unknown";
  property?: MortgageMaxMortgagePropertyInput;
  ownFunds?: number;
  buyerCostRate?: number;
  incomeHousingCostRatio?: number;
  nhgStandardLimit?: number;
  nhgWithEnergyLimit?: number;
  afmStressAnnualRate?: number;
};

export type MortgageMaxMortgageBreakdown = {
  householdIncome: number;
  partnerIncome: number;
  annualMortgageRateUsed: number;
  testRateUsed: number;
  testRateSource: "input" | "afm_stress_rate";
  mortgageTermMonths: number;
  annualHousingCostRatio: number;
  financingLoadSource: "input" | "official_table" | "fallback";
  financingLoadTableYear?: number;
  financingLoadTableVersion?: string;
  financingLoadTableSourceUrl?: string;
  financingLoadAgeGroup?: "beforeAow" | "fromAow";
  monthlyHousingBudgetBeforeLiabilities: number;
  monthlyLiabilityImpact: number;
  studentLoanMonthlyImpact: number;
  studentLoanBorrowingCapacityImpact: number;
  monthlyHousingBudgetAfterLiabilities: number;
  baseMaxMortgageByIncome: number;
  energyLabelAllowance: number;
  propertyValue: number;
  purchasePrice: number;
  marketValue: number;
  ltvPercentage: number;
  baseMaxMortgageByLtv: number;
  maxMortgageByIncome: number;
  maxMortgageByLtv: number;
  maxMortgageByNhg?: number;
  buyerCostsEstimate: number;
  energySavingAllowance: number;
  ownFunds: number;
  requiredOwnFunds: number;
};

export type MortgageMaxMortgageDebug = {
  toetsinkomen: number;
  primaryIncome: number;
  partnerIncome: number;
  financingLoadPercentage: number;
  maxAnnualHousingCost: number;
  maxMonthlyHousingCost: number;
  monthlyObligations: number;
  availableMortgageMonthlyCost: number;
  annuityFactor: number;
  interestRate: number;
  durationMonths: number;
  collateralValue: number | null;
  ownFunds: number;
  ltvPercentage: number | null;
};

export type MortgageMaxMortgageResult = {
  normYear: number;
  maxMortgageByIncome: number;
  maxMortgageByCollateral: number | null;
  finalMaxMortgage: number;
  maxHomeBudget: number | null;
  limitingFactorDetailed: MortgageMaxMortgageDetailedLimitingFactor;
  debug: MortgageMaxMortgageDebug;
  maxMortgageFinal: number;
  monthlyPaymentGross: number;
  monthlyHousingBudget: number;
  fundingGap: number;
  limitingFactor: MortgageMaxMortgageLimitingFactor;
  confidence: "high" | "medium" | "low";
  warnings: MortgageMaxMortgageWarning[];
  assumptions: string[];
  breakdown: MortgageMaxMortgageBreakdown;
};
