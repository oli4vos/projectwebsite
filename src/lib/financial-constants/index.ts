import {
  DEFAULT_FINANCIAL_YEAR,
  FINANCIAL_CONSTANTS_BY_YEAR,
} from "@/lib/financial-constants/years";
import {
  SOURCE_DATASET_REGISTRY,
  SOURCE_DATA_REFERENCE_DATE,
  getDatasetForDate as getSourceDatasetForDate,
  getDatasetFreshness as getSourceDatasetFreshness,
} from "@/lib/financial-constants/source-datasets";
import {
  DUO_RATE_HISTORY_META,
  getAvailableDuoRateYears,
  getDuoHistoricalRateForRule,
  getDuoHistoricalRateYearForRule,
  getDuoRateYearMetadata,
  formatDuoRateYearLabel,
  isSupportedDuoRateYear,
} from "@/lib/financial-constants/duo-rate-history";
import {
  getMortgageFinancingLoadPercentage,
  getMortgageFinancingLoadTable,
} from "@/lib/financial-constants/mortgage-financing-load";
export {
  SOURCE_DATA_REFERENCE_DATE,
  SOURCE_DATASET_REGISTRY,
  getActiveDataset,
  getDatasetForDate,
  getDatasetFreshness,
  getSourceReferences,
  listDatasets,
  validateDatasetRegistry,
  validateSourceDatasetMeta,
} from "@/lib/financial-constants/source-datasets";
export {
  validateFinancialInputLimit,
  validateFinancialInputLimits,
} from "@/lib/financial-constants/input-limits";
export type {
  SourceValidationIssue,
  SourceValidationResult,
} from "@/lib/financial-constants/source-datasets";
export type {
  FinancialInputLimit,
  FinancialInputLimitKind,
  FinancialInputLimitSeverity,
  FinancialInputLimitValidationResult,
  FinancialInputLimitValidationStatus,
} from "@/lib/financial-constants/input-limits";
import type {
  AnnualFinancialConstants,
  GrossUpFactorBand,
  MortgageAfmTestRate,
  RepaymentRuleKey,
  MortgageFinancingLoadLookupInput,
} from "@/lib/financial-constants/types";

function sanitizeYear(year?: number) {
  if (year === undefined || year === null || !Number.isFinite(year)) {
    return DEFAULT_FINANCIAL_YEAR;
  }

  return Math.round(year);
}

function datasetReferenceDateForYear(year?: number) {
  const safeYear = sanitizeYear(year);
  return safeYear === DEFAULT_FINANCIAL_YEAR
    ? `${DEFAULT_FINANCIAL_YEAR}-07-01`
    : `${safeYear}-07-01`;
}

function getDatasetForYearOrDefault(
  family: Parameters<typeof getSourceDatasetForDate>[0],
  year: number | undefined,
  scenario: string,
) {
  try {
    return getSourceDatasetForDate(family, datasetReferenceDateForYear(year), { scenario });
  } catch {
    return getSourceDatasetForDate(family, `${DEFAULT_FINANCIAL_YEAR}-07-01`, { scenario });
  }
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
  if (year !== undefined && isSupportedDuoRateYear(year)) {
    return getDuoHistoricalRateForRule(rule, year);
  }

  const constants = getFinancialConstants(year);
  return constants.duo.rates[rule] ?? constants.duo.rates.UNKNOWN;
}

export function getDuoDefaultTermForRule(rule: RepaymentRuleKey, year?: number) {
  const dataset = getDatasetForYearOrDefault(
    "duo-repayment-terms",
    year,
    "sf35-sf15-sf15-old-lllk",
  );
  const terms = dataset.data as AnnualFinancialConstants["duo"]["defaultTerms"];
  return terms[rule] ?? terms.UNKNOWN;
}

export function getDuoIncomeBasedRuleForRepaymentRule(
  rule: RepaymentRuleKey,
  year?: number,
) {
  const dataset = getDatasetForYearOrDefault(
    "duo-income-based-repayment-rules",
    year,
    "sf35-sf15-sf15-old-lllk",
  );
  const incomeBasedRules = dataset.data as AnnualFinancialConstants["duo"]["incomeBasedRules"];
  return (
    incomeBasedRules[rule] ??
    incomeBasedRules.UNKNOWN
  );
}

export function getDuoBorrowingLimits(year?: number) {
  const dataset = getDatasetForYearOrDefault("duo-borrowing-limits", year, "monthly-loan-slider");
  return dataset.data as AnnualFinancialConstants["duo"]["borrowingLimits"];
}

export function getDuoRateHistoryMeta() {
  return DUO_RATE_HISTORY_META;
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

export function getMortgageNhgRules(year?: number) {
  return getFinancialConstants(year).mortgage.nhg;
}

export function getMortgageLtvRules(year?: number) {
  return getFinancialConstants(year).mortgage.ltv;
}

export function getMortgageEnergyRules(year?: number) {
  return getFinancialConstants(year).mortgage.energy;
}

export function getMortgageAfmTestRates(year?: number): MortgageAfmTestRate[] {
  return [...getFinancialConstants(year).mortgage.afmTestRates];
}

export function getMortgageAfmTestRateForQuarter(
  quarter?: string,
  year?: number,
): MortgageAfmTestRate {
  const constants = getFinancialConstants(year);
  const targetQuarter = quarter ?? constants.mortgage.defaultAfmTestRateQuarter;
  const dataset = getSourceDatasetForDate(
    "mortgage-afm-test-rate",
    targetQuarter === "2026-Q3" ? "2026-07-01" : `${sanitizeYear(year)}-07-01`,
    { scenario: targetQuarter === "2026-Q3" ? "short-fixed-rate-2026-q3" : undefined },
  );

  return dataset.data as MortgageAfmTestRate;
}

export function getMortgageAfmTestRateForDate(asOf = SOURCE_DATA_REFERENCE_DATE): MortgageAfmTestRate {
  const dataset = getSourceDatasetForDate("mortgage-afm-test-rate", asOf);
  return dataset.data as MortgageAfmTestRate;
}

export function getMortgageAfmTestRateDatasetFreshness(asOf?: string) {
  const dataset = SOURCE_DATASET_REGISTRY.find(
    (candidate) =>
      candidate.family === "mortgage-afm-test-rate" &&
      candidate.scenario === "short-fixed-rate-2026-q3",
  );
  if (!dataset) {
    throw new Error("Geen AFM-toetsrentedataset geregistreerd.");
  }
  return getSourceDatasetFreshness(dataset, asOf);
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
  MortgageAfmTestRate,
  MortgageEnergyLabelKey,
  MortgageEnergyRules,
  MortgageFinancingLoadData,
  MortgageFinancingLoadAgeGroup,
  MortgageFinancingLoadLookupInput,
  MortgageFinancingLoadRateBand,
  MortgageFinancingLoadRow,
  MortgageFinancingLoadTable,
  MortgageLtvRules,
  MortgageNhgRules,
  RepaymentRuleKey,
  SourceTier,
  SourceDataset,
  SourceDatasetFamily,
  SourceDatasetMeta,
  SourceDatasetMethodologyType,
  SourceDatasetSourceType,
  SourceDatasetStatus,
  SourceFreshness,
  SourceFreshnessStatus,
  SourceReference,
} from "@/lib/financial-constants/types";
export { getMortgageFinancingLoadTable };
export { getAvailableDuoRateYears };
export { getDuoHistoricalRateYearForRule };
export { getDuoRateYearMetadata };
export { formatDuoRateYearLabel };
