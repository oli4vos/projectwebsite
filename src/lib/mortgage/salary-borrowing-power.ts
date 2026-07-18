import { calculateIndicativeMaxMortgage } from "@/lib/mortgage/max-mortgage";
import type {
  MortgageMaxMortgageInput,
  MortgageMaxMortgageResult,
} from "@/lib/mortgage/types";

export type SalaryBorrowingPowerScenarioKey =
  | "current"
  | "plus-100-month"
  | "plus-250-month"
  | "plus-500-month"
  | "custom";

export type SalaryBorrowingPowerScenario = {
  key: SalaryBorrowingPowerScenarioKey;
  grossAnnualIncome: number;
  annualIncrease: number;
  monthlyIncrease: number;
  percentageIncrease: number;
  maxMortgage: number;
  additionalBorrowingPower: number;
  additionalBorrowingPowerPer100GrossMonthly: number | null;
  result: MortgageMaxMortgageResult;
};

export type RequiredIncomeSearchResult =
  | {
      status: "found";
      targetMortgage: number;
      requiredGrossAnnualIncome: number;
      iterations: number;
      tolerance: number;
      result: MortgageMaxMortgageResult;
    }
  | {
      status: "not-found";
      targetMortgage: number;
      minGrossAnnualIncome: number;
      maxGrossAnnualIncome: number;
      tolerance: number;
      reason: "target-below-minimum" | "target-above-maximum" | "invalid-target";
    };

export type SalaryBorrowingPowerInput = {
  baseMortgageInput: Omit<MortgageMaxMortgageInput, "grossAnnualHouseholdIncome"> & {
    grossAnnualHouseholdIncome: number;
  };
  customGrossAnnualIncome?: number;
  targetMortgage?: number;
  search?: {
    minGrossAnnualIncome?: number;
    maxGrossAnnualIncome?: number;
    tolerance?: number;
    maxIterations?: number;
  };
  calculateMortgage?: (input: MortgageMaxMortgageInput) => MortgageMaxMortgageResult;
};

export type SalaryBorrowingPowerResult = {
  currentGrossAnnualIncome: number;
  scenarios: SalaryBorrowingPowerScenario[];
  requiredIncome: RequiredIncomeSearchResult | null;
  assumptions: string[];
  warnings: string[];
};

function sanitizeMoney(value: number) {
  return Number.isFinite(value) ? Math.max(value, 0) : 0;
}

function roundMoney(value: number) {
  return Math.round(sanitizeMoney(value) * 100) / 100;
}

function roundSignedMoney(value: number) {
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : 0;
}

function buildScenario(
  key: SalaryBorrowingPowerScenarioKey,
  currentIncome: number,
  scenarioIncome: number,
  baseInput: MortgageMaxMortgageInput,
  currentResult: MortgageMaxMortgageResult,
  calculateMortgage: (input: MortgageMaxMortgageInput) => MortgageMaxMortgageResult,
): SalaryBorrowingPowerScenario {
  const result =
    key === "current"
      ? currentResult
      : calculateMortgage({ ...baseInput, grossAnnualHouseholdIncome: scenarioIncome });
  const annualIncrease = roundSignedMoney(scenarioIncome - currentIncome);
  const monthlyIncrease = roundSignedMoney(annualIncrease / 12);
  const additionalBorrowingPower = roundSignedMoney(
    result.finalMaxMortgage - currentResult.finalMaxMortgage,
  );
  const additionalBorrowingPowerPer100GrossMonthly =
    monthlyIncrease === 0
      ? null
      : roundMoney((additionalBorrowingPower / monthlyIncrease) * 100);

  return {
    key,
    grossAnnualIncome: roundMoney(scenarioIncome),
    annualIncrease,
    monthlyIncrease,
    percentageIncrease:
      currentIncome > 0 ? Math.round((annualIncrease / currentIncome) * 10_000) / 100 : 0,
    maxMortgage: result.finalMaxMortgage,
    additionalBorrowingPower,
    additionalBorrowingPowerPer100GrossMonthly,
    result,
  };
}

function findRequiredIncome(
  targetMortgage: number,
  baseInput: MortgageMaxMortgageInput,
  calculateMortgage: (input: MortgageMaxMortgageInput) => MortgageMaxMortgageResult,
  search: NonNullable<SalaryBorrowingPowerInput["search"]> = {},
): RequiredIncomeSearchResult {
  const target = sanitizeMoney(targetMortgage);
  const minGrossAnnualIncome = sanitizeMoney(search.minGrossAnnualIncome ?? 0);
  const maxGrossAnnualIncome = sanitizeMoney(search.maxGrossAnnualIncome ?? 250_000);
  const tolerance = Math.max(sanitizeMoney(search.tolerance ?? 100), 1);
  const maxIterations = Math.max(Math.round(search.maxIterations ?? 40), 1);

  if (target <= 0 || maxGrossAnnualIncome <= minGrossAnnualIncome) {
    return {
      status: "not-found",
      targetMortgage: target,
      minGrossAnnualIncome,
      maxGrossAnnualIncome,
      tolerance,
      reason: "invalid-target",
    };
  }

  const minResult = calculateMortgage({
    ...baseInput,
    grossAnnualHouseholdIncome: minGrossAnnualIncome,
  });
  if (minResult.finalMaxMortgage >= target) {
    return {
      status: "not-found",
      targetMortgage: target,
      minGrossAnnualIncome,
      maxGrossAnnualIncome,
      tolerance,
      reason: "target-below-minimum",
    };
  }

  const maxResult = calculateMortgage({
    ...baseInput,
    grossAnnualHouseholdIncome: maxGrossAnnualIncome,
  });
  if (maxResult.finalMaxMortgage < target) {
    return {
      status: "not-found",
      targetMortgage: target,
      minGrossAnnualIncome,
      maxGrossAnnualIncome,
      tolerance,
      reason: "target-above-maximum",
    };
  }

  let low = minGrossAnnualIncome;
  let high = maxGrossAnnualIncome;
  let bestIncome = high;
  let bestResult = maxResult;
  let iterations = 0;

  while (iterations < maxIterations && high - low > tolerance) {
    iterations += 1;
    const mid = (low + high) / 2;
    const result = calculateMortgage({
      ...baseInput,
      grossAnnualHouseholdIncome: mid,
    });

    if (result.finalMaxMortgage >= target) {
      bestIncome = mid;
      bestResult = result;
      high = mid;
    } else {
      low = mid;
    }
  }

  return {
    status: "found",
    targetMortgage: target,
    requiredGrossAnnualIncome: roundMoney(bestIncome),
    iterations,
    tolerance,
    result: bestResult,
  };
}

export function calculateSalaryBorrowingPower(
  input: SalaryBorrowingPowerInput,
): SalaryBorrowingPowerResult {
  const calculateMortgage = input.calculateMortgage ?? calculateIndicativeMaxMortgage;
  const currentGrossAnnualIncome = sanitizeMoney(
    input.baseMortgageInput.grossAnnualHouseholdIncome,
  );
  const baseInput = {
    ...input.baseMortgageInput,
    grossAnnualHouseholdIncome: currentGrossAnnualIncome,
  };
  const currentResult = calculateMortgage(baseInput);
  const customIncome = sanitizeMoney(input.customGrossAnnualIncome ?? currentGrossAnnualIncome);
  const scenarios = [
    buildScenario("current", currentGrossAnnualIncome, currentGrossAnnualIncome, baseInput, currentResult, calculateMortgage),
    buildScenario("plus-100-month", currentGrossAnnualIncome, currentGrossAnnualIncome + 1_200, baseInput, currentResult, calculateMortgage),
    buildScenario("plus-250-month", currentGrossAnnualIncome, currentGrossAnnualIncome + 3_000, baseInput, currentResult, calculateMortgage),
    buildScenario("plus-500-month", currentGrossAnnualIncome, currentGrossAnnualIncome + 6_000, baseInput, currentResult, calculateMortgage),
    buildScenario("custom", currentGrossAnnualIncome, customIncome, baseInput, currentResult, calculateMortgage),
  ];

  return {
    currentGrossAnnualIncome,
    scenarios,
    requiredIncome:
      input.targetMortgage === undefined
        ? null
        : findRequiredIncome(input.targetMortgage, baseInput, calculateMortgage, input.search),
    assumptions: [
      "mortgage-capacity-model",
      "income-durability-not-assessed",
      "provider-policy-may-differ",
    ],
    warnings:
      customIncome < currentGrossAnnualIncome
        ? ["custom-income-below-current-income"]
        : [],
  };
}
