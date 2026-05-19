import { calculateExtraRepaymentVsInvesting } from "@/lib/duo";
import {
  getDefaultFinancialYear,
  getFinancialConstants,
} from "@/lib/financial-constants";
import { calculateBox3Tax } from "@/lib/tax";

export type CalculatorInput = {
  monthlyAmount: number;
  annualDebtRate: number;
  annualInvestmentReturn: number;
  years: number;
  box3EffectEnabled?: boolean;
  taxYear?: number;
  hasFiscalPartner?: boolean;
  box3BankDeposits?: number;
  box3InvestmentsAndOtherAssets?: number;
  box3Debts?: number;
};

export type CalculatorResult = {
  totalExtraRepayment: number;
  indicativeInterestSavings: number;
  expectedInvestmentValue: number;
  difference: number;
  projections: ProjectionPoint[];
  box3Scenario?: Box3ScenarioResult;
};

export type ProjectionPoint = {
  year: number;
  totalExtraRepayment: number;
  debtStrategyValue: number;
  expectedInvestmentValue: number;
  difference: number;
};

export type Box3ScenarioResult = {
  year: number;
  hasFiscalPartner: boolean;
  box3TaxWithoutScenario: number;
  box3TaxWithInvestingScenario: number;
  additionalBox3TaxIndicative: number;
  netInvestingOutcomeAfterBox3: number;
  differenceRepaymentVsInvestingAfterBox3: number;
  taxFreeAllowance: number;
  box3TaxRate: number;
  deemedReturnBankDepositsRate: number;
  deemedReturnInvestmentsRate: number;
  deemedReturnDebtsRate: number;
  usedBankDeposits: number;
  usedInvestmentsAndOtherAssets: number;
  usedDebts: number;
  warnings: string[];
};

function sanitizeMoney(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(value, 0);
}

function sanitizeYear(value?: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return undefined;
  }

  const rounded = Math.round(value);
  if (rounded < 2000 || rounded > 2200) {
    return undefined;
  }

  return rounded;
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
  const defaultYear = getDefaultFinancialYear();
  const safeInput: CalculatorInput = {
    monthlyAmount: sanitizeMoney(input.monthlyAmount),
    annualDebtRate: sanitizeMoney(input.annualDebtRate),
    annualInvestmentReturn: sanitizeMoney(input.annualInvestmentReturn),
    years: sanitizeMoney(input.years),
    box3EffectEnabled: input.box3EffectEnabled ?? false,
    taxYear: sanitizeYear(input.taxYear),
    hasFiscalPartner: Boolean(input.hasFiscalPartner),
    box3BankDeposits: sanitizeMoney(input.box3BankDeposits ?? 0),
    box3InvestmentsAndOtherAssets: sanitizeMoney(
      input.box3InvestmentsAndOtherAssets ?? 0,
    ),
    box3Debts: sanitizeMoney(input.box3Debts ?? 0),
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
  const difference = roundMoney(expectedInvestmentValue - debtStrategyValue);

  const box3Scenario = (() => {
    if (!safeInput.box3EffectEnabled) {
      return undefined;
    }

    const usedYear = safeInput.taxYear ?? defaultYear;
    const constants = getFinancialConstants(usedYear);

    const baseBox3 = calculateBox3Tax({
      year: usedYear,
      hasFiscalPartner: safeInput.hasFiscalPartner,
      bankDeposits: safeInput.box3BankDeposits,
      investmentsAndOtherAssets: safeInput.box3InvestmentsAndOtherAssets,
      debts: safeInput.box3Debts,
    });

    const withScenarioBox3 = calculateBox3Tax({
      year: usedYear,
      hasFiscalPartner: safeInput.hasFiscalPartner,
      bankDeposits: safeInput.box3BankDeposits,
      investmentsAndOtherAssets:
        (safeInput.box3InvestmentsAndOtherAssets ?? 0) + expectedInvestmentValue,
      debts: safeInput.box3Debts,
    });

    const additionalBox3TaxIndicative = roundMoney(
      Math.max(withScenarioBox3.box3Tax - baseBox3.box3Tax, 0),
    );
    const netInvestingOutcomeAfterBox3 = roundMoney(
      Math.max(expectedInvestmentValue - additionalBox3TaxIndicative, 0),
    );
    const differenceRepaymentVsInvestingAfterBox3 = roundMoney(
      netInvestingOutcomeAfterBox3 - debtStrategyValue,
    );

    return {
      year: withScenarioBox3.year,
      hasFiscalPartner: safeInput.hasFiscalPartner ?? false,
      box3TaxWithoutScenario: baseBox3.box3Tax,
      box3TaxWithInvestingScenario: withScenarioBox3.box3Tax,
      additionalBox3TaxIndicative,
      netInvestingOutcomeAfterBox3,
      differenceRepaymentVsInvestingAfterBox3,
      taxFreeAllowance: withScenarioBox3.taxFreeAllowance,
      box3TaxRate: constants.box3.taxRate,
      deemedReturnBankDepositsRate: constants.box3.deemedReturns.bankDeposits,
      deemedReturnInvestmentsRate:
        constants.box3.deemedReturns.investmentsAndOtherAssets,
      deemedReturnDebtsRate: constants.box3.deemedReturns.debts,
      usedBankDeposits: safeInput.box3BankDeposits ?? 0,
      usedInvestmentsAndOtherAssets: safeInput.box3InvestmentsAndOtherAssets ?? 0,
      usedDebts: safeInput.box3Debts ?? 0,
      warnings: withScenarioBox3.warnings,
    };
  })();

  return {
    totalExtraRepayment,
    indicativeInterestSavings: roundMoney(comparison.duoInterestSavedIndicative),
    expectedInvestmentValue,
    difference,
    projections,
    box3Scenario,
  };
}
