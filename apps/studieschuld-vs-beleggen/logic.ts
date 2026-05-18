import { calculateExtraRepaymentVsInvesting } from "@/lib/duo";

export type CalculatorInput = {
  monthlyAmount: number;
  annualDebtRate: number;
  annualInvestmentReturn: number;
  years: number;
};

export type CalculatorResult = {
  totalExtraRepayment: number;
  indicativeInterestSavings: number;
  expectedInvestmentValue: number;
  difference: number;
  projections: ProjectionPoint[];
};

export type ProjectionPoint = {
  year: number;
  totalExtraRepayment: number;
  debtStrategyValue: number;
  expectedInvestmentValue: number;
  difference: number;
};

function sanitizeMoney(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(value, 0);
}

function roundMoney(value: number) {
  return Math.round(sanitizeMoney(value) * 100) / 100;
}

function buildYearProjection(input: CalculatorInput, year: number): ProjectionPoint {
  const months = Math.max(Math.round(year * 12), 0);
  const totalExtraRepayment = roundMoney(input.monthlyAmount * months);
  const comparison = calculateExtraRepaymentVsInvesting({
    remainingDebt: totalExtraRepayment,
    annualDuoInterestRate: input.annualDebtRate,
    remainingTermYears: year,
    extraRepaymentAmount: totalExtraRepayment,
    monthlyExtraAmount: input.monthlyAmount,
    expectedAnnualReturn: input.annualInvestmentReturn,
    investmentHorizonYears: year,
  });
  const debtStrategyValue = roundMoney(
    totalExtraRepayment + comparison.duoInterestSavedIndicative,
  );
  const expectedInvestmentValue = roundMoney(comparison.netFutureValueIfInvested);

  return {
    year,
    totalExtraRepayment,
    debtStrategyValue,
    expectedInvestmentValue,
    difference: roundMoney(expectedInvestmentValue - debtStrategyValue),
  };
}

export function calculateStudyDebtVsInvesting(
  input: CalculatorInput,
): CalculatorResult {
  const safeInput: CalculatorInput = {
    monthlyAmount: sanitizeMoney(input.monthlyAmount),
    annualDebtRate: sanitizeMoney(input.annualDebtRate),
    annualInvestmentReturn: sanitizeMoney(input.annualInvestmentReturn),
    years: sanitizeMoney(input.years),
  };
  const totalExtraRepayment = roundMoney(safeInput.monthlyAmount * safeInput.years * 12);
  const comparison = calculateExtraRepaymentVsInvesting({
    remainingDebt: totalExtraRepayment,
    annualDuoInterestRate: safeInput.annualDebtRate,
    remainingTermYears: safeInput.years,
    extraRepaymentAmount: totalExtraRepayment,
    monthlyExtraAmount: safeInput.monthlyAmount,
    expectedAnnualReturn: safeInput.annualInvestmentReturn,
    investmentHorizonYears: safeInput.years,
  });
  const debtStrategyValue = roundMoney(
    totalExtraRepayment + comparison.duoInterestSavedIndicative,
  );
  const expectedInvestmentValue = roundMoney(comparison.netFutureValueIfInvested);
  const projectionYears = Math.round(safeInput.years);
  const projections = Array.from({ length: projectionYears + 1 }, (_, index) =>
    buildYearProjection(safeInput, index),
  );

  return {
    totalExtraRepayment,
    indicativeInterestSavings: roundMoney(comparison.duoInterestSavedIndicative),
    expectedInvestmentValue,
    difference: roundMoney(expectedInvestmentValue - debtStrategyValue),
    projections,
  };
}
