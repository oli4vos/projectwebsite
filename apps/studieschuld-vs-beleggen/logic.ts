import {
  calculateExtraRepaymentVsInvesting,
  calculateIndicativeIncomeBasedMonthlyPayment,
  calculatePayoffDate,
  calculateStatutoryDuoMonthlyPayment,
  sanitizeDuoMoney,
  sanitizeDuoPercent,
  type RepaymentRule,
} from "@/lib/duo";
import {
  getDefaultFinancialYear,
  getFinancialConstants,
} from "@/lib/financial-constants";
import { calculateBox3Tax } from "@/lib/tax";
import type { Box3Method } from "@/lib/tax";

const DEFAULT_FINANCIAL_YEAR = getDefaultFinancialYear();

export type CalculatorInput = {
  repaymentRule: RepaymentRule;
  remainingDebt: number;
  annualDebtRate?: number;
  remainingTermYears?: number;
  grossAnnualIncome: number;
  partnerGrossAnnualIncome?: number;
  hasPartner?: boolean;
  voluntaryExtraMonthly: number;
  annualInvestmentReturn: number;
  years?: number;
  box3EffectEnabled?: boolean;
  taxYear?: number;
  hasFiscalPartner?: boolean;
  box3Method?: Box3Method;
  box3BankDeposits?: number;
  box3InvestmentsAndOtherAssets?: number;
  box3Debts?: number;
};

export type ProjectionPoint = {
  year: number;
  remainingDebtWithExtra: number;
  debtStrategyValue: number;
  expectedInvestmentValue: number;
  difference: number;
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

export type DuoContext = {
  statutoryMonthlyPayment: number;
  incomeBasedMonthlyPayment: number;
  requiredMonthlyPayment: number;
  voluntaryExtraMonthly: number;
  totalMonthlyToDuo: number;
  mortgageRelevantMonthlyPayment: number;
  payoffWithoutExtraDate: string | null;
  payoffWithExtraDate: string | null;
  monthsEarlierDebtFree: number;
  yearsEarlierDebtFree: number;
  annualIncomeUsed: number;
  amountAboveAllowance: number;
  warnings: string[];
};

export type CalculatorResult = {
  effectiveHorizonMonths: number;
  effectiveHorizonYears: number;
  duoContext: DuoContext;
  totalVoluntaryAmount: number;
  indicativeInterestSavings: number;
  expectedInvestmentValue: number;
  debtStrategyValue: number;
  difference: number;
  projections: ProjectionPoint[];
  warnings: string[];
  box3Scenario?: Box3ScenarioResult;
};

function roundMoney(value: number) {
  return Math.round(sanitizeDuoMoney(value) * 100) / 100;
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

function sanitizeYears(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(Math.round(value), 0);
}

function buildDebtBalanceProjection(input: {
  years: number;
  remainingDebt: number;
  annualDebtRate: number;
  monthlyPayment: number;
}) {
  const years = sanitizeYears(input.years);
  const monthlyRate = sanitizeDuoPercent(input.annualDebtRate) / 100 / 12;
  const monthlyPayment = roundMoney(input.monthlyPayment);
  const balances: number[] = [roundMoney(input.remainingDebt)];

  let balance = roundMoney(input.remainingDebt);
  const maxMonths = years * 12;

  for (let month = 1; month <= maxMonths; month += 1) {
    if (balance <= 0 || monthlyPayment <= 0) {
      if (month % 12 === 0) {
        balances.push(0);
      }
      continue;
    }

    const interest = roundMoney(balance * monthlyRate);
    const principalPaid = Math.max(roundMoney(monthlyPayment - interest), 0);
    balance = roundMoney(Math.max(balance - principalPaid, 0));

    if (month % 12 === 0) {
      balances.push(roundMoney(balance));
    }
  }

  return balances;
}

function sanitizePositiveYears(value?: number, fallback = 1) {
  if (value === undefined || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(value, fallback);
}

function buildProjection(input: {
  years: number;
  remainingDebt: number;
  totalMonthlyToDuo: number;
  voluntaryExtraMonthly: number;
  annualDebtRate: number;
  annualInvestmentReturn: number;
}) {
  const years = sanitizeYears(input.years);
  const points: ProjectionPoint[] = [];
  const debtBalances = buildDebtBalanceProjection({
    years,
    remainingDebt: input.remainingDebt,
    annualDebtRate: input.annualDebtRate,
    monthlyPayment: input.totalMonthlyToDuo,
  });

  for (let year = 0; year <= years; year += 1) {
    const monthlyExtra = roundMoney(input.voluntaryExtraMonthly);
    const totalVoluntary = roundMoney(monthlyExtra * year * 12);
    const debtStrategyValue = roundMoney(
      totalVoluntary *
        (1 + (sanitizeDuoPercent(input.annualDebtRate) / 100) * Math.max(year / 2, 0)),
    );
    const monthlyRate = sanitizeDuoPercent(input.annualInvestmentReturn) / 100 / 12;
    const months = year * 12;
    const expectedInvestmentValue =
      months === 0
        ? 0
        : monthlyRate === 0
          ? roundMoney(monthlyExtra * months)
          : roundMoney(monthlyExtra * (((1 + monthlyRate) ** months - 1) / monthlyRate));

    points.push({
      year,
      remainingDebtWithExtra: debtBalances[year] ?? 0,
      debtStrategyValue,
      expectedInvestmentValue,
      difference: roundMoney(expectedInvestmentValue - debtStrategyValue),
    });
  }

  return points;
}

function calculateOptionalBox3Scenario(input: {
  enabled: boolean;
  years: number;
  annualInvestmentReturn: number;
  monthlyContribution: number;
  taxYear?: number;
  hasFiscalPartner: boolean;
  box3Method: Box3Method;
  box3BankDeposits: number;
  box3InvestmentsAndOtherAssets: number;
  box3Debts: number;
  debtStrategyValue: number;
}): Box3ScenarioResult | undefined {
  if (!input.enabled) {
    return undefined;
  }

  const projectionYears = sanitizeYears(input.years);
  const usedYear = input.taxYear ?? DEFAULT_FINANCIAL_YEAR;
  const constants = getFinancialConstants(usedYear);
  const annualReturnRate = sanitizeDuoPercent(input.annualInvestmentReturn);
  const monthlyContribution = roundMoney(input.monthlyContribution);
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
      runningPortfolio = roundMoney(runningPortfolio * (1 + monthlyReturnRate));
    }

    const portfolioBeforeTax = roundMoney(runningPortfolio);
    const grossReturn = roundMoney(
      portfolioBeforeTax - startPortfolio - yearlyContribution,
    );

    const baseBox3 = calculateBox3Tax({
      year: usedYear,
      hasFiscalPartner: input.hasFiscalPartner,
      method: input.box3Method,
      actualAnnualReturnRate:
        input.box3Method === "actual" ? input.annualInvestmentReturn : undefined,
      bankDeposits: input.box3BankDeposits,
      investmentsAndOtherAssets: input.box3InvestmentsAndOtherAssets,
      debts: input.box3Debts,
    });
    const withScenarioBox3 = calculateBox3Tax({
      year: usedYear,
      hasFiscalPartner: input.hasFiscalPartner,
      method: input.box3Method,
      actualAnnualReturnRate:
        input.box3Method === "actual" ? input.annualInvestmentReturn : undefined,
      bankDeposits: input.box3BankDeposits,
      investmentsAndOtherAssets:
        input.box3InvestmentsAndOtherAssets + portfolioBeforeTax,
      debts: input.box3Debts,
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
    netInvestingOutcomeAfterBox3 - input.debtStrategyValue,
  );
  const taxFreeAllowance = input.hasFiscalPartner
    ? constants.box3.taxFreeAllowancePartners
    : constants.box3.taxFreeAllowanceSingle;

  return {
    year: usedYear,
    hasFiscalPartner: input.hasFiscalPartner,
    box3Method: input.box3Method,
    box3TaxWithoutScenario: lastBox3TaxWithoutScenario,
    box3TaxWithInvestingScenario: lastBox3TaxWithScenario,
    additionalBox3TaxIndicative,
    cumulativeAdditionalBox3TaxIndicative,
    netInvestingOutcomeAfterBox3,
    differenceRepaymentVsInvestingAfterBox3,
    taxFreeAllowance,
    box3TaxRate: constants.box3.taxRate,
    deemedReturnBankDepositsRate: constants.box3.deemedReturns.bankDeposits,
    deemedReturnInvestmentsRate: constants.box3.deemedReturns.investmentsAndOtherAssets,
    deemedReturnDebtsRate: constants.box3.deemedReturns.debts,
    usedBankDeposits: input.box3BankDeposits,
    usedInvestmentsAndOtherAssets: input.box3InvestmentsAndOtherAssets,
    usedDebts: input.box3Debts,
    yearlyBreakdown,
    warnings: [
      "Box 3-heffing is per jaar indicatief toegepast en direct uit de beleggingspot gehaald.",
      "Hierdoor groeit betaalde box 3 daarna niet verder mee.",
      ...(input.box3Method === "actual"
        ? [
            "Methode staat op werkelijk rendement. Dit blijft een vereenvoudigde indicatie en geen officiële aanslagberekening.",
          ]
        : [
            "Methode staat op forfaitair rendement. Forfaits en regelgeving kunnen wijzigen.",
          ]),
    ],
  };
}

export function calculateStudyDebtVsInvesting(
  input: CalculatorInput,
): CalculatorResult {
  const repaymentRule = input.repaymentRule;
  const remainingDebt = sanitizeDuoMoney(input.remainingDebt);
  const annualDebtRate = sanitizeDuoPercent(input.annualDebtRate);
  const remainingTermYears = sanitizePositiveYears(input.remainingTermYears, 1);
  const grossAnnualIncome = sanitizeDuoMoney(input.grossAnnualIncome);
  const partnerGrossAnnualIncome = sanitizeDuoMoney(input.partnerGrossAnnualIncome);
  const hasPartner = input.hasPartner ?? partnerGrossAnnualIncome > 0;
  const voluntaryExtraMonthly = sanitizeDuoMoney(input.voluntaryExtraMonthly);
  const annualInvestmentReturn = sanitizeDuoPercent(input.annualInvestmentReturn);

  const statutoryMonthlyPayment = calculateStatutoryDuoMonthlyPayment({
    repaymentRule,
    remainingDebt,
    annualInterestRate: annualDebtRate,
    remainingTermYears,
  });
  const incomeBased = calculateIndicativeIncomeBasedMonthlyPayment({
    grossAnnualIncome,
    partnerGrossAnnualIncome,
    hasPartner,
    repaymentRule,
    statutoryMonthlyPayment,
  });
  const requiredMonthlyPayment = roundMoney(
    Math.min(incomeBased.requiredMonthlyPayment, statutoryMonthlyPayment),
  );
  const totalMonthlyToDuo = roundMoney(requiredMonthlyPayment + voluntaryExtraMonthly);

  const payoffWithoutExtra = calculatePayoffDate({
    remainingDebt,
    annualInterestRate: annualDebtRate,
    remainingTermYears,
    repaymentRule,
    monthlyPayment: requiredMonthlyPayment,
  });
  const payoffWithExtra = calculatePayoffDate({
    remainingDebt,
    annualInterestRate: annualDebtRate,
    remainingTermYears,
    repaymentRule,
    monthlyPayment: totalMonthlyToDuo,
  });
  const monthsEarlierDebtFree = Math.max(
    payoffWithoutExtra.monthsRemaining - payoffWithExtra.monthsRemaining,
    0,
  );
  const yearsEarlierDebtFree = roundMoney(monthsEarlierDebtFree / 12);
  const effectiveHorizonMonths = Math.max(payoffWithExtra.monthsRemaining, 1);
  const effectiveHorizonYears = Math.max(Math.ceil(effectiveHorizonMonths / 12), 1);
  const totalVoluntaryAmount = roundMoney(
    voluntaryExtraMonthly * effectiveHorizonYears * 12,
  );

  const repaymentVsInvesting = calculateExtraRepaymentVsInvesting({
    remainingDebt,
    repaymentRule,
    annualDuoInterestRate: annualDebtRate,
    remainingTermYears,
    extraRepaymentAmount: totalVoluntaryAmount,
    monthlyExtraAmount: voluntaryExtraMonthly,
    expectedAnnualReturn: annualInvestmentReturn,
    investmentHorizonYears: effectiveHorizonYears,
  });

  const debtStrategyValue = roundMoney(
    repaymentVsInvesting.extraRepaymentUsed +
      repaymentVsInvesting.duoInterestSavedIndicative,
  );
  const expectedInvestmentValue = roundMoney(
    repaymentVsInvesting.netFutureValueIfInvested,
  );
  const difference = roundMoney(expectedInvestmentValue - debtStrategyValue);

  const projections = buildProjection({
    years: effectiveHorizonYears,
    remainingDebt,
    totalMonthlyToDuo,
    voluntaryExtraMonthly,
    annualDebtRate,
    annualInvestmentReturn,
  });

  const box3Scenario = calculateOptionalBox3Scenario({
    enabled: Boolean(input.box3EffectEnabled),
    years: effectiveHorizonYears,
    annualInvestmentReturn,
    monthlyContribution: voluntaryExtraMonthly,
    taxYear: sanitizeYear(input.taxYear),
    hasFiscalPartner: Boolean(input.hasFiscalPartner),
    box3Method: input.box3Method ?? "actual",
    box3BankDeposits: sanitizeDuoMoney(input.box3BankDeposits),
    box3InvestmentsAndOtherAssets: sanitizeDuoMoney(
      input.box3InvestmentsAndOtherAssets,
    ),
    box3Debts: sanitizeDuoMoney(input.box3Debts),
    debtStrategyValue,
  });

  const warnings = [
    ...incomeBased.warnings,
    ...repaymentVsInvesting.warnings,
    "Wettelijk maandbedrag is hier annuïtair berekend en niet handmatig ingevuld.",
    "Voor hypotheekgesprekken is dit wettelijke/annuïtaire bedrag doorgaans relevanter dan je vrijwillige extra aflossing.",
    "Alles boven je verplichte DUO-bedrag behandelen we als vrijwillige keuzeruimte.",
  ].filter((warning, index, all) => all.indexOf(warning) === index);

  return {
    effectiveHorizonMonths,
    effectiveHorizonYears,
    duoContext: {
      statutoryMonthlyPayment,
      incomeBasedMonthlyPayment: incomeBased.incomeBasedMonthlyPayment,
      requiredMonthlyPayment,
      voluntaryExtraMonthly,
      totalMonthlyToDuo,
      mortgageRelevantMonthlyPayment: statutoryMonthlyPayment,
      payoffWithoutExtraDate: payoffWithoutExtra.payoffDate,
      payoffWithExtraDate: payoffWithExtra.payoffDate,
      monthsEarlierDebtFree,
      yearsEarlierDebtFree,
      annualIncomeUsed: incomeBased.annualIncomeUsed,
      amountAboveAllowance: incomeBased.amountAboveAllowance,
      warnings: [...payoffWithoutExtra.warnings, ...payoffWithExtra.warnings],
    },
    totalVoluntaryAmount,
    indicativeInterestSavings: roundMoney(repaymentVsInvesting.duoInterestSavedIndicative),
    expectedInvestmentValue,
    debtStrategyValue,
    difference,
    projections,
    warnings,
    box3Scenario,
  };
}
