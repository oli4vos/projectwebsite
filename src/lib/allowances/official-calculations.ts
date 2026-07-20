import type { AllowanceCalculationRules2026, AllowanceValueSource } from "@/lib/financial-constants/allowance-calculation-rules-2026";
import {
  getDatasetForDate,
  getDatasetFreshness,
} from "@/lib/financial-constants/source-datasets";
import type {
  SourceDataset,
  SourceFreshnessStatus,
  SourceReference,
} from "@/lib/financial-constants/types";
import {
  evaluateAllowanceRegulations,
  type AllowanceRegulationAssessment,
} from "@/lib/allowances/regulations-pipeline";
import type {
  AllowanceEvaluationContext,
  AllowanceKind,
  AllowanceReasonCode,
  AllowanceScanInput,
  AllowanceSignalResult,
  AllowanceUncertaintyCode,
} from "@/lib/allowances/signaling";
import { buildConfidenceAssessment } from "@/lib/regulations/confidence";
import { createEstimateRange } from "@/lib/regulations/estimate";
import {
  createEstimateResult,
  createUnavailableEstimateResult,
  type EstimateResult,
  type EstimateSource,
  type EstimateStrategy,
} from "@/lib/regulations/estimate-engine";
import type { ReasonCode, Result } from "@/lib/regulations/types";

export type OfficialAllowanceCalculationStatus =
  | "available"
  | "incomplete"
  | "special-case"
  | "unavailable";

export type OfficialAllowanceEligibilityStatus =
  | "passes-known-hard-checks"
  | "fails-known-hard-checks"
  | "insufficient-information"
  | "special-case";

export type OfficialAllowanceAmount = {
  readonly availability: OfficialAllowanceCalculationStatus;
  readonly monthlyAmount?: number;
  readonly annualAmount?: number;
  readonly estimate: EstimateResult;
  readonly blockerCodes: readonly ReasonCode[];
};

export type OfficialAllowanceCalculationInput = AllowanceScanInput & {
  readonly calculationYear: number;
};

export type OfficialAllowanceCalculationResult = {
  readonly allowanceKind: AllowanceKind;
  readonly calculationYear: number;
  readonly status: OfficialAllowanceCalculationStatus;
  readonly eligibilityStatus: OfficialAllowanceEligibilityStatus;
  readonly amount: OfficialAllowanceAmount;
  readonly signal: AllowanceSignalResult;
  readonly assessment: AllowanceRegulationAssessment;
  readonly reasonCodes: readonly ReasonCode[];
  readonly missingFields: readonly string[];
  readonly uncertaintyCodes: readonly ReasonCode[];
  readonly sourceReferences: readonly SourceReference[];
  readonly sourceYear: number;
  readonly datasetId: string;
  readonly datasetVersion: string;
  readonly freshnessStatus: SourceFreshnessStatus;
  readonly officialVerificationRequired: boolean;
};

export type OfficialAllowanceScanCalculationResult = {
  readonly calculationYear: number;
  readonly datasetId: string;
  readonly datasetVersion: string;
  readonly freshnessStatus: SourceFreshnessStatus;
  readonly results: readonly [
    OfficialAllowanceCalculationResult,
    OfficialAllowanceCalculationResult,
    OfficialAllowanceCalculationResult,
    OfficialAllowanceCalculationResult,
  ];
};

const CALCULATION_YEAR = 2026;
const CALCULATION_SCENARIO = "official-2026-prepared";
const AMOUNT_BLOCKER_CODES: Readonly<Record<Exclude<AllowanceKind, "healthcare">, readonly ReasonCode[]>> = {
  rent: [
    "rent-amount-formula-not-normalized",
    "rent-basishuur-and-afbouw-not-normalized",
    "rent-special-household-rules-not-normalized",
  ],
  "child-budget": [
    "child-budget-amount-formula-not-normalized",
    "child-budget-income-table-not-normalized",
    "child-budget-family-exceptions-not-normalized",
  ],
  childcare: [
    "childcare-reimbursement-table-not-normalized",
    "childcare-contract-level-inputs-not-modeled",
    "childcare-lrk-and-activity-verification-required",
  ],
};

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);
  for (const nested of Object.values(value)) {
    deepFreeze(nested);
  }

  return value;
}

function unique<T>(values: readonly T[]) {
  return [...new Set(values)];
}

function valueSourceReference(
  dataset: SourceDataset<AllowanceCalculationRules2026>,
  freshnessStatus: SourceFreshnessStatus,
  source: AllowanceValueSource,
): SourceReference {
  return {
    label: `${source.officialSourceTitle} - ${source.sourceSection}`,
    sourceName: dataset.meta.sourceName,
    sourceUrl: source.officialSourceUrl,
    sourceType: dataset.meta.sourceType,
    referenceDate: source.reviewedAt,
    year: source.calculationYear,
    effectiveFrom: source.validFrom,
    effectiveTo: source.validUntil,
    methodology: dataset.meta.methodology,
    methodologyType: dataset.meta.methodologyType,
    freshnessStatus,
    datasetId: dataset.meta.id,
    version: dataset.meta.version,
  };
}

function datasetSourceReference(
  dataset: SourceDataset<AllowanceCalculationRules2026>,
  freshnessStatus: SourceFreshnessStatus,
): SourceReference {
  return {
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
    freshnessStatus,
    datasetId: dataset.meta.id,
    version: dataset.meta.version,
  };
}

function estimateStrategyFor(
  allowanceKind: AllowanceKind,
  availability: OfficialAllowanceCalculationStatus,
): EstimateStrategy {
  return {
    strategyId: `allowance.${allowanceKind}.official-2026-estimate`,
    estimateType: availability === "available" ? "amount-range" : "none",
    rangeMergePolicy: "union",
    confidencePolicy: "minimum",
    minimumConfidenceLevel: availability === "available" ? "medium" : "low",
    officialVerificationRequired: true,
    reasonCodes: [`allowance-${allowanceKind}-official-2026-${availability}`],
  };
}

function estimateSourceFor(
  allowanceKind: AllowanceKind,
  sourceReferences: readonly SourceReference[],
): EstimateSource {
  return {
    sourceId: `allowance.${allowanceKind}.official-2026-source`,
    sourceType: "official",
    sourceReferences,
    reasonCodes: [`allowance-${allowanceKind}-official-source`],
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
  };
}

function resolveCalculationDataset(context: AllowanceEvaluationContext = {}) {
  return getDatasetForDate("allowance-calculation-rules", context.referenceDate, {
    scenario: CALCULATION_SCENARIO,
    registry: context.registry,
  }) as SourceDataset<AllowanceCalculationRules2026>;
}

function resolveEligibilityStatus(signal: AllowanceSignalResult): OfficialAllowanceEligibilityStatus {
  if (signal.missingFields.length > 0 || signal.status === "insufficient-information") {
    return "insufficient-information";
  }
  if (signal.hardExclusion || signal.status === "probably-not") {
    return "fails-known-hard-checks";
  }
  if (signal.status === "official-calculation-recommended" || signal.uncertaintyCodes.length > 0) {
    return "special-case";
  }
  return "passes-known-hard-checks";
}

function resolveStatus(input: {
  readonly signal: AllowanceSignalResult;
  readonly allowanceKind: AllowanceKind;
}): OfficialAllowanceCalculationStatus {
  if (input.signal.missingFields.length > 0 || input.signal.status === "insufficient-information") {
    return "incomplete";
  }
  if (input.signal.status === "official-calculation-recommended" || input.signal.uncertaintyCodes.length > 0) {
    return "special-case";
  }
  if (input.allowanceKind !== "healthcare") {
    return "unavailable";
  }
  return input.signal.hardExclusion ? "available" : "available";
}

function healthcareSourceReferences(
  dataset: SourceDataset<AllowanceCalculationRules2026>,
  freshnessStatus: SourceFreshnessStatus,
  partnerStatus: "yes" | "no",
) {
  const data = dataset.data.healthcare;
  return [
    valueSourceReference(dataset, freshnessStatus, data.minimumAge),
    valueSourceReference(
      dataset,
      freshnessStatus,
      partnerStatus === "yes" ? data.maxIncomeWithPartner : data.maxIncomeSingle,
    ),
    valueSourceReference(
      dataset,
      freshnessStatus,
      partnerStatus === "yes" ? data.maxAssetsWithPartner : data.maxAssetsSingle,
    ),
    datasetSourceReference(dataset, freshnessStatus),
  ];
}

function healthcareAmount(
  input: OfficialAllowanceCalculationInput,
  assessment: AllowanceRegulationAssessment,
  calculationDataset: SourceDataset<AllowanceCalculationRules2026>,
  freshnessStatus: SourceFreshnessStatus,
  status: OfficialAllowanceCalculationStatus,
): Result<OfficialAllowanceAmount> {
  const partnerStatus = input.partnerStatus;
  const sourceReferences = healthcareSourceReferences(
    calculationDataset,
    freshnessStatus,
    partnerStatus === "yes" ? "yes" : "no",
  );
  const strategy = estimateStrategyFor("healthcare", status);
  const sources = [estimateSourceFor("healthcare", sourceReferences)];

  if (assessment.originalSignal.hardExclusion) {
    const confidence = buildConfidenceAssessment({
      baseScore: 85,
      missingFields: assessment.originalSignal.missingFields,
      uncertaintyCodes: assessment.originalSignal.uncertaintyCodes,
      explanationCodes: assessment.originalSignal.reasonCodes,
    });
    if (!confidence.ok) {
      return confidence;
    }
    const range = createEstimateRange({
      minimum: 0,
      likely: 0,
      maximum: 0,
      unit: "currency",
      period: "month",
      sourceYear: CALCULATION_YEAR,
      confidence: confidence.value,
      assumptions: ["healthcare-hard-exclusion-results-in-zero-monthly-amount"],
      uncertaintyCodes: assessment.originalSignal.uncertaintyCodes,
      sourceReferences,
      explanationCodes: assessment.originalSignal.reasonCodes,
    });
    if (!range.ok) {
      return range;
    }
    const estimate = createEstimateResult({
      estimateId: "allowance.healthcare.official-2026.amount",
      range: range.value,
      strategy,
      sources,
      reasonCodes: assessment.originalSignal.reasonCodes,
      assumptions: ["healthcare-hard-exclusion-results-in-zero-monthly-amount"],
      warnings: assessment.originalSignal.uncertaintyCodes,
      officialVerificationRequired: true,
    });
    if (!estimate.ok) {
      return estimate;
    }
    return {
      ok: true,
      value: {
        availability: "available",
        monthlyAmount: 0,
        annualAmount: 0,
        estimate: estimate.value,
        blockerCodes: [],
      },
    };
  }

  if (status !== "available") {
    const confidence = buildConfidenceAssessment({
      baseScore: 35,
      missingFields: assessment.originalSignal.missingFields,
      uncertaintyCodes: assessment.originalSignal.uncertaintyCodes,
      explanationCodes: assessment.originalSignal.reasonCodes,
    });
    if (!confidence.ok) {
      return confidence;
    }
    const estimate = createUnavailableEstimateResult({
      estimateId: "allowance.healthcare.official-2026.amount",
      strategy,
      confidence: confidence.value,
      sources,
      availability: "signal-only",
      reasonCodes: assessment.originalSignal.reasonCodes,
      warnings: assessment.originalSignal.uncertaintyCodes,
      officialVerificationRequired: true,
    });
    if (!estimate.ok) {
      return estimate;
    }
    return {
      ok: true,
      value: {
        availability: status,
        estimate: estimate.value,
        blockerCodes: ["healthcare-official-amount-not-calculable-for-input"],
      },
    };
  }

  const income = partnerStatus === "yes" ? input.jointAssessmentIncome : input.assessmentIncome;
  if (partnerStatus !== "yes" && partnerStatus !== "no" || income === undefined || !Number.isFinite(income) || income < 0) {
    return { ok: false, errors: ["healthcare-income-missing-for-official-calculation"] };
  }

  const table = partnerStatus === "yes"
    ? calculationDataset.data.healthcare.monthlyTableWithPartner
    : calculationDataset.data.healthcare.monthlyTableSingle;
  const row = table.find((entry) => income <= entry.incomeUpTo);
  if (!row) {
    return { ok: false, errors: ["healthcare-official-table-row-missing"] };
  }

  const confidence = buildConfidenceAssessment({
    baseScore: 88,
    missingFields: assessment.originalSignal.missingFields,
    uncertaintyCodes: assessment.originalSignal.uncertaintyCodes,
    explanationCodes: [
      ...assessment.originalSignal.reasonCodes,
      partnerStatus === "yes"
        ? "healthcare-official-table-with-partner"
        : "healthcare-official-table-single",
    ],
  });
  if (!confidence.ok) {
    return confidence;
  }
  const range = createEstimateRange({
    minimum: row.monthlyAmount,
    likely: row.monthlyAmount,
    maximum: row.monthlyAmount,
    unit: "currency",
    period: "month",
    sourceYear: CALCULATION_YEAR,
    confidence: confidence.value,
    assumptions: ["healthcare-official-month-table-lookup"],
    uncertaintyCodes: [],
    sourceReferences,
    explanationCodes: assessment.originalSignal.reasonCodes,
  });
  if (!range.ok) {
    return range;
  }
  const estimate = createEstimateResult({
    estimateId: "allowance.healthcare.official-2026.amount",
    range: range.value,
    strategy,
    sources,
    reasonCodes: [
      ...assessment.originalSignal.reasonCodes,
      "healthcare-official-monthly-table-used",
    ],
    assumptions: ["healthcare-annual-amount-is-monthly-amount-times-12"],
    officialVerificationRequired: true,
  });
  if (!estimate.ok) {
    return estimate;
  }

  return {
    ok: true,
    value: {
      availability: "available",
      monthlyAmount: row.monthlyAmount,
      annualAmount: row.monthlyAmount * 12,
      estimate: estimate.value,
      blockerCodes: [],
    },
  };
}

function unavailableAmount(input: {
  readonly allowanceKind: Exclude<AllowanceKind, "healthcare">;
  readonly assessment: AllowanceRegulationAssessment;
  readonly calculationDataset: SourceDataset<AllowanceCalculationRules2026>;
  readonly freshnessStatus: SourceFreshnessStatus;
  readonly status: OfficialAllowanceCalculationStatus;
  readonly extraSourceReferences: readonly SourceReference[];
}): Result<OfficialAllowanceAmount> {
  const blockerCodes = unique([
    ...AMOUNT_BLOCKER_CODES[input.allowanceKind],
    ...input.assessment.originalSignal.uncertaintyCodes,
  ]);
  const sourceReferences = unique([
    ...input.extraSourceReferences,
    datasetSourceReference(input.calculationDataset, input.freshnessStatus),
  ]);
  const confidence = buildConfidenceAssessment({
    baseScore: input.status === "incomplete" ? 20 : 35,
    missingFields: input.assessment.originalSignal.missingFields,
    uncertaintyCodes: input.assessment.originalSignal.uncertaintyCodes,
    explanationCodes: [
      ...input.assessment.originalSignal.reasonCodes,
      ...blockerCodes,
    ],
  });
  if (!confidence.ok) {
    return confidence;
  }
  const estimate = createUnavailableEstimateResult({
    estimateId: `allowance.${input.allowanceKind}.official-2026.amount`,
    strategy: estimateStrategyFor(input.allowanceKind, input.status),
    confidence: confidence.value,
    sources: [estimateSourceFor(input.allowanceKind, sourceReferences)],
    availability: "not-available",
    reasonCodes: [
      ...input.assessment.originalSignal.reasonCodes,
      ...blockerCodes,
    ],
    warnings: input.assessment.originalSignal.uncertaintyCodes,
    officialVerificationRequired: true,
  });
  if (!estimate.ok) {
    return estimate;
  }

  return {
    ok: true,
    value: {
      availability: input.status,
      estimate: estimate.value,
      blockerCodes,
    },
  };
}

function calculationSourceReferencesFor(
  allowanceKind: AllowanceKind,
  dataset: SourceDataset<AllowanceCalculationRules2026>,
  freshnessStatus: SourceFreshnessStatus,
) {
  switch (allowanceKind) {
    case "healthcare":
      return healthcareSourceReferences(dataset, freshnessStatus, "no");
    case "rent":
      return [
        valueSourceReference(dataset, freshnessStatus, dataset.data.rent.maxAssetsSingle),
        valueSourceReference(dataset, freshnessStatus, dataset.data.rent.maxAssetsWithPartner),
        valueSourceReference(dataset, freshnessStatus, dataset.data.rent.cappedRentThreshold),
        valueSourceReference(dataset, freshnessStatus, dataset.data.rent.cappedRentThresholdUnder21),
      ];
    case "child-budget":
      return [
        valueSourceReference(dataset, freshnessStatus, dataset.data.childBudget.maxAssetsSingle),
        valueSourceReference(dataset, freshnessStatus, dataset.data.childBudget.maxAssetsWithPartner),
        valueSourceReference(dataset, freshnessStatus, dataset.data.childBudget.thresholdIncomeSingleParentChange2026),
        valueSourceReference(dataset, freshnessStatus, dataset.data.childBudget.thresholdIncomePartnersChange2026),
      ];
    case "childcare":
      return [
        valueSourceReference(dataset, freshnessStatus, dataset.data.childcare.maxHoursPerMonth),
        valueSourceReference(dataset, freshnessStatus, dataset.data.childcare.maxHourlyRateDaycare),
        valueSourceReference(dataset, freshnessStatus, dataset.data.childcare.maxHourlyRateOutOfSchoolCare),
        valueSourceReference(dataset, freshnessStatus, dataset.data.childcare.maxHourlyRateChildminderCare),
      ];
  }
}

function buildCalculationResult(input: {
  readonly calculationYear: number;
  readonly assessment: AllowanceRegulationAssessment;
  readonly calculationDataset: SourceDataset<AllowanceCalculationRules2026>;
  readonly freshnessStatus: SourceFreshnessStatus;
  readonly originalInput: OfficialAllowanceCalculationInput;
}): Result<OfficialAllowanceCalculationResult> {
  const signal = input.assessment.originalSignal;
  const status = resolveStatus({ signal, allowanceKind: signal.allowanceKind });
  const amount = signal.allowanceKind === "healthcare"
    ? healthcareAmount(
        input.originalInput,
        input.assessment,
        input.calculationDataset,
        input.freshnessStatus,
        status,
      )
    : unavailableAmount({
        allowanceKind: signal.allowanceKind,
        assessment: input.assessment,
        calculationDataset: input.calculationDataset,
        freshnessStatus: input.freshnessStatus,
        status,
        extraSourceReferences: calculationSourceReferencesFor(
          signal.allowanceKind,
          input.calculationDataset,
          input.freshnessStatus,
        ),
      });
  if (!amount.ok) {
    return amount;
  }

  return {
    ok: true,
    value: deepFreeze({
      allowanceKind: signal.allowanceKind,
      calculationYear: input.calculationYear,
      status,
      eligibilityStatus: resolveEligibilityStatus(signal),
      amount: amount.value,
      signal,
      assessment: input.assessment,
      reasonCodes: unique([
        ...signal.reasonCodes,
        ...amount.value.estimate.reasonCodes,
      ]),
      missingFields: signal.missingFields,
      uncertaintyCodes: unique([
        ...signal.uncertaintyCodes,
        ...amount.value.blockerCodes,
      ]),
      sourceReferences: unique([
        ...signal.sourceReferences,
        ...amount.value.estimate.sources.flatMap((source) => source.sourceReferences),
      ]),
      sourceYear: input.calculationYear,
      datasetId: input.calculationDataset.meta.id,
      datasetVersion: input.calculationDataset.meta.version,
      freshnessStatus: input.freshnessStatus,
      officialVerificationRequired: true,
    }),
  };
}

export function calculateOfficialAllowanceScan2026(
  input: OfficialAllowanceCalculationInput,
  context: AllowanceEvaluationContext = {},
): Result<OfficialAllowanceScanCalculationResult> {
  if (input.calculationYear !== CALCULATION_YEAR) {
    return { ok: false, errors: ["allowance-calculation-year-must-be-2026"] };
  }
  if (input.year !== undefined && input.year !== input.calculationYear) {
    return { ok: false, errors: ["allowance-input-year-mismatch"] };
  }

  let calculationDataset: SourceDataset<AllowanceCalculationRules2026>;
  try {
    calculationDataset = resolveCalculationDataset(context);
  } catch (error) {
    return {
      ok: false,
      errors: [
        `allowance-calculation-dataset-failed:${error instanceof Error ? error.message : "unknown-error"}`,
      ],
    };
  }
  const freshness = getDatasetFreshness(calculationDataset, context.referenceDate);
  if (freshness.status !== "fresh" && freshness.status !== "review-due") {
    return { ok: false, errors: [`allowance-calculation-dataset-not-usable:${freshness.status}`] };
  }

  const regulations = evaluateAllowanceRegulations(
    { ...input, year: input.calculationYear },
    { ...context, ruleYear: input.calculationYear },
  );
  if (!regulations.ok) {
    return regulations;
  }

  const results = regulations.value.assessments.map((assessment) =>
    buildCalculationResult({
      calculationYear: input.calculationYear,
      assessment,
      calculationDataset,
      freshnessStatus: freshness.status,
      originalInput: input,
    }),
  );
  const firstError = results.find((result) => !result.ok);
  if (firstError && !firstError.ok) {
    return firstError;
  }

  return {
    ok: true,
    value: deepFreeze({
      calculationYear: input.calculationYear,
      datasetId: calculationDataset.meta.id,
      datasetVersion: calculationDataset.meta.version,
      freshnessStatus: freshness.status,
      results: results.map((result) => {
        if (!result.ok) {
          throw new Error("Unexpected failed allowance calculation after error check.");
        }
        return result.value;
      }) as unknown as OfficialAllowanceScanCalculationResult["results"],
    }),
  };
}

export function calculateOfficialAllowance2026(
  input: OfficialAllowanceCalculationInput,
  allowanceKind: AllowanceKind,
  context: AllowanceEvaluationContext = {},
): Result<OfficialAllowanceCalculationResult> {
  const scan = calculateOfficialAllowanceScan2026(input, context);
  if (!scan.ok) {
    return scan;
  }
  const result = scan.value.results.find((item) => item.allowanceKind === allowanceKind);
  if (!result) {
    return { ok: false, errors: [`allowance-calculation-result-missing:${allowanceKind}`] };
  }

  return { ok: true, value: result };
}

export type OfficialAllowanceCalculationReasonCode =
  | AllowanceReasonCode
  | AllowanceUncertaintyCode
  | ReasonCode;
