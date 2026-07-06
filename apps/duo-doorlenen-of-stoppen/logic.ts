import { getDuoBorrowingLimits } from "@/lib/financial-constants";
import {
  projectDuoLoan,
  type DuoLoanProjectionInput,
  type DuoLoanProjectionResult,
} from "@/lib/duo";
import { parseOptionalDecimalInput } from "@/lib/number-input";

export type DuoLoanProjectionFormValues = {
  currentDebt: string;
  loanStatus: DuoLoanProjectionLoanStatus;
  monthlyLoanAmount: string;
  expectedLastLoanMonth: string;
  stoppedBorrowingMonth: string;
  includeMortgageImpact: boolean;
};

export type DuoLoanProjectionLoanStatus = "still-borrowing" | "already-stopped";

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
      loanStatus: DuoLoanProjectionLoanStatus;
      stoppedBorrowingMonth?: string;
      effectiveLastLoanMonth: string;
    };

export type DuoLoanProjectionSliderConfig = {
  min: number;
  max: number;
  step: number;
  sourceUrl: string;
  notes: string;
};

export type DuoLoanProjectionMonthOption = {
  label: string;
  value: string;
  helper: string;
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

export function createFutureLoanMonthOptions(
  calculationMonth = getCurrentYearMonth(),
): DuoLoanProjectionMonthOption[] {
  const parsedCalculationMonth = parseYearMonth(calculationMonth) ?? createCurrentYearMonth();
  const options = [
    { loanMonths: 1, label: "Deze maand" },
    { loanMonths: 3, label: "3 maanden" },
    { loanMonths: 6, label: "6 maanden" },
    { loanMonths: 12, label: "12 maanden" },
    { loanMonths: 24, label: "24 maanden" },
  ];

  return options.map((option) => ({
    label: option.label,
    value: formatYearMonth(addMonths(parsedCalculationMonth, option.loanMonths - 1)),
    helper:
      option.loanMonths === 1
        ? "Alleen de rekenmaand telt mee."
        : `${option.loanMonths} leenmaanden inclusief de rekenmaand.`,
  }));
}

export function createStoppedBorrowingMonthOptions(
  calculationMonth = getCurrentYearMonth(),
): DuoLoanProjectionMonthOption[] {
  const parsedCalculationMonth = parseYearMonth(calculationMonth) ?? createCurrentYearMonth();
  const options = [
    { monthsAgo: 0, label: "Deze maand" },
    { monthsAgo: 1, label: "Vorige maand" },
    { monthsAgo: 6, label: "6 maanden geleden" },
    { monthsAgo: 12, label: "12 maanden geleden" },
  ];

  return options.map((option) => ({
    label: option.label,
    value: formatYearMonth(addMonths(parsedCalculationMonth, -option.monthsAgo)),
    helper:
      option.monthsAgo === 0
        ? "Je neemt vanaf nu niets meer op."
        : `Je bent ${option.label.toLowerCase()} gestopt met opnemen.`,
  }));
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
    loanStatus: "still-borrowing",
    monthlyLoanAmount: "300",
    expectedLastLoanMonth: formatYearMonth(addMonths(parsedCalculationMonth, 11)),
    stoppedBorrowingMonth: calculationMonth,
    includeMortgageImpact: false,
  };
}

export function createEmptyDuoLoanProjectionValues(): DuoLoanProjectionFormValues {
  return {
    currentDebt: "",
    loanStatus: "still-borrowing",
    monthlyLoanAmount: "",
    expectedLastLoanMonth: "",
    stoppedBorrowingMonth: "",
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

export function updateDuoLoanProjectionLoanStatus(
  values: DuoLoanProjectionFormValues,
  loanStatus: DuoLoanProjectionLoanStatus,
  calculationMonth = getCurrentYearMonth(),
): DuoLoanProjectionFormValues {
  const parsedCalculationMonth = parseYearMonth(calculationMonth) ?? createCurrentYearMonth();

  if (loanStatus === "already-stopped") {
    return {
      ...values,
      loanStatus,
      monthlyLoanAmount: "0",
      expectedLastLoanMonth: calculationMonth,
      stoppedBorrowingMonth: values.stoppedBorrowingMonth || calculationMonth,
    };
  }

  return {
    ...values,
    loanStatus,
    monthlyLoanAmount: values.monthlyLoanAmount === "0" ? "300" : values.monthlyLoanAmount,
    expectedLastLoanMonth:
      values.expectedLastLoanMonth || formatYearMonth(addMonths(parsedCalculationMonth, 11)),
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
  const stoppedBorrowingMonth = parseYearMonth(values.stoppedBorrowingMonth);
  const parsedCalculationMonth = parseYearMonth(calculationMonth) ?? createCurrentYearMonth();
  const slider = getDuoLoanProjectionSliderConfig();
  const isAlreadyStopped = values.loanStatus === "already-stopped";

  if (currentDebt === undefined || !Number.isFinite(currentDebt) || currentDebt < 0) {
    errors.currentDebt = "Gebruik 0 of een hogere huidige studieschuld.";
  }

  if (values.loanStatus !== "still-borrowing" && values.loanStatus !== "already-stopped") {
    errors.loanStatus = "Kies of je nog leent of al gestopt bent.";
  }

  if (isAlreadyStopped) {
    if (!stoppedBorrowingMonth) {
      errors.stoppedBorrowingMonth = "Kies vanaf welke maand je niet meer leent.";
    } else if (compareYearMonth(stoppedBorrowingMonth, parsedCalculationMonth) > 0) {
      errors.stoppedBorrowingMonth = "De stopmaand mag niet in de toekomst liggen.";
    }
  } else {
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
      errors.expectedLastLoanMonth = "Kies een geldige laatste leenmaand.";
    } else if (compareYearMonth(lastLoanMonth, parsedCalculationMonth) < 0) {
      errors.expectedLastLoanMonth =
        "De laatste leenmaand mag niet vóór de rekenmaand liggen.";
    }
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
      monthlyLoanAmount:
        values.loanStatus === "already-stopped"
          ? 0
          : (parseOptionalDecimalInput(values.monthlyLoanAmount) ?? 0),
      expectedLastLoanMonth:
        values.loanStatus === "already-stopped"
          ? calculationMonth
          : values.expectedLastLoanMonth,
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
  loanStatus: DuoLoanProjectionLoanStatus;
  stoppedBorrowingMonth?: string;
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
  const isAlreadyStopped = input.loanStatus === "already-stopped";

  return {
    debtAtRepaymentStartDifference,
    theoreticalMonthlyPaymentDifference,
    totalRepaymentDifference,
    mortgageCapacityReductionDifference,
    tableRows: [
      {
        key: "stop-now",
        label: isAlreadyStopped ? "Niet meer lenen" : "Nu stoppen met lenen",
        debtAtRepaymentStart: input.stopNow.debtAtRepaymentStart,
        theoreticalMonthlyPayment: input.stopNow.theoreticalMonthlyPayment,
        totalRepayment: input.stopNow.totalRepayment,
        mortgageCapacityReduction: stopMortgageReduction,
        note: isAlreadyStopped
          ? `Geen nieuwe opname; gestopt sinds ${input.stoppedBorrowingMonth ?? "de gekozen maand"}.`
          : "Geen extra opname vanaf de rekenmaand.",
      },
      {
        key: "keep-borrowing",
        label: isAlreadyStopped ? "Projectie vanaf huidige schuld" : "Doorlenen tot gekozen maand",
        debtAtRepaymentStart: input.keepBorrowing.debtAtRepaymentStart,
        theoreticalMonthlyPayment: input.keepBorrowing.theoreticalMonthlyPayment,
        totalRepayment: input.keepBorrowing.totalRepayment,
        mortgageCapacityReduction: keepMortgageReduction,
        note: isAlreadyStopped
          ? "Je vult je huidige schuld in; er komt geen nieuwe opname bij."
          : "Maandelijkse opname loopt door tot en met de laatste leenmaand.",
      },
      {
        key: "difference",
        label: isAlreadyStopped ? "Extra effect" : "Verschil",
        debtAtRepaymentStart: debtAtRepaymentStartDifference,
        theoreticalMonthlyPayment: theoreticalMonthlyPaymentDifference,
        totalRepayment: totalRepaymentDifference,
        mortgageCapacityReduction: mortgageCapacityReductionDifference,
        note: isAlreadyStopped
          ? "Omdat je niet meer leent, is er geen extra doorleenverschil."
          : "Extra effect van doorlenen ten opzichte van nu stoppen.",
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
    loanStatus: values.loanStatus,
    stoppedBorrowingMonth: values.stoppedBorrowingMonth || undefined,
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
    loanStatus: values.loanStatus,
    stoppedBorrowingMonth:
      values.loanStatus === "already-stopped" ? values.stoppedBorrowingMonth : undefined,
    effectiveLastLoanMonth: mapping.input.expectedLastLoanMonth,
  };
}
