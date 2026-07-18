import { calculateDuoDebtPortfolio, calculateStatutoryDuoMonthlyPayment } from "@/lib/duo/calculations";
import type { DuoDebtPartInput, RepaymentRule } from "@/lib/duo/types";
import { getDuoDefaultTermForRule } from "@/lib/financial-constants";

export type DuoMortgageAssessmentSituation =
  | "collected-payment"
  | "statutory-payment"
  | "temporary-reduction"
  | "income-based-reduction"
  | "payment-pause"
  | "repayment-not-started"
  | "voluntary-extra-payment"
  | "voluntary-principal-repayment"
  | "debt-parts"
  | "unknown";

export type DuoMortgageAssessmentBasis =
  | "collectedPayment"
  | "statutoryPayment"
  | "estimatedStatutoryPayment"
  | "debtPartsStatutoryPayment"
  | "missingData";

export type DuoMortgageAssessmentUncertainty =
  | "low"
  | "medium"
  | "high"
  | "provider-dependent";

export type DuoMortgageAssessmentInput = {
  situation: DuoMortgageAssessmentSituation;
  repaymentRule?: RepaymentRule;
  collectedPayment?: number;
  statutoryPayment?: number;
  voluntaryExtraPayment?: number;
  voluntaryPrincipalRepayment?: number;
  remainingDebt?: number;
  annualInterestRate?: number;
  duoRateYear?: number;
  remainingTermYears?: number;
  debtParts?: DuoDebtPartInput[];
  confirmsPrincipalRepaymentProcessedByDuo?: boolean;
};

export type DuoMortgageAssessmentResult = {
  recommendedMonthlyAssessmentPayment: number;
  basis: DuoMortgageAssessmentBasis;
  situation: DuoMortgageAssessmentSituation;
  reasonCode:
    | "collected-equals-statutory"
    | "use-statutory-over-temporary-payment"
    | "use-estimated-statutory-payment"
    | "use-debt-parts-statutory-total"
    | "voluntary-extra-payment-ignored"
    | "processed-principal-repayment-required"
    | "missing-required-payment-data";
  usedDebtParts: boolean;
  warnings: string[];
  missingFields: string[];
  uncertainty: DuoMortgageAssessmentUncertainty;
  providerDependent: boolean;
  userConfirmationRequired: string[];
  assumptions: string[];
};

function sanitizeMoney(value: number | undefined) {
  return Number.isFinite(value ?? Number.NaN) ? Math.max(value as number, 0) : 0;
}

function roundMoney(value: number) {
  return Math.round(sanitizeMoney(value) * 100) / 100;
}

function estimateStatutoryPayment(input: DuoMortgageAssessmentInput) {
  const repaymentRule = input.repaymentRule ?? "UNKNOWN";
  const remainingTermYears =
    input.remainingTermYears ?? getDuoDefaultTermForRule(repaymentRule, input.duoRateYear);

  return calculateStatutoryDuoMonthlyPayment({
    repaymentRule,
    remainingDebt: sanitizeMoney(input.remainingDebt),
    annualInterestRate: input.annualInterestRate,
    duoRateYear: input.duoRateYear,
    remainingTermYears,
  });
}

function missingForEstimate(input: DuoMortgageAssessmentInput) {
  const missingFields: string[] = [];
  if (sanitizeMoney(input.remainingDebt) <= 0 && (input.debtParts ?? []).length === 0) {
    missingFields.push("remainingDebt");
  }
  if (!input.repaymentRule) {
    missingFields.push("repaymentRule");
  }
  return missingFields;
}

export function determineDuoMortgageAssessmentPayment(
  input: DuoMortgageAssessmentInput,
): DuoMortgageAssessmentResult {
  const collectedPayment = sanitizeMoney(input.collectedPayment);
  const statutoryPayment = sanitizeMoney(input.statutoryPayment);
  const debtParts = input.debtParts ?? [];
  const missingFields = missingForEstimate(input);
  const assumptions = [
    "mortgage-provider-may-request-statutory-payment",
    "student-debt-gross-up-is-project-assumption-in-mortgage-layer",
  ];

  if (debtParts.length > 0) {
    const portfolio = calculateDuoDebtPortfolio({
      repaymentRule: input.repaymentRule,
      remainingTermYears: input.remainingTermYears,
      duoRateYear: input.duoRateYear,
      debtParts,
    });

    return {
      recommendedMonthlyAssessmentPayment: portfolio.totalStatutoryMonthlyPayment,
      basis: "debtPartsStatutoryPayment",
      situation: "debt-parts",
      reasonCode: "use-debt-parts-statutory-total",
      usedDebtParts: true,
      warnings: portfolio.warnings,
      missingFields: [],
      uncertainty: "medium",
      providerDependent: true,
      userConfirmationRequired: ["confirm-debt-parts-match-mijn-duo"],
      assumptions,
    };
  }

  if (
    input.situation === "collected-payment" &&
    collectedPayment > 0 &&
    (statutoryPayment === 0 || Math.abs(collectedPayment - statutoryPayment) < 0.01)
  ) {
    return {
      recommendedMonthlyAssessmentPayment: roundMoney(collectedPayment),
      basis: "collectedPayment",
      situation: input.situation,
      reasonCode: "collected-equals-statutory",
      usedDebtParts: false,
      warnings: [],
      missingFields: [],
      uncertainty: "low",
      providerDependent: true,
      userConfirmationRequired: ["confirm-collected-payment-comes-from-mijn-duo"],
      assumptions,
    };
  }

  if (
    input.situation === "voluntary-extra-payment" &&
    statutoryPayment > 0
  ) {
    return {
      recommendedMonthlyAssessmentPayment: statutoryPayment,
      basis: "statutoryPayment",
      situation: input.situation,
      reasonCode: "voluntary-extra-payment-ignored",
      usedDebtParts: false,
      warnings: ["voluntary-extra-payment-is-not-structural-assessment-payment"],
      missingFields: [],
      uncertainty: "medium",
      providerDependent: true,
      userConfirmationRequired: ["confirm-statutory-payment-after-voluntary-payments"],
      assumptions,
    };
  }

  if (
    input.situation === "voluntary-principal-repayment" &&
    !input.confirmsPrincipalRepaymentProcessedByDuo
  ) {
    return {
      recommendedMonthlyAssessmentPayment: statutoryPayment,
      basis: statutoryPayment > 0 ? "statutoryPayment" : "missingData",
      situation: input.situation,
      reasonCode: "processed-principal-repayment-required",
      usedDebtParts: false,
      warnings: ["principal-repayment-must-be-processed-by-duo-before-assessment"],
      missingFields: statutoryPayment > 0 ? [] : ["statutoryPayment"],
      uncertainty: "high",
      providerDependent: true,
      userConfirmationRequired: ["confirm-duo-has-recalculated-debt-or-statutory-payment"],
      assumptions,
    };
  }

  if (
    statutoryPayment > 0 &&
    (input.situation === "statutory-payment" ||
      input.situation === "temporary-reduction" ||
      input.situation === "income-based-reduction" ||
      input.situation === "payment-pause" ||
      input.situation === "repayment-not-started" ||
      input.situation === "voluntary-principal-repayment")
  ) {
    return {
      recommendedMonthlyAssessmentPayment: statutoryPayment,
      basis: "statutoryPayment",
      situation: input.situation,
      reasonCode:
        input.situation === "statutory-payment"
          ? "collected-equals-statutory"
          : "use-statutory-over-temporary-payment",
      usedDebtParts: false,
      warnings:
        input.situation === "statutory-payment"
          ? []
          : ["temporary-or-zero-payment-may-not-be-accepted-as-assessment-payment"],
      missingFields: [],
      uncertainty: input.situation === "statutory-payment" ? "low" : "provider-dependent",
      providerDependent: true,
      userConfirmationRequired: ["confirm-statutory-payment-in-mijn-duo"],
      assumptions,
    };
  }

  const estimated = estimateStatutoryPayment(input);
  if (estimated > 0 && missingFields.length === 0) {
    return {
      recommendedMonthlyAssessmentPayment: estimated,
      basis: "estimatedStatutoryPayment",
      situation: input.situation,
      reasonCode: "use-estimated-statutory-payment",
      usedDebtParts: false,
      warnings: ["estimated-statutory-payment-check-mijn-duo"],
      missingFields: [],
      uncertainty: "high",
      providerDependent: true,
      userConfirmationRequired: ["confirm-estimated-payment-with-mijn-duo"],
      assumptions,
    };
  }

  return {
    recommendedMonthlyAssessmentPayment: 0,
    basis: "missingData",
    situation: input.situation,
    reasonCode: "missing-required-payment-data",
    usedDebtParts: false,
    warnings: ["missing-duo-assessment-payment-data"],
    missingFields: missingFields.length > 0 ? missingFields : ["statutoryPayment"],
    uncertainty: "high",
    providerDependent: true,
    userConfirmationRequired: ["enter-statutory-payment-or-debt-details"],
    assumptions,
  };
}
