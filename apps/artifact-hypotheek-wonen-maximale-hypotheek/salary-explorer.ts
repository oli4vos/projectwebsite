import {
  MORTGAGE_SALARY_BORROWING_POWER_LIMITS,
  validateFinancialInputLimit,
} from "@/lib/financial-constants/input-limits";
import {
  calculateSalaryBorrowingPower,
  type MortgageMaxMortgageInput,
  type SalaryBorrowingPowerResult,
} from "@/lib/mortgage";
import { parseOptionalDecimalInput } from "@/lib/number-input";

export type SalaryExplorerFormState = {
  newGrossAnnualIncome: string;
};

export type SalaryExplorerValidation = {
  parsed: number | null;
  error?: string;
  outsidePracticalSliderRange: boolean;
};

export type SalaryExplorerViewModel = {
  result: SalaryBorrowingPowerResult;
  currentGrossAnnualIncome: number;
  currentGrossMonthlyIncome: number;
  newGrossAnnualIncome: number;
  newGrossMonthlyIncome: number;
  monthlyIncrease: number;
  percentageIncrease: number;
  slider: SalaryExplorerSliderConfig;
  outsidePracticalSliderRange: boolean;
};

export type SalaryExplorerSliderConfig = {
  min: number;
  max: number;
  step: number;
  value: number;
  practicalIncreasePercent: number;
};

const salaryLimit = MORTGAGE_SALARY_BORROWING_POWER_LIMITS.newGrossAnnualIncome;
const sliderLimit = MORTGAGE_SALARY_BORROWING_POWER_LIMITS.practicalSliderIncreasePercent;

function roundMoney(value: number) {
  return Math.round(Math.max(Number.isFinite(value) ? value : 0, 0) * 100) / 100;
}

function roundToStep(value: number, step: number) {
  if (step <= 0) return roundMoney(value);
  return Math.round(value / step) * step;
}

export function defaultSalaryExplorerForm(
  baseInput: MortgageMaxMortgageInput,
): SalaryExplorerFormState {
  return {
    newGrossAnnualIncome: String(roundMoney(baseInput.grossAnnualHouseholdIncome)),
  };
}

export function getSalaryExplorerSliderConfig(
  currentGrossAnnualIncome: number,
  newGrossAnnualIncome: number,
): SalaryExplorerSliderConfig {
  const step = salaryLimit.step ?? 100;
  const practicalIncreasePercent = sliderLimit.max ?? 20;
  const min = roundToStep(currentGrossAnnualIncome, step);
  const max = Math.max(
    min + step,
    roundToStep(currentGrossAnnualIncome * (1 + practicalIncreasePercent / 100), step),
  );

  return {
    min,
    max,
    step,
    value: Math.min(Math.max(roundToStep(newGrossAnnualIncome, step), min), max),
    practicalIncreasePercent,
  };
}

export function validateSalaryExplorerForm(
  form: SalaryExplorerFormState,
  baseInput: MortgageMaxMortgageInput,
): SalaryExplorerValidation {
  const parsed = parseOptionalDecimalInput(form.newGrossAnnualIncome);
  const currentIncome = roundMoney(baseInput.grossAnnualHouseholdIncome);
  const numericValue = parsed ?? Number.NaN;
  const limitResult = validateFinancialInputLimit(numericValue, salaryLimit);
  const slider = getSalaryExplorerSliderConfig(currentIncome, Number.isFinite(numericValue) ? numericValue : currentIncome);

  if (!limitResult.valid) {
    return {
      parsed: null,
      error:
        limitResult.status === "not-finite"
          ? "Vul een geldig bruto jaarinkomen in."
          : limitResult.messages[0],
      outsidePracticalSliderRange: false,
    };
  }

  return {
    parsed: roundMoney(numericValue),
    outsidePracticalSliderRange: numericValue < slider.min || numericValue > slider.max,
  };
}

export function buildSalaryExplorerViewModel(
  form: SalaryExplorerFormState,
  baseInput: MortgageMaxMortgageInput,
): SalaryExplorerViewModel | null {
  const validation = validateSalaryExplorerForm(form, baseInput);
  if (validation.parsed === null) {
    return null;
  }

  const result = calculateSalaryBorrowingPower({
    baseMortgageInput: {
      ...baseInput,
      grossAnnualHouseholdIncome: roundMoney(baseInput.grossAnnualHouseholdIncome),
    },
    customGrossAnnualIncome: validation.parsed,
  });
  const customScenario =
    result.scenarios.find((scenario) => scenario.key === "custom") ?? result.scenarios[0];
  const currentGrossAnnualIncome = roundMoney(result.currentGrossAnnualIncome);
  const newGrossAnnualIncome = roundMoney(customScenario.grossAnnualIncome);

  return {
    result,
    currentGrossAnnualIncome,
    currentGrossMonthlyIncome: roundMoney(currentGrossAnnualIncome / 12),
    newGrossAnnualIncome,
    newGrossMonthlyIncome: roundMoney(newGrossAnnualIncome / 12),
    monthlyIncrease: customScenario.monthlyIncrease,
    percentageIncrease: customScenario.percentageIncrease,
    slider: getSalaryExplorerSliderConfig(currentGrossAnnualIncome, newGrossAnnualIncome),
    outsidePracticalSliderRange: validation.outsidePracticalSliderRange,
  };
}
