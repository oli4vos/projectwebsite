import {
  getAvailableDuoRateYears,
  getDefaultFinancialYear,
  getDuoDefaultTermForRule,
  getFinancialConstants,
} from "@/lib/financial-constants";
import {
  calculateDuoDebtPortfolio,
  calculateIndicativeIncomeBasedMonthlyPayment,
  determineDuoMortgageAssessmentPayment,
  type DuoDebtPortfolioSummary,
  type DuoIncomeBasedMonthlyPaymentResult,
  type DuoMortgageAssessmentInput,
  type RepaymentRule,
} from "@/lib/duo";
import type { DuoMortgageTransferCandidate } from "@/lib/duo-mortgage-transfer";
import {
  createDefaultDuoDebtPartFormValues,
  type DuoDebtPartFieldErrors,
  type DuoDebtPartFormValue,
  validateDuoDebtPartFormValues,
} from "@/lib/duo/debt-parts-form";
import { parseOptionalDecimalInput } from "@/lib/number-input";

export type DuoHouseholdSituation = "single" | "partner";

export type DuoMonthlyPaymentFormValues = {
  remainingDebt: string;
  repaymentRule: RepaymentRule;
  duoRateYear: string;
  useDebtParts: boolean;
  debtParts: DuoDebtPartFormValue[];
  assessmentIncome: string;
  householdSituation: DuoHouseholdSituation;
};

export type DuoMonthlyPaymentErrors = Partial<
  Record<keyof DuoMonthlyPaymentFormValues | "debtParts", string>
>;

export type DuoMonthlyPaymentView =
  | {
      isValid: false;
      errors: DuoMonthlyPaymentErrors;
      year: number;
      debtPartErrors: Record<string, DuoDebtPartFieldErrors>;
      debtPartsTotal: number;
    }
  | {
      isValid: true;
      errors: DuoMonthlyPaymentErrors;
      year: number;
      remainingDebt: number;
      repaymentRule: RepaymentRule;
      duoRateYear: number;
      annualInterestRate: number;
      termYears: number;
      statutoryMonthlyPayment: number;
      debtPortfolio: DuoDebtPortfolioSummary;
      debtPartErrors: Record<string, DuoDebtPartFieldErrors>;
      debtPartsTotal: number;
      incomeBased?: DuoIncomeBasedMonthlyPaymentResult;
      duoMonthlyPaymentUsed?: number;
      duoMonthlyPaymentSource: "statutory" | "incomeBased";
      normVersion: string;
      warnings: string[];
    };

export type DuoMonthlyPaymentCalculationContext = {
  year?: number;
  annualInterestRate?: number;
  remainingTermYears?: number;
  normVersion?: string;
};

export const repaymentRuleOptions: RepaymentRule[] = [
  "SF35",
  "SF15",
  "SF15_OLD",
  "SF15_LLLK",
  "UNKNOWN",
];

function getDefaultRateYear() {
  return getAvailableDuoRateYears(1)[0] ?? getDefaultFinancialYear();
}

export function createDuoMonthlyPaymentDefaultValues(): DuoMonthlyPaymentFormValues {
  return {
    remainingDebt: "25000",
    repaymentRule: "SF35",
    duoRateYear: String(getDefaultRateYear()),
    useDebtParts: false,
    debtParts: createDefaultDuoDebtPartFormValues(),
    assessmentIncome: "",
    householdSituation: "single",
  };
}

export function createEmptyDuoMonthlyPaymentValues(): DuoMonthlyPaymentFormValues {
  return {
    remainingDebt: "",
    repaymentRule: "SF35",
    duoRateYear: String(getDefaultRateYear()),
    useDebtParts: false,
    debtParts: createDefaultDuoDebtPartFormValues(),
    assessmentIncome: "",
    householdSituation: "single",
  };
}

function getNormVersion(year: number, override?: string) {
  if (override) {
    return override;
  }

  const constants = getFinancialConstants(year);
  return `${constants.year} (${constants.duo.meta.lastChecked})`;
}

function hasAssessmentIncome(values: DuoMonthlyPaymentFormValues) {
  return values.assessmentIncome.trim().length > 0;
}

export function validateDuoMonthlyPaymentForm(
  values: DuoMonthlyPaymentFormValues,
): DuoMonthlyPaymentErrors {
  const errors: DuoMonthlyPaymentErrors = {};
  const supportedRateYears = new Set(getAvailableDuoRateYears());
  const remainingDebt = parseOptionalDecimalInput(values.remainingDebt);
  const assessmentIncome = parseOptionalDecimalInput(values.assessmentIncome);
  const duoRateYear = Number.parseInt(values.duoRateYear, 10);
  const debtPartsValidation = validateDuoDebtPartFormValues(values.debtParts);

  if (
    !values.useDebtParts &&
    (remainingDebt === undefined || !Number.isFinite(remainingDebt) || remainingDebt < 0)
  ) {
    errors.remainingDebt = "Gebruik 0 of een hogere openstaande studieschuld.";
  }

  if (!repaymentRuleOptions.includes(values.repaymentRule)) {
    errors.repaymentRule = "Kies een geldige terugbetalingsregel.";
  }

  if (!values.useDebtParts) {
    if (!Number.isInteger(duoRateYear) || !supportedRateYears.has(duoRateYear)) {
      errors.duoRateYear = "Kies een DUO-rentejaar uit de laatste 5 jaar.";
    }
  } else if (debtPartsValidation.sanitizedParts.length === 0) {
    errors.debtParts = "Voeg minimaal één leningdeel toe met bedrag en rentejaar.";
  }

  if (
    hasAssessmentIncome(values) &&
    (assessmentIncome === undefined ||
      !Number.isFinite(assessmentIncome) ||
      assessmentIncome < 0)
  ) {
    errors.assessmentIncome = "Gebruik 0 of een hoger toetsingsinkomen.";
  }

  return errors;
}

export function calculateDuoMonthlyPaymentView(
  values: DuoMonthlyPaymentFormValues,
  context: DuoMonthlyPaymentCalculationContext = {},
): DuoMonthlyPaymentView {
  const errors = validateDuoMonthlyPaymentForm(values);
  const year = context.year ?? getDefaultFinancialYear();
  const debtPartsValidation = validateDuoDebtPartFormValues(values.debtParts);

  if (Object.keys(errors).length > 0) {
    return {
      isValid: false,
      errors,
      year,
      debtPartErrors: debtPartsValidation.errorsById,
      debtPartsTotal: debtPartsValidation.totalDebt,
    };
  }

  const duoRateYear = Number.parseInt(values.duoRateYear, 10) || year;
  const termYears =
    context.remainingTermYears ?? getDuoDefaultTermForRule(values.repaymentRule, year);
  const debtPortfolio = calculateDuoDebtPortfolio({
    repaymentRule: values.repaymentRule,
    remainingDebt: parseOptionalDecimalInput(values.remainingDebt) ?? 0,
    annualInterestRate: context.annualInterestRate,
    duoRateYear,
    remainingTermYears: termYears,
    debtParts: values.useDebtParts ? debtPartsValidation.sanitizedParts : undefined,
  });
  const remainingDebt = debtPortfolio.totalDebt;
  const annualInterestRate = debtPortfolio.blendedAnnualInterestRate;
  const statutoryMonthlyPayment = debtPortfolio.totalStatutoryMonthlyPayment;
  const incomeBased =
    hasAssessmentIncome(values)
      ? calculateIndicativeIncomeBasedMonthlyPayment({
          grossAnnualIncome: parseOptionalDecimalInput(values.assessmentIncome) ?? 0,
          hasPartner: values.householdSituation === "partner",
          repaymentRule: values.repaymentRule,
          statutoryMonthlyPayment,
        })
      : undefined;
  const duoMonthlyPaymentUsed = incomeBased?.requiredMonthlyPayment;
  const duoMonthlyPaymentSource =
    incomeBased && incomeBased.requiredMonthlyPayment < statutoryMonthlyPayment
      ? "incomeBased"
      : "statutory";

  return {
    isValid: true,
    errors,
    year,
    remainingDebt,
    repaymentRule: values.repaymentRule,
    duoRateYear,
    annualInterestRate,
    termYears,
    statutoryMonthlyPayment,
    debtPortfolio,
    debtPartErrors: debtPartsValidation.errorsById,
    debtPartsTotal: debtPartsValidation.totalDebt,
    incomeBased,
    duoMonthlyPaymentUsed,
    duoMonthlyPaymentSource,
    normVersion: getNormVersion(year, context.normVersion),
    warnings: [
      ...debtPortfolio.warnings,
      "DUO stelt je draagkracht jaarlijks vast op basis van je inkomen van twee jaar terug. Deze indicatie vervangt die vaststelling niet.",
      "Bij bijzondere situaties, peiljaarverlegging of buitenlandse inkomens kan DUO anders uitpakken.",
      ...(incomeBased?.warnings ?? []),
    ],
  };
}

export function createDuoMortgageAssessmentTransferCandidate(
  view: DuoMonthlyPaymentView,
  now = new Date(),
): DuoMortgageTransferCandidate | null {
  if (!view.isValid) {
    return null;
  }

  const assessmentInput = createMortgageAssessmentInput(view);
  const assessment = determineDuoMortgageAssessmentPayment(assessmentInput);

  return {
    assessment,
    sourceSituation: assessmentInput.situation,
    recommendedMonthlyAssessmentPayment:
      assessment.recommendedMonthlyAssessmentPayment,
    createdAt: now.toISOString(),
  };
}

function createMortgageAssessmentInput(
  view: Extract<DuoMonthlyPaymentView, { isValid: true }>,
): DuoMortgageAssessmentInput {
  if (view.debtPortfolio.usesDebtParts) {
    return {
      situation: "debt-parts",
      repaymentRule: view.repaymentRule,
      duoRateYear: view.duoRateYear,
      remainingTermYears: view.termYears,
      debtParts: view.debtPortfolio.parts.map((part) => ({
        label: part.label,
        remainingDebt: part.remainingDebt,
        annualInterestRate: part.annualInterestRate,
        rateYear: part.rateYear,
      })),
    };
  }

  if (view.duoMonthlyPaymentSource === "incomeBased" && view.incomeBased) {
    return {
      situation: "income-based-reduction",
      repaymentRule: view.repaymentRule,
      collectedPayment: view.incomeBased.requiredMonthlyPayment,
      statutoryPayment: view.statutoryMonthlyPayment,
      remainingDebt: view.remainingDebt,
      annualInterestRate: view.annualInterestRate,
      duoRateYear: view.duoRateYear,
      remainingTermYears: view.termYears,
    };
  }

  return {
    situation: "statutory-payment",
    repaymentRule: view.repaymentRule,
    collectedPayment: view.statutoryMonthlyPayment,
    statutoryPayment: view.statutoryMonthlyPayment,
    remainingDebt: view.remainingDebt,
    annualInterestRate: view.annualInterestRate,
    duoRateYear: view.duoRateYear,
    remainingTermYears: view.termYears,
  };
}
