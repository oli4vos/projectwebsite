import { getDuoBorrowingLimits } from "@/lib/financial-constants";
import {
  projectDuoLoan,
  type DuoLoanProjectionInput,
  type DuoLoanProjectionResult,
} from "@/lib/duo";
import { parseOptionalDecimalInput } from "@/lib/number-input";

export type DuoLoanProjectionFormValues = {
  currentDebt: string;
  monthlyLoanAmount: string;
  expectedLastLoanMonth: string;
  includeMortgageImpact: boolean;
};

export type DuoLoanProjectionValidationErrors = Partial<
  Record<keyof DuoLoanProjectionFormValues, string>
>;

export type DuoLoanProjectionScenarioKey =
  | "stop-now"
  | "keep-borrowing"
  | "difference";

export type DuoLoanProjectionComparisonRow = {
  key: DuoLoanProjectionScenarioKey;
  label: string;
  debtAtRepaymentStart: number;
  theoreticalMonthlyPayment: number;
  totalRepayment: number;
  mortgageCapacityReduction?: number;
  note: string;
};

export type DuoLoanProjectionComparison = {
  debtAtRepaymentStartDifference: number;
  theoreticalMonthlyPaymentDifference: number;
  totalRepaymentDifference: number;
  mortgageCapacityReductionDifference?: number;
  tableRows: DuoLoanProjectionComparisonRow[];
};

export type DuoLoanProjectionView =
  | {
      isValid: false;
      calculationMonth: string;
      errors: DuoLoanProjectionValidationErrors;
      slider: DuoLoanProjectionSliderConfig;
    }
  | {
      isValid: true;
      calculationMonth: string;
      errors: DuoLoanProjectionValidationErrors;
      input: DuoLoanProjectionInput;
      stopNow: DuoLoanProjectionResult;
      keepBorrowing: DuoLoanProjectionResult;
      comparison: DuoLoanProjectionComparison;
      slider: DuoLoanProjectionSliderConfig;
      showMortgageImpact: boolean;
    };

export type DuoLoanProjectionSliderConfig = {
  min: number;
  max: number;
  step: number;
  sourceUrl: string;
  notes: string;
};

type YearMonth = {
  year: number;
  month: number;
};

function roundMoney(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(value * 100) / 100;
}

function createCurrentYearMonth(): YearMonth {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function addMonths(value: YearMonth, months: number): YearMonth {
  const zeroBasedMonth = value.month - 1 + months;
  const date = new Date(value.year, zeroBasedMonth, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

function parseYearMonth(value: string): YearMonth | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }

  return { year, month };
}

function compareYearMonth(left: YearMonth, right: YearMonth) {
  return (left.year - right.year) * 12 + (left.month - right.month);
}

export function formatYearMonth(value: YearMonth) {
  return `${value.year}-${String(value.month).padStart(2, "0")}`;
}

export function getCurrentYearMonth() {
  return formatYearMonth(createCurrentYearMonth());
}

export function getDuoLoanProjectionSliderConfig(): DuoLoanProjectionSliderConfig {
  const limits = getDuoBorrowingLimits();

  return {
    min: 0,
    max: limits.monthlyLoanAmountMax,
    step: limits.monthlyLoanAmountStep,
    sourceUrl: limits.sourceUrl,
    notes: limits.notes,
  };
}

export function createDuoLoanProjectionDefaultValues(
  calculationMonth = getCurrentYearMonth(),
): DuoLoanProjectionFormValues {
  const parsedCalculationMonth = parseYearMonth(calculationMonth) ?? createCurrentYearMonth();

  return {
    currentDebt: "25000",
    monthlyLoanAmount: "300",
    expectedLastLoanMonth: formatYearMonth(addMonths(parsedCalculationMonth, 11)),
    includeMortgageImpact: false,
  };
}

export function createEmptyDuoLoanProjectionValues(): DuoLoanProjectionFormValues {
  return {
    currentDebt: "",
    monthlyLoanAmount: "",
    expectedLastLoanMonth: "",
    includeMortgageImpact: false,
  };
}

export function createDuoLoanProjectionExampleValues(
  calculationMonth = getCurrentYearMonth(),
): DuoLoanProjectionFormValues {
  return createDuoLoanProjectionDefaultValues(calculationMonth);
}

export function updateDuoLoanProjectionMonthlyLoanAmount(
  values: DuoLoanProjectionFormValues,
  nextMonthlyLoanAmount: string,
): DuoLoanProjectionFormValues {
  return {
    ...values,
    monthlyLoanAmount: nextMonthlyLoanAmount,
  };
}

export function validateDuoLoanProjectionForm(
  values: DuoLoanProjectionFormValues,
  calculationMonth = getCurrentYearMonth(),
): DuoLoanProjectionValidationErrors {
  const errors: DuoLoanProjectionValidationErrors = {};
  const currentDebt = parseOptionalDecimalInput(values.currentDebt);
  const monthlyLoanAmount = parseOptionalDecimalInput(values.monthlyLoanAmount);
  const lastLoanMonth = parseYearMonth(values.expectedLastLoanMonth);
  const parsedCalculationMonth = parseYearMonth(calculationMonth) ?? createCurrentYearMonth();
  const slider = getDuoLoanProjectionSliderConfig();

  if (currentDebt === undefined || !Number.isFinite(currentDebt) || currentDebt < 0) {
    errors.currentDebt = "Gebruik 0 of een hogere huidige studieschuld.";
  }

  if (
    monthlyLoanAmount === undefined ||
    !Number.isFinite(monthlyLoanAmount) ||
    monthlyLoanAmount < 0 ||
    monthlyLoanAmount > slider.max
  ) {
    errors.monthlyLoanAmount = `Gebruik een maandbedrag tussen 0 en ${slider.max.toLocaleString(
      "nl-NL",
      { style: "currency", currency: "EUR" },
    )}.`;
  }

  if (!lastLoanMonth) {
    errors.expectedLastLoanMonth = "Gebruik een geldige laatste leenmaand.";
  } else if (compareYearMonth(lastLoanMonth, parsedCalculationMonth) < 0) {
    errors.expectedLastLoanMonth =
      "De laatste leenmaand mag niet vóór de rekenmaand liggen.";
  }

  return errors;
}

export function mapDuoLoanProjectionFormToInput(
  values: DuoLoanProjectionFormValues,
  calculationMonth = getCurrentYearMonth(),
): {
  input?: DuoLoanProjectionInput;
  errors: DuoLoanProjectionValidationErrors;
} {
  const errors = validateDuoLoanProjectionForm(values, calculationMonth);

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  return {
    errors,
    input: {
      currentDebt: parseOptionalDecimalInput(values.currentDebt) ?? 0,
      monthlyLoanAmount: parseOptionalDecimalInput(values.monthlyLoanAmount) ?? 0,
      expectedLastLoanMonth: values.expectedLastLoanMonth,
      includeMortgageImpact: values.includeMortgageImpact,
    },
  };
}

function createStopNowInput(
  input: DuoLoanProjectionInput,
  calculationMonth: string,
): DuoLoanProjectionInput {
  return {
    ...input,
    monthlyLoanAmount: 0,
    expectedLastLoanMonth: calculationMonth,
    includeMortgageImpact: false,
  };
}

function createComparison(input: {
  stopNow: DuoLoanProjectionResult;
  keepBorrowing: DuoLoanProjectionResult;
  showMortgageImpact: boolean;
}): DuoLoanProjectionComparison {
  const mortgageImpact = input.keepBorrowing.mortgageImpact;
  const stopMortgageReduction = input.showMortgageImpact
    ? mortgageImpact?.reductionStopNow
    : undefined;
  const keepMortgageReduction = input.showMortgageImpact
    ? mortgageImpact?.reductionKeepBorrowing
    : undefined;
  const mortgageCapacityReductionDifference = input.showMortgageImpact
    ? mortgageImpact?.difference
    : undefined;
  const debtAtRepaymentStartDifference = roundMoney(
    input.keepBorrowing.debtAtRepaymentStart - input.stopNow.debtAtRepaymentStart,
  );
  const theoreticalMonthlyPaymentDifference = roundMoney(
    input.keepBorrowing.theoreticalMonthlyPayment -
      input.stopNow.theoreticalMonthlyPayment,
  );
  const totalRepaymentDifference = roundMoney(
    input.keepBorrowing.totalRepayment - input.stopNow.totalRepayment,
  );

  return {
    debtAtRepaymentStartDifference,
    theoreticalMonthlyPaymentDifference,
    totalRepaymentDifference,
    mortgageCapacityReductionDifference,
    tableRows: [
      {
        key: "stop-now",
        label: "Nu stoppen met lenen",
        debtAtRepaymentStart: input.stopNow.debtAtRepaymentStart,
        theoreticalMonthlyPayment: input.stopNow.theoreticalMonthlyPayment,
        totalRepayment: input.stopNow.totalRepayment,
        mortgageCapacityReduction: stopMortgageReduction,
        note: "Geen extra opname vanaf de rekenmaand.",
      },
      {
        key: "keep-borrowing",
        label: "Doorlenen tot gekozen maand",
        debtAtRepaymentStart: input.keepBorrowing.debtAtRepaymentStart,
        theoreticalMonthlyPayment: input.keepBorrowing.theoreticalMonthlyPayment,
        totalRepayment: input.keepBorrowing.totalRepayment,
        mortgageCapacityReduction: keepMortgageReduction,
        note: "Maandelijkse opname loopt door tot en met de laatste leenmaand.",
      },
      {
        key: "difference",
        label: "Verschil",
        debtAtRepaymentStart: debtAtRepaymentStartDifference,
        theoreticalMonthlyPayment: theoreticalMonthlyPaymentDifference,
        totalRepayment: totalRepaymentDifference,
        mortgageCapacityReduction: mortgageCapacityReductionDifference,
        note: "Extra effect van doorlenen ten opzichte van nu stoppen.",
      },
    ],
  };
}

export function calculateDuoLoanProjectionView(
  values: DuoLoanProjectionFormValues,
  calculationMonth = getCurrentYearMonth(),
): DuoLoanProjectionView {
  const mapping = mapDuoLoanProjectionFormToInput(values, calculationMonth);
  const slider = getDuoLoanProjectionSliderConfig();

  if (!mapping.input) {
    return {
      isValid: false,
      calculationMonth,
      errors: mapping.errors,
      slider,
    };
  }

  const keepBorrowing = projectDuoLoan(mapping.input, { calculationMonth });
  const stopNow = projectDuoLoan(createStopNowInput(mapping.input, calculationMonth), {
    calculationMonth,
  });
  const comparison = createComparison({
    stopNow,
    keepBorrowing,
    showMortgageImpact: mapping.input.includeMortgageImpact === true,
  });

  return {
    isValid: true,
    calculationMonth,
    errors: mapping.errors,
    input: mapping.input,
    stopNow,
    keepBorrowing,
    comparison,
    slider,
    showMortgageImpact: mapping.input.includeMortgageImpact === true,
  };
}
