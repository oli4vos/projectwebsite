import type {
  SourceDataset,
  SourceFreshnessStatus,
  SourceReference,
} from "@/lib/financial-constants";
import { getDatasetFreshness } from "@/lib/financial-constants";

export type MortgageProviderId = "abn-amro" | "ing" | "rabobank" | string;

export type MortgageProviderRateStatus =
  | "valid"
  | "missing"
  | "stale"
  | "expired"
  | "unverified"
  | "not-comparable";

export type MortgageProviderRateRecord = {
  providerId: MortgageProviderId;
  providerName: string;
  annualRatePercent?: number;
  mortgageType: "annuity" | "linear" | "interest-only" | "unknown";
  fixedRatePeriodYears: number;
  ltvClass: "100-market-value" | "nhg" | "other" | "unknown";
  hasNhg: boolean;
  discounts: {
    temporaryAction: boolean;
    houseBank: boolean;
    sustainability: boolean;
    otherPersonal: boolean;
  };
  sourceUrl: string;
  retrievedAt: string;
  lastVerifiedAt: string;
  status: MortgageProviderRateStatus;
  methodologyNote?: string;
};

export type MortgageProviderRateDataset = {
  referenceScenario: MortgageRateReferenceScenario;
  providers: MortgageProviderRateRecord[];
};

export type MortgageRateReferenceScenario = {
  mortgageType: "annuity";
  fixedRatePeriodYears: 10;
  ltvClass: "100-market-value";
  hasNhg: false;
  excludesDiscounts: readonly [
    "temporaryAction",
    "houseBank",
    "sustainability",
    "otherPersonal",
  ];
};

export type MortgageRateAverageStatus = "complete" | "partial" | "unusable";

export type MortgageProviderRateAverageResult = {
  status: MortgageRateAverageStatus;
  averageAnnualRatePercent: number | null;
  precisionAnnualRatePercent: number | null;
  providerCount: number;
  minimumProviderCount: number;
  includedProviders: string[];
  missingProviders: string[];
  excludedProviders: Array<{
    providerId: string;
    reason:
      | "missing-rate"
      | "stale"
      | "expired"
      | "unverified"
      | "not-comparable"
      | "wrong-scenario";
  }>;
  freshnessStatus: SourceFreshnessStatus;
  sourceReferences: SourceReference[];
  warnings: string[];
};

export const TEN_YEAR_ANNUITY_100_PERCENT_MARKET_VALUE_REFERENCE_SCENARIO: MortgageRateReferenceScenario = {
  mortgageType: "annuity",
  fixedRatePeriodYears: 10,
  ltvClass: "100-market-value",
  hasNhg: false,
  excludesDiscounts: [
    "temporaryAction",
    "houseBank",
    "sustainability",
    "otherPersonal",
  ],
};

const REQUIRED_PROVIDERS = ["abn-amro", "ing", "rabobank"] as const;

function isComparableRecord(
  record: MortgageProviderRateRecord,
  scenario: MortgageRateReferenceScenario,
) {
  return (
    record.mortgageType === scenario.mortgageType &&
    record.fixedRatePeriodYears === scenario.fixedRatePeriodYears &&
    record.ltvClass === scenario.ltvClass &&
    record.hasNhg === scenario.hasNhg &&
    !record.discounts.temporaryAction &&
    !record.discounts.houseBank &&
    !record.discounts.sustainability &&
    !record.discounts.otherPersonal
  );
}

function exclusionReason(record: MortgageProviderRateRecord) {
  if (record.annualRatePercent === undefined || !Number.isFinite(record.annualRatePercent)) {
    return "missing-rate" as const;
  }
  if (record.status === "stale") {
    return "stale" as const;
  }
  if (record.status === "expired") {
    return "expired" as const;
  }
  if (record.status === "unverified" || record.status === "missing") {
    return "unverified" as const;
  }
  if (record.status === "not-comparable") {
    return "not-comparable" as const;
  }
  return undefined;
}

export function calculateMortgageProviderRateAverage(
  dataset: SourceDataset<MortgageProviderRateDataset>,
  options: {
    asOf?: string;
    minimumProviderCount?: number;
    requiredProviderIds?: readonly string[];
  } = {},
): MortgageProviderRateAverageResult {
  const scenario = dataset.data.referenceScenario;
  const minimumProviderCount = Math.max(Math.round(options.minimumProviderCount ?? 3), 1);
  const requiredProviderIds = options.requiredProviderIds ?? REQUIRED_PROVIDERS;
  const freshness = getDatasetFreshness(dataset, options.asOf);
  const included: MortgageProviderRateRecord[] = [];
  const excludedProviders: MortgageProviderRateAverageResult["excludedProviders"] = [];

  for (const record of dataset.data.providers) {
    const reason = exclusionReason(record);
    if (reason) {
      excludedProviders.push({ providerId: record.providerId, reason });
      continue;
    }
    if (!isComparableRecord(record, scenario)) {
      excludedProviders.push({ providerId: record.providerId, reason: "wrong-scenario" });
      continue;
    }

    included.push(record);
  }

  const includedIds = new Set(included.map((record) => record.providerId));
  const missingProviders = requiredProviderIds.filter((providerId) => !includedIds.has(providerId));
  const average =
    included.length > 0
      ? included.reduce((sum, record) => sum + (record.annualRatePercent ?? 0), 0) / included.length
      : null;
  const canUseAverage = included.length >= minimumProviderCount && freshness.status === "fresh";
  const warnings: string[] = [];

  if (missingProviders.length > 0) {
    warnings.push("missing-provider-records");
  }
  if (included.length < minimumProviderCount) {
    warnings.push("too-few-provider-records");
  }
  if (freshness.status !== "fresh") {
    warnings.push(`dataset-${freshness.status}`);
  }

  return {
    status: canUseAverage ? "complete" : included.length > 0 ? "partial" : "unusable",
    averageAnnualRatePercent: canUseAverage ? average : null,
    precisionAnnualRatePercent: average,
    providerCount: included.length,
    minimumProviderCount,
    includedProviders: included.map((record) => record.providerId),
    missingProviders,
    excludedProviders,
    freshnessStatus: freshness.status,
    sourceReferences: [
      {
        label: dataset.meta.title,
        sourceName: dataset.meta.sourceName,
        sourceUrl: dataset.meta.sourceUrl,
        sourceType: dataset.meta.sourceType,
        referenceDate: dataset.meta.lastVerifiedAt,
        year: dataset.meta.year,
        effectiveFrom: dataset.meta.effectiveFrom,
        effectiveTo: dataset.meta.effectiveTo,
        methodology: dataset.meta.methodology,
        methodologyType: dataset.meta.methodologyType,
        freshnessStatus: freshness.status,
        warning: freshness.status === "fresh" ? undefined : freshness.message,
        datasetId: dataset.meta.id,
        version: dataset.meta.version,
      },
    ],
    warnings,
  };
}
