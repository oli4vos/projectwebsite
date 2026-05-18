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

function calculateFutureValueOfMonthlyDeposits(
  monthlyAmount: number,
  annualRatePercent: number,
  months: number,
) {
  if (months <= 0 || monthlyAmount <= 0) {
    return 0;
  }

  const monthlyRate = annualRatePercent / 100 / 12;

  if (monthlyRate === 0) {
    return monthlyAmount * months;
  }

  return monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

export function calculateStudyDebtVsInvesting(
  input: CalculatorInput,
): CalculatorResult {
  const months = Math.round(input.years * 12);
  const totalExtraRepayment = input.monthlyAmount * months;
  const debtStrategyValue = calculateFutureValueOfMonthlyDeposits(
    input.monthlyAmount,
    input.annualDebtRate,
    months,
  );
  const expectedInvestmentValue = calculateFutureValueOfMonthlyDeposits(
    input.monthlyAmount,
    input.annualInvestmentReturn,
    months,
  );
  const projections = Array.from({ length: Math.round(input.years) + 1 }, (_, index) => {
    const projectionMonths = index * 12;
    const projectionRepayment = input.monthlyAmount * projectionMonths;
    const projectionDebtValue = calculateFutureValueOfMonthlyDeposits(
      input.monthlyAmount,
      input.annualDebtRate,
      projectionMonths,
    );
    const projectionInvestmentValue = calculateFutureValueOfMonthlyDeposits(
      input.monthlyAmount,
      input.annualInvestmentReturn,
      projectionMonths,
    );

    return {
      year: index,
      totalExtraRepayment: projectionRepayment,
      debtStrategyValue: projectionDebtValue,
      expectedInvestmentValue: projectionInvestmentValue,
      difference: projectionInvestmentValue - projectionDebtValue,
    };
  });

  return {
    totalExtraRepayment,
    indicativeInterestSavings: debtStrategyValue - totalExtraRepayment,
    expectedInvestmentValue,
    difference: expectedInvestmentValue - debtStrategyValue,
    projections,
  };
}
