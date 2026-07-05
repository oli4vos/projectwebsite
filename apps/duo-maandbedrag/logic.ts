import {
  getDefaultFinancialYear,
  getDuoDefaultTermForRule,
  getDuoRateForRule,
  getFinancialConstants,
} from "@/lib/financial-constants";
import {
  calculateIndicativeIncomeBasedMonthlyPayment,
  calculateStatutoryDuoMonthlyPayment,
  type DuoIncomeBasedMonthlyPaymentResult,
  type RepaymentRule,
} from "@/lib/duo";
import { parseOptionalDecimalInput } from "@/lib/number-input";

export type DuoHouseholdSituation = "single" | "partner";

export type DuoMonthlyPaymentFormValues = {
  remainingDebt: string;
  repaymentRule: RepaymentRule;
  assessmentIncome: string;
  householdSituation: DuoHouseholdSituation;
};

export type DuoMonthlyPaymentErrors = Partial<
  Record<keyof DuoMonthlyPaymentFormValues, string>
>;

export type DuoMonthlyPaymentView =
  | {
      isValid: false;
      errors: DuoMonthlyPaymentErrors;
      year: number;
    }
  | {
      isValid: true;
      errors: DuoMonthlyPaymentErrors;
      year: number;
      remainingDebt: number;
      repaymentRule: RepaymentRule;
      annualInterestRate: number;
      termYears: number;
      statutoryMonthlyPayment: number;
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

export function createDuoMonthlyPaymentDefaultValues(): DuoMonthlyPaymentFormValues {
  return {
    remainingDebt: "25000",
    repaymentRule: "SF35",
    assessmentIncome: "",
    householdSituation: "single",
  };
}

export function createEmptyDuoMonthlyPaymentValues(): DuoMonthlyPaymentFormValues {
  return {
    remainingDebt: "",
    repaymentRule: "SF35",
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
  const remainingDebt = parseOptionalDecimalInput(values.remainingDebt);
  const assessmentIncome = parseOptionalDecimalInput(values.assessmentIncome);

  if (remainingDebt === undefined || !Number.isFinite(remainingDebt) || remainingDebt < 0) {
    errors.remainingDebt = "Gebruik 0 of een hogere openstaande studieschuld.";
  }

  if (!repaymentRuleOptions.includes(values.repaymentRule)) {
    errors.repaymentRule = "Kies een geldige terugbetalingsregel.";
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

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors, year };
  }

  const remainingDebt = parseOptionalDecimalInput(values.remainingDebt) ?? 0;
  const annualInterestRate =
    context.annualInterestRate ?? getDuoRateForRule(values.repaymentRule, year);
  const termYears =
    context.remainingTermYears ?? getDuoDefaultTermForRule(values.repaymentRule, year);
  const statutoryMonthlyPayment = calculateStatutoryDuoMonthlyPayment({
    remainingDebt,
    annualInterestRate,
    remainingTermYears: termYears,
    repaymentRule: values.repaymentRule,
  });
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
    annualInterestRate,
    termYears,
    statutoryMonthlyPayment,
    incomeBased,
    duoMonthlyPaymentUsed,
    duoMonthlyPaymentSource,
    normVersion: getNormVersion(year, context.normVersion),
    warnings: [
      "DUO stelt je draagkracht jaarlijks vast op basis van je inkomen van twee jaar terug. Deze indicatie vervangt die vaststelling niet.",
      "Bij bijzondere situaties, peiljaarverlegging of buitenlandse inkomens kan DUO anders uitkomen.",
      ...(incomeBased?.warnings ?? []),
    ],
  };
}
