export {
  calculateDuoMonthlyPaymentAfterExtraRepayment,
  calculateExtraRepaymentVsInvesting,
  calculateRemainingDebtAfterExtraRepayment,
  calculateStatutoryDuoMonthlyPayment,
  determineRelevantDuoPayment,
  sanitizeDuoMoney,
  sanitizeDuoPercent,
} from "@/lib/duo/calculations";
export type {
  DuoIncomeBasedInput,
  DuoMonthlyPaymentAfterExtraRepaymentInput,
  DuoPaymentSource,
  DuoRelevantPaymentInput,
  DuoRepaymentInput,
  DuoSituation,
  ExtraRepaymentVsInvestingInput,
  RelevantDuoPaymentResult,
  RepaymentRule,
} from "@/lib/duo/types";
