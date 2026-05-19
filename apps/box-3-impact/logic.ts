import { getDefaultFinancialYear, getFinancialConstants } from "@/lib/financial-constants";
import { calculateBox3Tax } from "@/lib/tax";
import type { Box3Method } from "@/lib/tax";

export type ContributionFrequency = "monthly" | "yearly";

export type Box3ImpactInput = {
  year?: number;
  hasFiscalPartner: boolean;
  method: Box3Method;
  bankDeposits: number;
  investmentsAndOtherAssets: number;
  debts: number;
  expectedSavingsReturn?: number;
  expectedInvestmentReturn?: number;
  horizonYears?: number;
  contributionFrequency?: ContributionFrequency;
  savingsContribution?: number;
  investmentsContribution?: number;
};

export type Box3HorizonPoint = {
  yearIndex: number;
  calendarYear: number;
  startBankDeposits: number;
  startInvestments: number;
  startNetWorth: number;
  startNetWorthWithoutBox3: number;
  contributionSavings: number;
  contributionInvestments: number;
  grossReturnSavings: number;
  grossReturnInvestments: number;
  endBankDepositsBeforeTax: number;
  endInvestmentsBeforeTax: number;
  endNetWorthBeforeTax: number;
  box3Tax: number;
  endNetWorthAfterTax: number;
  endNetWorthWithoutBox3: number;
  wealthGapVsNoBox3: number;
  cumulativeBox3Tax: number;
};

export type Box3ImpactResult = {
  year: number;
  method: Box3Method;
  assetsTotal: number;
  debtsTotal: number;
  netWorth: number;
  taxFreeAllowance: number;
  taxableBase: number;
  deemedReturnBankDeposits: number;
  deemedReturnInvestments: number;
  deemedReturnDebts: number;
  totalDeemedReturn: number;
  box3Tax: number;
  effectiveTaxRateOnNetWorth: number;
  netExpectedReturnAfterBox3?: number;
  expectedGrossReturn?: number;
  horizon: {
    years: number;
    contributionFrequency: ContributionFrequency;
    yearlySavingsContribution: number;
    yearlyInvestmentsContribution: number;
    points: Box3HorizonPoint[];
    totalBox3TaxOverHorizon: number;
    endNetWorthAfterTax: number;
    endNetWorthWithoutBox3: number;
    wealthGapVsNoBox3: number;
  };
  assumptions: {
    sourceLabel: string;
    lastChecked: string;
    status: string;
    taxRate: number;
    deemedReturnBankDepositsRate: number;
    deemedReturnInvestmentsRate: number;
    deemedReturnDebtsRate: number;
  };
  warnings: string[];
};

function sanitizeMoney(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(value as number, 0);
}

function sanitizePercent(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return undefined;
  }
  return Math.min(Math.max(value as number, 0), 100);
}

function sanitizeYear(value?: number) {
  if (!Number.isFinite(value)) {
    return getDefaultFinancialYear();
  }
  const rounded = Math.round(value as number);
  if (rounded < 2000 || rounded > 2200) {
    return getDefaultFinancialYear();
  }
  return rounded;
}

function sanitizeHorizonYears(value?: number) {
  if (!Number.isFinite(value)) {
    return 10;
  }
  return Math.min(Math.max(Math.round(value as number), 1), 60);
}

function roundMoney(value: number) {
  return Math.round(Math.max(value, 0) * 100) / 100;
}

function toYearlyContribution(
  value: number | undefined,
  frequency: ContributionFrequency,
) {
  const safeValue = sanitizeMoney(value);
  return roundMoney(frequency === "monthly" ? safeValue * 12 : safeValue);
}

function getActualReturnInput(
  savingsReturn: number | undefined,
  investmentReturn: number | undefined,
) {
  if (savingsReturn === undefined && investmentReturn === undefined) {
    return null;
  }

  return {
    savingsReturn: savingsReturn ?? 0,
    investmentReturn: investmentReturn ?? 0,
  };
}

function getBaseActualReturnRate(
  bankDeposits: number,
  investmentsAndOtherAssets: number,
  savingsReturn: number,
  investmentReturn: number,
) {
  const assetsTotal = bankDeposits + investmentsAndOtherAssets;
  if (assetsTotal <= 0) {
    return 0;
  }

  const weightedReturn =
    (bankDeposits * savingsReturn + investmentsAndOtherAssets * investmentReturn) /
    assetsTotal;
  return roundMoney(Math.max(weightedReturn, 0));
}

function calculateHorizonPoints(input: {
  baseYear: number;
  method: Box3Method;
  hasFiscalPartner: boolean;
  debts: number;
  bankDeposits: number;
  investmentsAndOtherAssets: number;
  expectedSavingsReturn: number;
  expectedInvestmentReturn: number;
  years: number;
  yearlySavingsContribution: number;
  yearlyInvestmentsContribution: number;
}) {
  const points: Box3HorizonPoint[] = [];
  let bank = roundMoney(input.bankDeposits);
  let investments = roundMoney(input.investmentsAndOtherAssets);
  let bankWithoutBox3 = roundMoney(input.bankDeposits);
  let investmentsWithoutBox3 = roundMoney(input.investmentsAndOtherAssets);
  const debts = roundMoney(input.debts);
  let cumulativeBox3Tax = 0;

  for (let yearIndex = 1; yearIndex <= input.years; yearIndex += 1) {
    const startBankDeposits = roundMoney(bank);
    const startInvestments = roundMoney(investments);
    const startNetWorth = roundMoney(Math.max(startBankDeposits + startInvestments - debts, 0));
    const startNetWorthWithoutBox3 = roundMoney(
      Math.max(bankWithoutBox3 + investmentsWithoutBox3 - debts, 0),
    );

    const contributionSavings = roundMoney(input.yearlySavingsContribution);
    const contributionInvestments = roundMoney(input.yearlyInvestmentsContribution);

    const grossReturnSavings = roundMoney(
      (startBankDeposits + contributionSavings) * (input.expectedSavingsReturn / 100),
    );
    const grossReturnInvestments = roundMoney(
      (startInvestments + contributionInvestments) * (input.expectedInvestmentReturn / 100),
    );

    const endBankDepositsBeforeTax = roundMoney(
      startBankDeposits + contributionSavings + grossReturnSavings,
    );
    const endInvestmentsBeforeTax = roundMoney(
      startInvestments + contributionInvestments + grossReturnInvestments,
    );
    const endNetWorthBeforeTax = roundMoney(
      Math.max(endBankDepositsBeforeTax + endInvestmentsBeforeTax - debts, 0),
    );

    const assetsBeforeTax = roundMoney(endBankDepositsBeforeTax + endInvestmentsBeforeTax);
    const blendedActualReturn =
      assetsBeforeTax > 0
        ? roundMoney(
            ((grossReturnSavings + grossReturnInvestments) / assetsBeforeTax) * 100,
          )
        : 0;

    const box3Year = calculateBox3Tax({
      year: input.baseYear + yearIndex - 1,
      method: input.method,
      hasFiscalPartner: input.hasFiscalPartner,
      bankDeposits: endBankDepositsBeforeTax,
      investmentsAndOtherAssets: endInvestmentsBeforeTax,
      debts,
      actualAnnualReturnRate:
        input.method === "actual" ? blendedActualReturn : undefined,
    });

    const box3Tax = roundMoney(box3Year.box3Tax);
    const totalAssetsAfterTax = roundMoney(Math.max(assetsBeforeTax - box3Tax, 0));
    const assetsSplitFactor = assetsBeforeTax > 0 ? totalAssetsAfterTax / assetsBeforeTax : 0;
    bank = roundMoney(endBankDepositsBeforeTax * assetsSplitFactor);
    investments = roundMoney(endInvestmentsBeforeTax * assetsSplitFactor);

    const endNetWorthAfterTax = roundMoney(Math.max(totalAssetsAfterTax - debts, 0));
    const grossReturnSavingsWithoutBox3 = roundMoney(
      (bankWithoutBox3 + contributionSavings) * (input.expectedSavingsReturn / 100),
    );
    const grossReturnInvestmentsWithoutBox3 = roundMoney(
      (investmentsWithoutBox3 + contributionInvestments) * (input.expectedInvestmentReturn / 100),
    );
    bankWithoutBox3 = roundMoney(
      bankWithoutBox3 + contributionSavings + grossReturnSavingsWithoutBox3,
    );
    investmentsWithoutBox3 = roundMoney(
      investmentsWithoutBox3 + contributionInvestments + grossReturnInvestmentsWithoutBox3,
    );
    const endNetWorthWithoutBox3 = roundMoney(
      Math.max(bankWithoutBox3 + investmentsWithoutBox3 - debts, 0),
    );
    const wealthGapVsNoBox3 = roundMoney(
      Math.max(endNetWorthWithoutBox3 - endNetWorthAfterTax, 0),
    );
    cumulativeBox3Tax = roundMoney(cumulativeBox3Tax + box3Tax);

    points.push({
      yearIndex,
      calendarYear: input.baseYear + yearIndex - 1,
      startBankDeposits,
      startInvestments,
      startNetWorth,
      startNetWorthWithoutBox3,
      contributionSavings,
      contributionInvestments,
      grossReturnSavings,
      grossReturnInvestments,
      endBankDepositsBeforeTax,
      endInvestmentsBeforeTax,
      endNetWorthBeforeTax,
      box3Tax,
      endNetWorthAfterTax,
      endNetWorthWithoutBox3,
      wealthGapVsNoBox3,
      cumulativeBox3Tax,
    });
  }

  return points;
}

export function calculateBox3ImpactScenario(input: Box3ImpactInput): Box3ImpactResult {
  const year = sanitizeYear(input.year);
  const method = input.method ?? "actual";
  const bankDeposits = sanitizeMoney(input.bankDeposits);
  const investmentsAndOtherAssets = sanitizeMoney(input.investmentsAndOtherAssets);
  const debts = sanitizeMoney(input.debts);
  const expectedSavingsReturnRaw = sanitizePercent(input.expectedSavingsReturn);
  const expectedInvestmentReturnRaw = sanitizePercent(input.expectedInvestmentReturn);
  const expectedReturnInput = getActualReturnInput(
    expectedSavingsReturnRaw,
    expectedInvestmentReturnRaw,
  );
  const expectedSavingsReturn = expectedReturnInput?.savingsReturn ?? 0;
  const expectedInvestmentReturn = expectedReturnInput?.investmentReturn ?? 0;
  const contributionFrequency = input.contributionFrequency ?? "monthly";
  const horizonYears = sanitizeHorizonYears(input.horizonYears);
  const yearlySavingsContribution = toYearlyContribution(
    input.savingsContribution,
    contributionFrequency,
  );
  const yearlyInvestmentsContribution = toYearlyContribution(
    input.investmentsContribution,
    contributionFrequency,
  );

  const base = calculateBox3Tax({
    year,
    method,
    hasFiscalPartner: Boolean(input.hasFiscalPartner),
    bankDeposits,
    investmentsAndOtherAssets,
    debts,
    actualAnnualReturnRate:
      method === "actual" && expectedReturnInput
        ? getBaseActualReturnRate(
            bankDeposits,
            investmentsAndOtherAssets,
            expectedSavingsReturn,
            expectedInvestmentReturn,
          )
        : undefined,
  });

  const constants = getFinancialConstants(year).box3;
  const netWorth = roundMoney(Math.max(base.assetsTotal - base.debtsTotal, 0));
  const totalDeemedReturn = roundMoney(
    Math.max(
      base.deemedReturnBankDeposits +
        base.deemedReturnInvestments -
        base.deemedReturnDebts,
      0,
    ),
  );

  const expectedGrossReturn = expectedReturnInput
    ? roundMoney(
        bankDeposits * (expectedSavingsReturn / 100) +
          investmentsAndOtherAssets * (expectedInvestmentReturn / 100),
      )
    : undefined;
  const netExpectedReturnAfterBox3 =
    expectedGrossReturn === undefined
      ? undefined
      : roundMoney(Math.max(expectedGrossReturn - base.box3Tax, 0));

  const points = calculateHorizonPoints({
    baseYear: year,
    method,
    hasFiscalPartner: Boolean(input.hasFiscalPartner),
    debts,
    bankDeposits,
    investmentsAndOtherAssets,
    expectedSavingsReturn,
    expectedInvestmentReturn,
    years: horizonYears,
    yearlySavingsContribution,
    yearlyInvestmentsContribution,
  });

  return {
    year: base.year,
    method: base.method,
    assetsTotal: base.assetsTotal,
    debtsTotal: base.debtsTotal,
    netWorth,
    taxFreeAllowance: base.taxFreeAllowance,
    taxableBase: base.taxableBase,
    deemedReturnBankDeposits: base.deemedReturnBankDeposits,
    deemedReturnInvestments: base.deemedReturnInvestments,
    deemedReturnDebts: base.deemedReturnDebts,
    totalDeemedReturn,
    box3Tax: base.box3Tax,
    effectiveTaxRateOnNetWorth: base.effectiveTaxRateOnNetWorth,
    expectedGrossReturn,
    netExpectedReturnAfterBox3,
    horizon: {
      years: horizonYears,
      contributionFrequency,
      yearlySavingsContribution,
      yearlyInvestmentsContribution,
      points,
      totalBox3TaxOverHorizon: points[points.length - 1]?.cumulativeBox3Tax ?? 0,
      endNetWorthAfterTax: points[points.length - 1]?.endNetWorthAfterTax ?? netWorth,
      endNetWorthWithoutBox3:
        points[points.length - 1]?.endNetWorthWithoutBox3 ?? netWorth,
      wealthGapVsNoBox3: points[points.length - 1]?.wealthGapVsNoBox3 ?? 0,
    },
    assumptions: {
      sourceLabel: constants.meta.sourceLabel,
      lastChecked: constants.meta.lastChecked,
      status: constants.meta.status,
      taxRate: constants.taxRate,
      deemedReturnBankDepositsRate: constants.deemedReturns.bankDeposits,
      deemedReturnInvestmentsRate: constants.deemedReturns.investmentsAndOtherAssets,
      deemedReturnDebtsRate: constants.deemedReturns.debts,
    },
    warnings: [
      ...base.warnings,
      "Horizon-simulatie is indicatief; regels, forfaits en persoonlijke fiscale situatie kunnen wijzigen.",
      "Jaarlijkse box 3-heffing wordt in deze simulatie ieder jaar betaald en gaat niet mee in volgende compoundjaren.",
      "Deze tool is indicatief en geen officiële aangifteberekening.",
    ],
  };
}
