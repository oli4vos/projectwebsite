import { getDefaultFinancialYear } from "@/lib/financial-constants";
import { calculateBox3Tax } from "@/lib/tax";
import type { RiskProfile } from "@/lib/user-profile";

export type FireNaBelastingInput = {
  currentNetWorth?: number;
  currentSavings?: number;
  currentInvestments?: number;
  monthlyContribution?: number;
  yearlyContribution?: number;
  expectedAnnualReturn?: number;
  annualInflation?: number;
  includeBox3Effect?: boolean;
  taxYear?: number;
  hasFiscalPartner?: boolean;
  annualExpensesNow?: number;
  withdrawalRate?: number;
  horizonYears?: number;
  riskProfile?: RiskProfile;
  currentAge?: number;
};

export type FireProjectionPoint = {
  year: number;
  age?: number;
  assets: number;
  contributions: number;
  growth: number;
  box3Tax: number;
  fireTarget: number;
  isFireReached: boolean;
};

export type FireNaBelastingResult = {
  taxYear: number;
  fireNumberToday: number;
  yearsToFire: number | null;
  fireYear: number | null;
  fireReachedWithinHorizon: boolean;
  endAssetsAtHorizon: number;
  annualContributionUsed: number;
  requiredMonthlyContributionToReachWithinHorizon: number | null;
  totalBox3TaxPaid: number;
  projection: FireProjectionPoint[];
  warnings: string[];
  assumptions: {
    includeBox3Effect: boolean;
    expectedAnnualReturn: number;
    annualInflation: number;
    withdrawalRate: number;
    horizonYears: number;
  };
};

type SimulateInput = {
  startSavings: number;
  startInvestments: number;
  annualContribution: number;
  expectedAnnualReturn: number;
  annualInflation: number;
  includeBox3Effect: boolean;
  taxYear: number;
  hasFiscalPartner: boolean;
  annualExpensesNow: number;
  withdrawalRate: number;
  horizonYears: number;
  currentAge?: number;
};

type SimulateResult = {
  projection: FireProjectionPoint[];
  fireReachedAtYear: number | null;
  endAssetsAtHorizon: number;
  totalBox3TaxPaid: number;
};

function sanitizeMoney(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(value as number, 0);
}

function sanitizePercent(value: number | undefined, fallback = 0) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(value as number, 0), 100);
}

function sanitizeYears(value: number | undefined, fallback = 30) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(Math.round(value as number), 1), 60);
}

function sanitizeTaxYear(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return getDefaultFinancialYear();
  }
  const rounded = Math.round(value as number);
  if (rounded < 2000 || rounded > 2200) {
    return getDefaultFinancialYear();
  }
  return rounded;
}

function roundMoney(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(Math.max(value, 0) * 100) / 100;
}

function resolveStartingBuckets(input: {
  currentNetWorth: number;
  currentSavings: number;
  currentInvestments: number;
}) {
  const savings = sanitizeMoney(input.currentSavings);
  let investments = sanitizeMoney(input.currentInvestments);
  const statedSplit = savings + investments;
  const statedTotal = sanitizeMoney(input.currentNetWorth);

  if (statedSplit <= 0 && statedTotal > 0) {
    investments = statedTotal;
  } else if (statedTotal > statedSplit) {
    investments += statedTotal - statedSplit;
  }

  return { savings, investments };
}

function getFireTarget(annualExpensesNow: number, withdrawalRate: number, year: number, annualInflation: number) {
  const inflatedExpenses = annualExpensesNow * (1 + annualInflation / 100) ** year;
  const safeWithdrawalFraction = withdrawalRate / 100;
  if (safeWithdrawalFraction <= 0) {
    return Number.POSITIVE_INFINITY;
  }
  return roundMoney(inflatedExpenses / safeWithdrawalFraction);
}

function simulateProjection(input: SimulateInput): SimulateResult {
  const projection: FireProjectionPoint[] = [];
  let fireReachedAtYear: number | null = null;
  let savings = input.startSavings;
  let investments = input.startInvestments;
  let cumulativeBox3Tax = 0;

  const initialAssets = roundMoney(savings + investments);
  const initialTarget = getFireTarget(
    input.annualExpensesNow,
    input.withdrawalRate,
    0,
    input.annualInflation,
  );
  const initialReached = initialAssets >= initialTarget;

  projection.push({
    year: 0,
    age:
      Number.isFinite(input.currentAge) && input.currentAge !== undefined
        ? Math.round(input.currentAge)
        : undefined,
    assets: initialAssets,
    contributions: 0,
    growth: 0,
    box3Tax: 0,
    fireTarget: initialTarget,
    isFireReached: initialReached,
  });

  if (initialReached) {
    fireReachedAtYear = 0;
  }

  for (let year = 1; year <= input.horizonYears; year += 1) {
    const startAssets = savings + investments;
    const growth = startAssets * (input.expectedAnnualReturn / 100);
    savings = savings + savings * (input.expectedAnnualReturn / 100);
    investments = investments + investments * (input.expectedAnnualReturn / 100);
    investments += input.annualContribution;

    let box3Tax = 0;
    if (input.includeBox3Effect) {
      const box3 = calculateBox3Tax({
        year: input.taxYear,
        hasFiscalPartner: input.hasFiscalPartner,
        method: "actual",
        actualAnnualReturnRate: input.expectedAnnualReturn,
        bankDeposits: savings,
        investmentsAndOtherAssets: investments,
        debts: 0,
      });
      box3Tax = roundMoney(box3.box3Tax);
      const beforeTaxAssets = savings + investments;
      if (beforeTaxAssets > 0 && box3Tax > 0) {
        const savingsPart = box3Tax * (savings / beforeTaxAssets);
        const investmentsPart = box3Tax * (investments / beforeTaxAssets);
        savings = Math.max(savings - savingsPart, 0);
        investments = Math.max(investments - investmentsPart, 0);
      }
      cumulativeBox3Tax += box3Tax;
    }

    const assets = roundMoney(savings + investments);
    const fireTarget = getFireTarget(
      input.annualExpensesNow,
      input.withdrawalRate,
      year,
      input.annualInflation,
    );
    const isFireReached = assets >= fireTarget;
    if (isFireReached && fireReachedAtYear === null) {
      fireReachedAtYear = year;
    }

    projection.push({
      year,
      age:
        Number.isFinite(input.currentAge) && input.currentAge !== undefined
          ? Math.round(input.currentAge) + year
          : undefined,
      assets,
      contributions: roundMoney(input.annualContribution),
      growth: roundMoney(growth),
      box3Tax: roundMoney(box3Tax),
      fireTarget,
      isFireReached,
    });
  }

  return {
    projection,
    fireReachedAtYear,
    endAssetsAtHorizon: projection.at(-1)?.assets ?? 0,
    totalBox3TaxPaid: roundMoney(cumulativeBox3Tax),
  };
}

function findRequiredMonthlyContribution(input: Omit<SimulateInput, "annualContribution">) {
  const reachedWithZero = simulateProjection({ ...input, annualContribution: 0 });
  if (reachedWithZero.fireReachedAtYear !== null) {
    return 0;
  }

  let high = 12000;
  let highReached = false;
  for (let i = 0; i < 12; i += 1) {
    const attempt = simulateProjection({
      ...input,
      annualContribution: high * 12,
    });
    if (attempt.fireReachedAtYear !== null) {
      highReached = true;
      break;
    }
    high *= 2;
  }

  if (!highReached) {
    return null;
  }

  let low = 0;
  for (let i = 0; i < 35; i += 1) {
    const mid = (low + high) / 2;
    const attempt = simulateProjection({
      ...input,
      annualContribution: mid * 12,
    });
    if (attempt.fireReachedAtYear !== null) {
      high = mid;
    } else {
      low = mid;
    }
  }

  return roundMoney(high);
}

export function calculateFireNaBelasting(input: FireNaBelastingInput): FireNaBelastingResult {
  const taxYear = sanitizeTaxYear(input.taxYear);
  const expectedAnnualReturn = sanitizePercent(input.expectedAnnualReturn, 5);
  const annualInflation = sanitizePercent(input.annualInflation, 2);
  const withdrawalRate = sanitizePercent(input.withdrawalRate, 4);
  const horizonYears = sanitizeYears(input.horizonYears, 40);
  const annualContribution =
    sanitizeMoney(input.yearlyContribution) + sanitizeMoney(input.monthlyContribution) * 12;
  const annualExpensesNow = sanitizeMoney(input.annualExpensesNow);
  const includeBox3Effect = Boolean(input.includeBox3Effect);
  const hasFiscalPartner = Boolean(input.hasFiscalPartner);

  const startingBuckets = resolveStartingBuckets({
    currentNetWorth: sanitizeMoney(input.currentNetWorth),
    currentSavings: sanitizeMoney(input.currentSavings),
    currentInvestments: sanitizeMoney(input.currentInvestments),
  });

  const warnings: string[] = [
    "Dit is een educatieve FIRE-indicatie en geen persoonlijk financieel advies.",
    "Rendement, inflatie en belastingregels kunnen afwijken van je werkelijke situatie.",
  ];

  if (withdrawalRate <= 0) {
    warnings.push(
      "Withdrawal rate staat op 0%. Daardoor kunnen we geen valide FIRE-doel berekenen.",
    );
  }

  if (!includeBox3Effect) {
    warnings.push("Box 3 staat uit; uitkomst kan optimistischer zijn dan je netto werkelijkheid.");
  }

  const fireNumberToday = getFireTarget(annualExpensesNow, withdrawalRate, 0, annualInflation);
  const simulation = simulateProjection({
    startSavings: startingBuckets.savings,
    startInvestments: startingBuckets.investments,
    annualContribution,
    expectedAnnualReturn,
    annualInflation,
    includeBox3Effect,
    taxYear,
    hasFiscalPartner,
    annualExpensesNow,
    withdrawalRate,
    horizonYears,
    currentAge: Number.isFinite(input.currentAge) ? input.currentAge : undefined,
  });

  if (simulation.fireReachedAtYear === null) {
    warnings.push("Binnen de gekozen horizon wordt FIRE met deze aannames nog niet gehaald.");
  }

  const requiredMonthlyContributionToReachWithinHorizon =
    simulation.fireReachedAtYear === null && withdrawalRate > 0
      ? findRequiredMonthlyContribution({
          startSavings: startingBuckets.savings,
          startInvestments: startingBuckets.investments,
          expectedAnnualReturn,
          annualInflation,
          includeBox3Effect,
          taxYear,
          hasFiscalPartner,
          annualExpensesNow,
          withdrawalRate,
          horizonYears,
          currentAge: Number.isFinite(input.currentAge) ? input.currentAge : undefined,
        })
      : 0;

  return {
    taxYear,
    fireNumberToday,
    yearsToFire: simulation.fireReachedAtYear,
    fireYear:
      simulation.fireReachedAtYear !== null ? taxYear + simulation.fireReachedAtYear : null,
    fireReachedWithinHorizon: simulation.fireReachedAtYear !== null,
    endAssetsAtHorizon: simulation.endAssetsAtHorizon,
    annualContributionUsed: roundMoney(annualContribution),
    requiredMonthlyContributionToReachWithinHorizon,
    totalBox3TaxPaid: simulation.totalBox3TaxPaid,
    projection: simulation.projection,
    warnings,
    assumptions: {
      includeBox3Effect,
      expectedAnnualReturn,
      annualInflation,
      withdrawalRate,
      horizonYears,
    },
  };
}
