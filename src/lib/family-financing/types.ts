import type {
  DuoRelevantPaymentInput,
} from "@/lib/duo";
import type { MortgageAnnuityInput } from "@/lib/mortgage";

/**
 * Jaarlijks percentage. Geen fiscaal of juridisch advies.
 */
export type AnnualPercent = number;

/**
 * Eurobedrag als `number`, tenzij expliciet anders genoteerd.
 */
export type EuroAmount = number;

export type FamilyLoanRepaymentType = "annuity" | "linear";

export type GiftFrequency = "monthly" | "quarterly" | "yearly";

export type FinancingSourceType =
  | "bankMortgage"
  | "familyLoan"
  | "oneTimeGift"
  | "recurringGift"
  | "ownFunds"
  | "duoDebt";

export type AssumptionStatus =
  | "verified"
  | "unverified"
  | "user-provided"
  | "illustrative";

/**
 * Centrale metadata voor aannames, bronnen en versieerbare context.
 */
export type AssumptionMetadata = {
  key: string;
  name: string;
  description: string;
  value: number | string | boolean | null;
  valueRef?: string;
  unit?: string;
  source?: string;
  validityYear?: number;
  lastCheckedAt?: string;
  status: AssumptionStatus;
};

export type FamilyLoanInput = {
  principal: EuroAmount;
  annualRate: AnnualPercent;
  termYears: number;
  repaymentType: FamilyLoanRepaymentType;
  startDate?: string;
  monthlyPaymentOverride?: EuroAmount;
};

export type OneTimeGiftInput = {
  kind: "one-time";
  amount: EuroAmount;
  transferDate?: string;
  guaranteed?: false;
};

export type RecurringGiftInput = {
  kind: "recurring";
  amountPerPeriod: EuroAmount;
  frequency: GiftFrequency;
  startDate?: string;
  endDate?: string;
  maxPayments?: number;
  guaranteed?: false;
};

export type GiftInput = OneTimeGiftInput | RecurringGiftInput;

/**
 * Bankinge hypotheek in pure contractvorm, zonder berekening.
 */
export type BankMortgageInput = MortgageAnnuityInput & {
  monthlyPaymentOverride?: EuroAmount;
};

/**
 * DUO-context wordt hergebruikt via de centrale DUO-contracten.
 */
export type DuoContextInput = DuoRelevantPaymentInput;

export type PurchaseFinancingInput = {
  purchasePrice: EuroAmount;
  acquisitionCosts?: EuroAmount;
  ownFunds?: EuroAmount;
  minimumBuffer?: EuroAmount;
  bankMortgage?: BankMortgageInput;
  familyLoan?: FamilyLoanInput;
  gifts?: GiftInput[];
  duo?: DuoContextInput;
};

export type HouseholdCashflow = {
  period: "month" | "year";
  bankMortgagePayment?: EuroAmount;
  familyLoanPayment?: EuroAmount;
  duoPayment?: EuroAmount;
  receivedGift?: EuroAmount;
  otherHousingCosts?: EuroAmount;
  grossContractualOutflow?: EuroAmount;
  netCashOutflowAfterReceipts?: EuroAmount;
};

export type ParentCashflowSummary = {
  familyLoanPrincipalAdvanced?: EuroAmount;
  interestReceived?: EuroAmount;
  principalReceived?: EuroAmount;
  giftGiven?: EuroAmount;
  netCashflow?: EuroAmount;
  remainingClaim?: EuroAmount;
};

export type StressTestType =
  | "giftStops"
  | "rateChanges"
  | "incomeDrops"
  | "unexpectedCosts"
  | "bufferBreach";

export type StressTestResult = {
  type: StressTestType;
  passed: boolean;
  financialEffect: EuroAmount;
  bufferAfterStress?: EuroAmount;
  warnings: string[];
};

export type FinancingScenarioType =
  | "bank-and-own-funds"
  | "gift-as-own-funds"
  | "gift-for-duo-repayment"
  | "family-loan"
  | "family-loan-with-gift"
  | "gift-versus-loan"
  | "minimum-buffer"
  | "gift-stops";

export type FinancingScenario = {
  id: string;
  title: string;
  description: string;
  type: FinancingScenarioType;
  input: PurchaseFinancingInput;
  usedSources: FinancingSourceType[];
  assumptions: AssumptionMetadata[];
  includesFutureGifts: boolean;
};

export type DebtBySource = {
  bankMortgage?: EuroAmount;
  familyLoan?: EuroAmount;
  duoDebt?: EuroAmount;
};

export type FinancingScenarioResult = {
  totalFinancing?: EuroAmount;
  financingGap?: EuroAmount;
  ownFundsUsed?: EuroAmount;
  remainingBuffer?: EuroAmount;
  contractualMonthlyPayments?: HouseholdCashflow;
  netHouseholdCashflow?: EuroAmount;
  parentCashflow?: ParentCashflowSummary;
  debtsBySource?: DebtBySource;
  warnings: string[];
  assumptions: AssumptionMetadata[];
  stressTests?: StressTestResult[];
};
