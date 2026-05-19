import {
  calculateExtraRepaymentPayoffImpact,
  calculateExtraRepaymentVsInvesting,
  type ExtraRepaymentPayoffImpactResult,
} from "@/lib/duo";
import {
  getDefaultFinancialYear,
  getFinancialConstants,
} from "@/lib/financial-constants";
import { calculateBox3Tax } from "@/lib/tax";
import type { Box3Method } from "@/lib/tax";

export type CalculatorInput = {
  monthlyAmount: number;
  annualDebtRate: number;
  annualInvestmentReturn: number;
  years: number;
  box3EffectEnabled?: boolean;
  taxYear?: number;
  hasFiscalPartner?: boolean;
  box3Method?: Box3Method;
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
  payoffTiming: {
    lowerMonthlyPayment: ExtraRepaymentPayoffImpactResult;
    shortenTerm: ExtraRepaymentPayoffImpactResult;
  };
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
  box3Method: Box3Method;
  box3TaxWithoutScenario: number;
  box3TaxWithInvestingScenario: number;
  additionalBox3TaxIndicative: number;
  cumulativeAdditionalBox3TaxIndicative: number;
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
  yearlyBreakdown: Box3YearlyBreakdown[];
  warnings: string[];
};

export type Box3YearlyBreakdown = {
  year: number;
  startPortfolio: number;
  yearlyContribution: number;
  grossReturn: number;
  portfolioBeforeTax: number;
  box3TaxWithoutScenario: number;
  box3TaxWithScenario: number;
  additionalBox3Tax: number;
  portfolioAfterTax: number;
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

function roundYears(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(Math.round(value), 0);
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
    box3Method: input.box3Method ?? "actual",
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
  const projectionYears = roundYears(safeInput.years);
  const projections = Array.from({ length: projectionYears + 1 }, (_, index) =>
    buildYearProjection(safeInput, index),
  );
  const difference = roundMoney(expectedInvestmentValue - debtStrategyValue);
  const box3Method = safeInput.box3Method ?? "actual";
  const payoffTiming = {
    lowerMonthlyPayment: calculateExtraRepaymentPayoffImpact({
      remainingDebt: totalExtraRepayment,
      annualInterestRate: safeInput.annualDebtRate,
      remainingTermYears: safeInput.years,
      extraRepaymentAmount: totalExtraRepayment,
      strategy: "lowerMonthlyPayment",
    }),
    shortenTerm: calculateExtraRepaymentPayoffImpact({
      remainingDebt: totalExtraRepayment,
      annualInterestRate: safeInput.annualDebtRate,
      remainingTermYears: safeInput.years,
      extraRepaymentAmount: totalExtraRepayment,
      strategy: "shortenTerm",
    }),
  };

  const box3Scenario = (() => {
    if (!safeInput.box3EffectEnabled) {
      return undefined;
    }

    const usedYear = safeInput.taxYear ?? defaultYear;
    const constants = getFinancialConstants(usedYear);
    const annualReturnRate = sanitizeMoney(safeInput.annualInvestmentReturn);
    const monthlyContribution = roundMoney(safeInput.monthlyAmount);
    const monthlyReturnRate = annualReturnRate / 100 / 12;
    const yearlyContribution = roundMoney(monthlyContribution * 12);
    const yearlyBreakdown: Box3YearlyBreakdown[] = [];
    let portfolio = 0;
    let cumulativeAdditionalBox3TaxIndicative = 0;
    let lastBox3TaxWithoutScenario = 0;
    let lastBox3TaxWithScenario = 0;

    for (let yearIndex = 1; yearIndex <= projectionYears; yearIndex += 1) {
      const startPortfolio = roundMoney(portfolio);
      let runningPortfolio = startPortfolio;

      for (let monthIndex = 0; monthIndex < 12; monthIndex += 1) {
        runningPortfolio = roundMoney(runningPortfolio + monthlyContribution);
        runningPortfolio = roundMoney(
          runningPortfolio * (1 + monthlyReturnRate),
        );
      }

      const portfolioBeforeTax = roundMoney(runningPortfolio);
      const grossReturn = roundMoney(
        portfolioBeforeTax - startPortfolio - yearlyContribution,
      );

      const baseBox3 = calculateBox3Tax({
        year: usedYear,
        hasFiscalPartner: safeInput.hasFiscalPartner,
        method: box3Method,
        actualAnnualReturnRate:
          box3Method === "actual" ? safeInput.annualInvestmentReturn : undefined,
        bankDeposits: safeInput.box3BankDeposits,
        investmentsAndOtherAssets: safeInput.box3InvestmentsAndOtherAssets,
        debts: safeInput.box3Debts,
      });
      const withScenarioBox3 = calculateBox3Tax({
        year: usedYear,
        hasFiscalPartner: safeInput.hasFiscalPartner,
        method: box3Method,
        actualAnnualReturnRate:
          box3Method === "actual" ? safeInput.annualInvestmentReturn : undefined,
        bankDeposits: safeInput.box3BankDeposits,
        investmentsAndOtherAssets:
          (safeInput.box3InvestmentsAndOtherAssets ?? 0) + portfolioBeforeTax,
        debts: safeInput.box3Debts,
      });

      const additionalBox3Tax = roundMoney(
        Math.max(withScenarioBox3.box3Tax - baseBox3.box3Tax, 0),
      );
      const portfolioAfterTax = roundMoney(
        Math.max(portfolioBeforeTax - additionalBox3Tax, 0),
      );

      yearlyBreakdown.push({
        year: yearIndex,
        startPortfolio,
        yearlyContribution,
        grossReturn,
        portfolioBeforeTax,
        box3TaxWithoutScenario: baseBox3.box3Tax,
        box3TaxWithScenario: withScenarioBox3.box3Tax,
        additionalBox3Tax,
        portfolioAfterTax,
      });

      cumulativeAdditionalBox3TaxIndicative = roundMoney(
        cumulativeAdditionalBox3TaxIndicative + additionalBox3Tax,
      );
      lastBox3TaxWithoutScenario = baseBox3.box3Tax;
      lastBox3TaxWithScenario = withScenarioBox3.box3Tax;
      portfolio = portfolioAfterTax;
    }

    const additionalBox3TaxIndicative =
      yearlyBreakdown[yearlyBreakdown.length - 1]?.additionalBox3Tax ?? 0;
    const netInvestingOutcomeAfterBox3 = roundMoney(portfolio);
    const differenceRepaymentVsInvestingAfterBox3 = roundMoney(
      netInvestingOutcomeAfterBox3 - debtStrategyValue,
    );

    const taxFreeAllowance = safeInput.hasFiscalPartner
      ? constants.box3.taxFreeAllowancePartners
      : constants.box3.taxFreeAllowanceSingle;

    return {
      year: usedYear,
      hasFiscalPartner: safeInput.hasFiscalPartner ?? false,
      box3Method,
      box3TaxWithoutScenario: lastBox3TaxWithoutScenario,
      box3TaxWithInvestingScenario: lastBox3TaxWithScenario,
      additionalBox3TaxIndicative,
      cumulativeAdditionalBox3TaxIndicative,
      netInvestingOutcomeAfterBox3,
      differenceRepaymentVsInvestingAfterBox3,
      taxFreeAllowance,
      box3TaxRate: constants.box3.taxRate,
      deemedReturnBankDepositsRate: constants.box3.deemedReturns.bankDeposits,
      deemedReturnInvestmentsRate:
        constants.box3.deemedReturns.investmentsAndOtherAssets,
      deemedReturnDebtsRate: constants.box3.deemedReturns.debts,
      usedBankDeposits: safeInput.box3BankDeposits ?? 0,
      usedInvestmentsAndOtherAssets: safeInput.box3InvestmentsAndOtherAssets ?? 0,
      usedDebts: safeInput.box3Debts ?? 0,
      yearlyBreakdown,
      warnings: [
        "Box 3-heffing is hier per jaar indicatief toegepast en jaarlijks uit je beleggingspot gehaald.",
        "Daardoor groeit betaalde box 3 niet mee in je compound rendement.",
        ...(box3Method === "actual"
          ? [
              "Methode staat op werkelijk rendement; dit blijft een vereenvoudigde indicatie en geen officiële aanslagberekening.",
            ]
          : [
              "Methode staat op forfaitair rendement; gebruikte forfaits zijn indicatief en kunnen wijzigen.",
            ]),
      ],
    };
  })();

  return {
    totalExtraRepayment,
    indicativeInterestSavings: roundMoney(comparison.duoInterestSavedIndicative),
    expectedInvestmentValue,
    difference,
    projections,
    payoffTiming,
    box3Scenario,
  };
}
