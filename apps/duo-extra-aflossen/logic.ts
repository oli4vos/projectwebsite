import {
  getDefaultFinancialYear,
  getDuoDefaultTermForRule,
  getDuoRateForRule,
  getFinancialConstants,
} from "@/lib/financial-constants";
import {
  calculateDuoExtraRepaymentProjection,
  calculateStatutoryDuoMonthlyPayment,
  type DuoExtraRepaymentProjectionResult,
  type ExtraRepaymentStrategy,
  type RepaymentRule,
} from "@/lib/duo";
import { parseOptionalDecimalInput } from "@/lib/number-input";

export type DuoExtraRepaymentFormValues = {
  remainingDebt: string;
  repaymentRule: RepaymentRule;
  currentMonthlyPayment: string;
  oneTimeExtraRepayment: string;
  monthlyExtraRepayment: string;
  strategy: ExtraRepaymentStrategy;
};

export type DuoExtraRepaymentErrors = Partial<
  Record<keyof DuoExtraRepaymentFormValues, string>
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
    }
  | {
      isValid: true;
      errors: DuoExtraRepaymentErrors;
      year: number;
      annualInterestRate: number;
      termYears: number;
      statutoryMonthlyPayment: number;
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

export function createDuoExtraRepaymentDefaultValues(): DuoExtraRepaymentFormValues {
  return {
    remainingDebt: "25000",
    repaymentRule: "SF35",
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
  const remainingDebt = parseOptionalDecimalInput(values.remainingDebt);
  const currentMonthlyPayment = parseOptionalDecimalInput(values.currentMonthlyPayment);
  const oneTimeExtraRepayment = parseOptionalDecimalInput(values.oneTimeExtraRepayment);
  const monthlyExtraRepayment = parseOptionalDecimalInput(values.monthlyExtraRepayment);

  if (remainingDebt === undefined || !Number.isFinite(remainingDebt) || remainingDebt < 0) {
    errors.remainingDebt = "Gebruik 0 of een hogere openstaande studieschuld.";
  }

  if (!repaymentRuleOptions.includes(values.repaymentRule)) {
    errors.repaymentRule = "Kies een geldige terugbetalingsregel.";
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
  const result = calculateDuoExtraRepaymentProjection({
    remainingDebt,
    annualInterestRate,
    remainingTermYears: termYears,
    repaymentRule: values.repaymentRule,
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
    annualInterestRate,
    termYears,
    statutoryMonthlyPayment,
    normVersion: getNormVersion(year, context.normVersion),
    result,
    chart: buildChartData(result),
  };
}
