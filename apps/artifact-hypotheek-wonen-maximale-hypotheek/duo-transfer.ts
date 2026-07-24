import type { DuoMortgageTransferCandidate } from "@/lib/duo-mortgage-transfer";
import type { MortgageFormState } from "./logic";

export function formatMortgageDuoPaymentInput(value: number) {
  return value.toFixed(2).replace(".", ",");
}

export function applyDuoMortgageCandidateToMaxMortgageForm(
  values: MortgageFormState,
  candidate: DuoMortgageTransferCandidate,
): MortgageFormState {
  return {
    ...values,
    hasStudentLoan: true,
    studentLoanStatus: "unknown",
    statutoryMonthlyPayment: formatMortgageDuoPaymentInput(
      candidate.recommendedMonthlyAssessmentPayment,
    ),
  };
}

export function isMaxMortgageFormStateDraft(value: unknown): value is MortgageFormState {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<Record<keyof MortgageFormState, unknown>>;

  return (
    typeof draft.grossAnnualHouseholdIncome === "string" &&
    typeof draft.grossAnnualPartnerIncome === "string" &&
    typeof draft.annualMortgageRate === "string" &&
    typeof draft.fixedRatePeriodMonths === "string" &&
    typeof draft.mortgageTermYears === "string" &&
    typeof draft.purchasePrice === "string" &&
    typeof draft.marketValue === "string" &&
    typeof draft.ownFunds === "string" &&
    typeof draft.monthlyDebtPayments === "string" &&
    typeof draft.hasStudentLoan === "boolean" &&
    typeof draft.studentLoanStatus === "string" &&
    typeof draft.actualMonthlyPayment === "string" &&
    typeof draft.statutoryMonthlyPayment === "string" &&
    typeof draft.nhgRequested === "boolean" &&
    typeof draft.energyLabel === "string" &&
    typeof draft.energySavingMeasuresAmount === "string" &&
    typeof draft.renovationAmount === "string" &&
    typeof draft.afmStressAnnualRate === "string"
  );
}
