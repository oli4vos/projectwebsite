import { calculateMortgageInterestDeduction } from "@/lib/tax";
import { getDefaultFinancialYear } from "@/lib/financial-constants";

export type CalculatorInput = {
  taxYear?: number;
  taxableIncome: number;
  remainingMortgageDebt: number;
  mortgageRatePercent: number;
  annualMortgageInterestOverride?: number;
  horizonYears: number;
};

export type TimelinePoint = {
  yearOffset: number;
  calendarYear: number;
  grossInterest: number;
  netInterestWithDeduction: number;
  netInterestWithoutDeduction: number;
  annualDifference: number;
  cumulativeDifference: number;
};

export type CalculatorResult = {
  startYear: number;
  horizonYears: number;
  annualGrossInterestUsed: number;
  annualTaxBenefitNow: number;
  annualNetCostWithDeduction: number;
  annualNetCostWithoutDeduction: number;
  annualDifference: number;
  cumulativeDifference: number;
  appliedDeductionRate: number;
  timeline: TimelinePoint[];
  warnings: string[];
};

function sanitizeMoney(value?: number) {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.max(value, 0);
}

function sanitizePercent(value?: number) {
  if (value === undefined || !Number.isFinite(value)) return 0;
  return Math.max(value, 0);
}

function sanitizeYear(value?: number) {
  if (value === undefined || !Number.isFinite(value)) {
    return getDefaultFinancialYear();
  }
  const rounded = Math.round(value);
  if (rounded < 2000 || rounded > 2200) {
    return getDefaultFinancialYear();
  }
  return rounded;
}

function sanitizeHorizon(value?: number) {
  if (value === undefined || !Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(Math.round(value), 40));
}

function roundMoney(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 100) / 100;
}

export function calculateMortgageDeductionAbolitionImpact(
  input: CalculatorInput,
): CalculatorResult {
  const startYear = sanitizeYear(input.taxYear);
  const horizonYears = sanitizeHorizon(input.horizonYears);
  const taxableIncome = sanitizeMoney(input.taxableIncome);
  const remainingMortgageDebt = sanitizeMoney(input.remainingMortgageDebt);
  const mortgageRatePercent = sanitizePercent(input.mortgageRatePercent);
  const annualInterestFromDebt = roundMoney(
    remainingMortgageDebt * (mortgageRatePercent / 100),
  );
  const annualGrossInterestUsed = roundMoney(
    input.annualMortgageInterestOverride !== undefined
      ? sanitizeMoney(input.annualMortgageInterestOverride)
      : annualInterestFromDebt,
  );

  const timeline: TimelinePoint[] = [];
  let cumulativeDifference = 0;
  let appliedDeductionRate = 0;
  let annualTaxBenefitNow = 0;
  let annualNetCostWithDeduction = annualGrossInterestUsed;
  let annualNetCostWithoutDeduction = annualGrossInterestUsed;
  let annualDifference = 0;

  for (let yearOffset = 0; yearOffset < horizonYears; yearOffset += 1) {
    const calendarYear = startYear + yearOffset;
    const deduction = calculateMortgageInterestDeduction({
      year: calendarYear,
      taxableIncome,
      annualMortgageInterest: annualGrossInterestUsed,
    });

    const netWith = roundMoney(deduction.netInterestCost);
    const netWithout = roundMoney(annualGrossInterestUsed);
    const diff = roundMoney(netWithout - netWith);
    cumulativeDifference = roundMoney(cumulativeDifference + diff);

    if (yearOffset === 0) {
      appliedDeductionRate = deduction.appliedDeductionRate;
      annualTaxBenefitNow = deduction.estimatedTaxBenefit;
      annualNetCostWithDeduction = netWith;
      annualNetCostWithoutDeduction = netWithout;
      annualDifference = diff;
    }

    timeline.push({
      yearOffset: yearOffset + 1,
      calendarYear,
      grossInterest: annualGrossInterestUsed,
      netInterestWithDeduction: netWith,
      netInterestWithoutDeduction: netWithout,
      annualDifference: diff,
      cumulativeDifference,
    });
  }

  return {
    startYear,
    horizonYears,
    annualGrossInterestUsed,
    annualTaxBenefitNow,
    annualNetCostWithDeduction,
    annualNetCostWithoutDeduction,
    annualDifference,
    cumulativeDifference,
    appliedDeductionRate,
    timeline,
    warnings: [
      "Dit is een indicatieve scenariovergelijking en geen officiële aangifteberekening.",
      "We gaan in dit model uit van een gelijkblijvende jaarlijkse bruto rente over de gekozen horizon.",
      "Werkelijke netto impact hangt ook af van aflossing, rentevaste periodes en persoonlijke fiscale omstandigheden.",
    ],
  };
}
