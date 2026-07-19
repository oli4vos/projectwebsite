import type { DuoMortgageTransferCandidate } from "@/lib/duo-mortgage-transfer";
import type { FormState } from "./form";

export type DuoMortgageCandidateTargetField =
  | "actualMonthlyPayment"
  | "statutoryMonthlyPayment";

export function showActualPaymentFieldFor(values: Pick<FormState, "situation">) {
  return (
    values.situation === "repaying" ||
    values.situation === "incomeBasedReduction" ||
    values.situation === "paymentPause"
  );
}

export function showStatutoryPaymentFieldFor(values: Pick<FormState, "situation">) {
  return (
    values.situation === "gracePeriod" ||
    values.situation === "incomeBasedReduction" ||
    values.situation === "paymentPause" ||
    values.situation === "unknown"
  );
}

export function getDuoMortgageCandidateTargetField(
  values: Pick<FormState, "situation">,
  candidate: DuoMortgageTransferCandidate,
): DuoMortgageCandidateTargetField {
  if (
    candidate.assessment.basis === "collectedPayment" &&
    showActualPaymentFieldFor(values)
  ) {
    return "actualMonthlyPayment";
  }

  if (showStatutoryPaymentFieldFor(values)) {
    return "statutoryMonthlyPayment";
  }

  return "actualMonthlyPayment";
}

export function applyDuoMortgageCandidateToForm(
  values: FormState,
  candidate: DuoMortgageTransferCandidate,
  formatMoneyInputValue: (value: number) => string,
): FormState {
  const targetField = getDuoMortgageCandidateTargetField(values, candidate);

  return {
    ...values,
    [targetField]: formatMoneyInputValue(
      candidate.recommendedMonthlyAssessmentPayment,
    ),
  };
}

export function isFormStateDraft(value: unknown): value is FormState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as Partial<Record<keyof FormState, unknown>>;
  return (
    typeof draft.situation === "string" &&
    typeof draft.repaymentRule === "string" &&
    typeof draft.actualMonthlyPayment === "string" &&
    typeof draft.statutoryMonthlyPayment === "string" &&
    typeof draft.grossIncomeUser === "string" &&
    typeof draft.mortgageRate === "string" &&
    typeof draft.mortgageTermYears === "string" &&
    typeof draft.showAdvancedAssumptions === "boolean" &&
    Array.isArray(draft.debtParts)
  );
}
