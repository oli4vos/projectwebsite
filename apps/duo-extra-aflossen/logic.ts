import {
  getAvailableDuoRateYears,
  getDefaultFinancialYear,
  getDuoDefaultTermForRule,
  getFinancialConstants,
} from "@/lib/financial-constants";
import {
  calculateDuoDebtPortfolio,
  calculateDuoExtraRepaymentProjection,
  type DuoDebtPortfolioSummary,
  type DuoExtraRepaymentProjectionResult,
  type ExtraRepaymentStrategy,
  type RepaymentRule,
} from "@/lib/duo";
import {
  createDefaultDuoDebtPartFormValues,
  type DuoDebtPartFieldErrors,
  type DuoDebtPartFormValue,
  validateDuoDebtPartFormValues,
} from "@/lib/duo/debt-parts-form";
import { parseOptionalDecimalInput } from "@/lib/number-input";

export type DuoExtraRepaymentFormValues = {
  remainingDebt: string;
  repaymentRule: RepaymentRule;
  duoRateYear: string;
  useDebtParts: boolean;
  debtParts: DuoDebtPartFormValue[];
  currentMonthlyPayment: string;
  oneTimeExtraRepayment: string;
  monthlyExtraRepayment: string;
  strategy: ExtraRepaymentStrategy;
};

export type DuoExtraRepaymentErrors = Partial<
  Record<keyof DuoExtraRepaymentFormValues | "debtParts", string>
>;

export type DuoExtraRepaymentChartData = {
  labels: string[];
  before: number[];
  after: number[];
};

export type DuoExtraRepaymentView =
  | {
      isValid: false;
      errors: DuoExtraRepaymentErrors;
      year: number;
      debtPartErrors: Record<string, DuoDebtPartFieldErrors>;
      debtPartsTotal: number;
    }
  | {
      isValid: true;
      errors: DuoExtraRepaymentErrors;
      year: number;
      duoRateYear: number;
      annualInterestRate: number;
      termYears: number;
      statutoryMonthlyPayment: number;
      debtPortfolio: DuoDebtPortfolioSummary;
      debtPartErrors: Record<string, DuoDebtPartFieldErrors>;
      debtPartsTotal: number;
      normVersion: string;
      result: DuoExtraRepaymentProjectionResult;
      chart: DuoExtraRepaymentChartData;
    };

export type DuoExtraRepaymentCalculationContext = {
  year?: number;
  annualInterestRate?: number;
  remainingTermYears?: number;
  normVersion?: string;
  startDate?: string;
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

export function createDuoExtraRepaymentDefaultValues(): DuoExtraRepaymentFormValues {
  return {
    remainingDebt: "25000",
    repaymentRule: "SF35",
    duoRateYear: String(getDefaultRateYear()),
    useDebtParts: false,
    debtParts: createDefaultDuoDebtPartFormValues(),
    currentMonthlyPayment: "",
    oneTimeExtraRepayment: "1000",
    monthlyExtraRepayment: "50",
    strategy: "shortenTerm",
  };
}

export function createEmptyDuoExtraRepaymentValues(): DuoExtraRepaymentFormValues {
  return {
    remainingDebt: "",
    repaymentRule: "SF35",
    duoRateYear: String(getDefaultRateYear()),
    useDebtParts: false,
    debtParts: createDefaultDuoDebtPartFormValues(),
    currentMonthlyPayment: "",
    oneTimeExtraRepayment: "",
    monthlyExtraRepayment: "",
    strategy: "shortenTerm",
  };
}

function getNormVersion(year: number, override?: string) {
  if (override) {
    return override;
  }

  const constants = getFinancialConstants(year);
  return `${constants.year} (${constants.duo.meta.lastChecked})`;
}

export function validateDuoExtraRepaymentForm(
  values: DuoExtraRepaymentFormValues,
): DuoExtraRepaymentErrors {
  const errors: DuoExtraRepaymentErrors = {};
  const supportedRateYears = new Set(getAvailableDuoRateYears());
  const remainingDebt = parseOptionalDecimalInput(values.remainingDebt);
  const currentMonthlyPayment = parseOptionalDecimalInput(values.currentMonthlyPayment);
  const oneTimeExtraRepayment = parseOptionalDecimalInput(values.oneTimeExtraRepayment);
  const monthlyExtraRepayment = parseOptionalDecimalInput(values.monthlyExtraRepayment);
  const duoRateYear = Number.parseInt(values.duoRateYear, 10);
  const debtPartsValidation = validateDuoDebtPartFormValues(values.debtParts);
  const totalDebt = values.useDebtParts
    ? debtPartsValidation.totalDebt
    : (parseOptionalDecimalInput(values.remainingDebt) ?? 0);

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
    values.currentMonthlyPayment.trim().length > 0 &&
    (currentMonthlyPayment === undefined ||
      !Number.isFinite(currentMonthlyPayment) ||
      currentMonthlyPayment < 0)
  ) {
    errors.currentMonthlyPayment = "Gebruik 0 of een hoger huidig maandbedrag.";
  }

  if (
    values.oneTimeExtraRepayment.trim().length > 0 &&
    (oneTimeExtraRepayment === undefined ||
      !Number.isFinite(oneTimeExtraRepayment) ||
      oneTimeExtraRepayment < 0)
  ) {
    errors.oneTimeExtraRepayment = "Gebruik 0 of een hoger eenmalig extra bedrag.";
  }

  if (
    values.monthlyExtraRepayment.trim().length > 0 &&
    (monthlyExtraRepayment === undefined ||
      !Number.isFinite(monthlyExtraRepayment) ||
      monthlyExtraRepayment < 0)
  ) {
    errors.monthlyExtraRepayment = "Gebruik 0 of een hoger extra maandbedrag.";
  }

  if (
    oneTimeExtraRepayment !== undefined &&
    totalDebt > 0 &&
    oneTimeExtraRepayment > totalDebt
  ) {
    errors.oneTimeExtraRepayment =
      "Extra aflossen kan in deze tool niet hoger zijn dan je openstaande schuld.";
  }

  return errors;
}

function pickYearlyClosingDebt(points: { date: string; closingDebt: number }[]) {
  const byYear = new Map<string, number>();

  for (const point of points) {
    const year = point.date.slice(0, 4);
    byYear.set(year, point.closingDebt);
  }

  return byYear;
}

function buildChartData(result: DuoExtraRepaymentProjectionResult): DuoExtraRepaymentChartData {
  const before = pickYearlyClosingDebt(result.timelineBefore.points);
  const after = pickYearlyClosingDebt(result.timelineAfter.points);
  const labels = Array.from(new Set([...before.keys(), ...after.keys()])).sort();

  return {
    labels,
    before: labels.map((label) => before.get(label) ?? 0),
    after: labels.map((label) => after.get(label) ?? 0),
  };
}

export function calculateDuoExtraRepaymentView(
  values: DuoExtraRepaymentFormValues,
  context: DuoExtraRepaymentCalculationContext = {},
): DuoExtraRepaymentView {
  const errors = validateDuoExtraRepaymentForm(values);
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
  const annualInterestRate = debtPortfolio.blendedAnnualInterestRate;
  const statutoryMonthlyPayment = debtPortfolio.totalStatutoryMonthlyPayment;
  const result = calculateDuoExtraRepaymentProjection({
    remainingDebt: debtPortfolio.totalDebt,
    repaymentRule: values.repaymentRule,
    annualInterestRate: context.annualInterestRate,
    duoRateYear,
    remainingTermYears: termYears,
    debtParts: values.useDebtParts ? debtPartsValidation.sanitizedParts : undefined,
    monthlyPayment: parseOptionalDecimalInput(values.currentMonthlyPayment),
    extraRepaymentAmount: parseOptionalDecimalInput(values.oneTimeExtraRepayment),
    extraMonthlyAmount: parseOptionalDecimalInput(values.monthlyExtraRepayment),
    strategy: values.strategy,
    startDate: context.startDate,
  });

  return {
    isValid: true,
    errors,
    year,
    duoRateYear,
    annualInterestRate,
    termYears,
    statutoryMonthlyPayment,
    debtPortfolio,
    debtPartErrors: debtPartsValidation.errorsById,
    debtPartsTotal: debtPartsValidation.totalDebt,
    normVersion: getNormVersion(year, context.normVersion),
    result,
    chart: buildChartData(result),
  };
}
