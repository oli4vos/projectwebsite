import {
  DEFAULT_FINANCIAL_YEAR,
  FINANCIAL_CONSTANTS_BY_YEAR,
} from "@/lib/financial-constants/years";
import {
  getMortgageFinancingLoadPercentage,
  getMortgageFinancingLoadTable,
} from "@/lib/financial-constants/mortgage-financing-load";
import type {
  AnnualFinancialConstants,
  GrossUpFactorBand,
  RepaymentRuleKey,
  MortgageFinancingLoadLookupInput,
} from "@/lib/financial-constants/types";

function sanitizeYear(year?: number) {
  if (year === undefined || year === null || !Number.isFinite(year)) {
    return DEFAULT_FINANCIAL_YEAR;
  }

  return Math.round(year);
}

export function getAvailableFinancialYears() {
  return Object.keys(FINANCIAL_CONSTANTS_BY_YEAR)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
    .sort((left, right) => left - right);
}

export function getDefaultFinancialYear() {
  return DEFAULT_FINANCIAL_YEAR;
}

export function getFinancialConstants(year?: number): AnnualFinancialConstants {
  const safeYear = sanitizeYear(year);
  return (
    FINANCIAL_CONSTANTS_BY_YEAR[safeYear] ??
    FINANCIAL_CONSTANTS_BY_YEAR[DEFAULT_FINANCIAL_YEAR]
  );
}

export function getDuoRateForRule(rule: RepaymentRuleKey, year?: number) {
  const constants = getFinancialConstants(year);
  return constants.duo.rates[rule] ?? constants.duo.rates.UNKNOWN;
}

export function getDuoDefaultTermForRule(rule: RepaymentRuleKey, year?: number) {
  const constants = getFinancialConstants(year);
  return constants.duo.defaultTerms[rule] ?? constants.duo.defaultTerms.UNKNOWN;
}

export function getDuoIncomeBasedRuleForRepaymentRule(
  rule: RepaymentRuleKey,
  year?: number,
) {
  const constants = getFinancialConstants(year);
  return (
    constants.duo.incomeBasedRules[rule] ??
    constants.duo.incomeBasedRules.UNKNOWN
  );
}

export function getDuoBorrowingLimits(year?: number) {
  return getFinancialConstants(year).duo.borrowingLimits;
}

export function getStudentDebtGrossUpFactor(
  mortgageRate: number,
  year?: number,
): GrossUpFactorBand {
  const constants = getFinancialConstants(year);
  const safeRate = Number.isFinite(mortgageRate) ? Math.max(mortgageRate, 0) : 0;

  const match = constants.mortgage.studentDebtGrossUpFactors.find((band) => {
    const maxRate = band.maxRate ?? Number.POSITIVE_INFINITY;
    return safeRate >= band.minRate && safeRate < maxRate;
  });

  return (
    match ??
    constants.mortgage.studentDebtGrossUpFactors[
      constants.mortgage.studentDebtGrossUpFactors.length - 1
    ]
  );
}

export function getBox1Brackets(year?: number) {
  return getFinancialConstants(year).box1.brackets;
}

export function getBox3Constants(year?: number) {
  return getFinancialConstants(year).box3;
}

export function getIndicativeIncomeHousingCostRatio(year?: number) {
  return getFinancialConstants(year).mortgage.indicativeIncomeHousingCostRatio;
}

export function getMortgageFinancingLoadRatio(input: MortgageFinancingLoadLookupInput) {
  return getMortgageFinancingLoadPercentage(input);
}

export type {
  AnnualFinancialConstants,
  AssumptionMeta,
  AssumptionStatus,
  DuoIncomeBasedRule,
  GrossUpFactorBand,
  MortgageFinancingLoadData,
  MortgageFinancingLoadAgeGroup,
  MortgageFinancingLoadLookupInput,
  MortgageFinancingLoadRateBand,
  MortgageFinancingLoadRow,
  MortgageFinancingLoadTable,
  RepaymentRuleKey,
  SourceTier,
} from "@/lib/financial-constants/types";
export { getMortgageFinancingLoadTable };
