import type { SourceReference } from "@/lib/financial-constants";
import { buildConfidenceAssessment, getConfidenceLabel } from "@/lib/regulations/confidence";
import { createEstimateRange } from "@/lib/regulations/estimate";
import type {
  ConfidenceAssessment,
  ConfidenceLabel,
  EstimatePeriod,
  EstimateRange,
  EstimateUnit,
  ReasonCode,
  Result,
} from "@/lib/regulations/types";

export type ConfidenceLevel = ConfidenceLabel;

export type EstimateSource = {
  readonly sourceId: string;
  readonly sourceType: "official" | "project-assumption" | "adapter" | "inference";
  readonly sourceReferences: readonly SourceReference[];
  readonly reasonCodes: readonly ReasonCode[];
  readonly validFrom?: string;
  readonly validUntil?: string;
};

export type EstimateStrategy = {
  readonly strategyId: string;
  readonly estimateType: "none" | "signal-only" | "amount-range" | "percentage-range" | "custom-range";
  readonly rangeMergePolicy: "union" | "intersection" | "average-likely";
  readonly confidencePolicy: "minimum" | "average" | "weighted-average";
  readonly minimumConfidenceLevel: ConfidenceLevel;
  readonly officialVerificationRequired: boolean;
  readonly reasonCodes: readonly ReasonCode[];
};

export type EstimateResult = {
  readonly estimateId: string;
  readonly range: EstimateRange;
  readonly confidence: ConfidenceAssessment;
  readonly confidenceLevel: ConfidenceLevel;
  readonly sources: readonly EstimateSource[];
  readonly strategy: EstimateStrategy;
  readonly officialVerificationRequired: boolean;
  readonly reasonCodes: readonly ReasonCode[];
  readonly assumptions: readonly ReasonCode[];
  readonly warnings: readonly ReasonCode[];
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

function sourceKey(source: SourceReference) {
  return `${source.datasetId}:${source.version}:${source.sourceUrl}`;
}

function uniqueSourceReferences(sources: readonly SourceReference[]) {
  const seen = new Set<string>();

  return sources.filter((source) => {
    const key = sourceKey(source);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function validateStrategy(strategy: EstimateStrategy) {
  return [
    strategy.strategyId.trim().length === 0 ? "missing-estimate-strategy-id" : undefined,
    strategy.estimateType === "none" && strategy.officialVerificationRequired === false
      ? "estimate-none-requires-official-verification"
      : undefined,
  ].filter(Boolean) as ReasonCode[];
}

function validateCompatibleRanges(ranges: readonly EstimateRange[]) {
  const [first] = ranges;
  if (!first) {
    return ["missing-estimate-ranges"];
  }

  return ranges.flatMap((range) => [
    range.unit !== first.unit ? "estimate-unit-mismatch" : undefined,
    range.period !== first.period ? "estimate-period-mismatch" : undefined,
    range.sourceYear !== first.sourceYear ? "estimate-source-year-mismatch" : undefined,
    range.unit === "custom" && range.customUnit !== first.customUnit ? "estimate-custom-unit-mismatch" : undefined,
    range.period === "custom" && range.customPeriod !== first.customPeriod ? "estimate-custom-period-mismatch" : undefined,
  ]).filter(Boolean) as ReasonCode[];
}

export function propagateEstimateConfidence(
  confidences: readonly ConfidenceAssessment[],
  policy: EstimateStrategy["confidencePolicy"] = "minimum",
): Result<ConfidenceAssessment> {
  if (confidences.length === 0) {
    return { ok: false, errors: ["missing-estimate-confidence"] };
  }

  const score =
    policy === "minimum"
      ? Math.min(...confidences.map((confidence) => confidence.score))
      : Math.round(
          confidences.reduce((sum, confidence) => sum + confidence.score, 0) / confidences.length,
        );

  const result = buildConfidenceAssessment({
    baseScore: score,
    factors: confidences.flatMap((confidence) => confidence.factors),
    missingFields: confidences.flatMap((confidence) => confidence.missingFields),
    uncertaintyCodes: confidences.flatMap((confidence) => confidence.uncertaintyCodes),
    explanationCodes: unique(confidences.flatMap((confidence) => confidence.explanationCodes)),
  });

  if (!result.ok) {
    return result;
  }

  return { ok: true, value: deepFreeze(result.value) };
}

export function mergeEstimateRanges(input: {
  readonly ranges: readonly EstimateRange[];
  readonly policy: EstimateStrategy["rangeMergePolicy"];
  readonly confidence: ConfidenceAssessment;
  readonly assumptions?: readonly ReasonCode[];
  readonly uncertaintyCodes?: readonly ReasonCode[];
  readonly explanationCodes?: readonly ReasonCode[];
}): Result<EstimateRange> {
  const compatibilityErrors = validateCompatibleRanges(input.ranges);
  if (compatibilityErrors.length > 0) {
    return { ok: false, errors: compatibilityErrors };
  }

  const minimum =
    input.policy === "intersection"
      ? Math.max(...input.ranges.map((range) => range.minimum))
      : Math.min(...input.ranges.map((range) => range.minimum));
  const maximum =
    input.policy === "intersection"
      ? Math.min(...input.ranges.map((range) => range.maximum))
      : Math.max(...input.ranges.map((range) => range.maximum));
  if (minimum > maximum) {
    return { ok: false, errors: ["estimate-range-intersection-empty"] };
  }

  const likely =
    input.policy === "average-likely"
      ? input.ranges.reduce((sum, range) => sum + range.likely, 0) / input.ranges.length
      : Math.min(Math.max(
          input.ranges.reduce((sum, range) => sum + range.likely, 0) / input.ranges.length,
          minimum,
        ), maximum);
  const [first] = input.ranges;
  const sourceReferences = uniqueSourceReferences(
    input.ranges.flatMap((range) => range.sourceReferences),
  );

  return createEstimateRange({
    minimum,
    likely,
    maximum,
    unit: first.unit,
    customUnit: first.customUnit,
    period: first.period,
    customPeriod: first.customPeriod,
    sourceYear: first.sourceYear,
    confidence: input.confidence,
    assumptions: unique([
      ...input.ranges.flatMap((range) => range.assumptions),
      ...(input.assumptions ?? []),
    ]),
    uncertaintyCodes: unique([
      ...input.ranges.flatMap((range) => range.uncertaintyCodes),
      ...(input.uncertaintyCodes ?? []),
    ]),
    sourceReferences,
    explanationCodes: unique([
      ...input.ranges.flatMap((range) => range.explanationCodes),
      ...(input.explanationCodes ?? []),
    ]),
  });
}

export function createEstimateResult(input: {
  readonly estimateId: string;
  readonly range: EstimateRange;
  readonly strategy: EstimateStrategy;
  readonly sources: readonly EstimateSource[];
  readonly reasonCodes?: readonly ReasonCode[];
  readonly assumptions?: readonly ReasonCode[];
  readonly warnings?: readonly ReasonCode[];
  readonly officialVerificationRequired?: boolean;
}): Result<EstimateResult> {
  const errors = [
    input.estimateId.trim().length === 0 ? "missing-estimate-id" : undefined,
    input.sources.length === 0 ? "missing-estimate-sources" : undefined,
    ...validateStrategy(input.strategy),
  ].filter(Boolean) as ReasonCode[];

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: deepFreeze({
      estimateId: input.estimateId,
      range: input.range,
      confidence: input.range.confidence,
      confidenceLevel: getConfidenceLabel(input.range.confidence.score),
      sources: input.sources,
      strategy: input.strategy,
      officialVerificationRequired:
        input.officialVerificationRequired ?? input.strategy.officialVerificationRequired,
      reasonCodes: unique([...(input.reasonCodes ?? []), ...input.strategy.reasonCodes]),
      assumptions: unique([...(input.assumptions ?? []), ...input.range.assumptions]),
      warnings: unique(input.warnings ?? []),
    }),
  };
}

export function mergeEstimateResults(input: {
  readonly estimateId: string;
  readonly estimates: readonly EstimateResult[];
  readonly strategy: EstimateStrategy;
  readonly unit?: EstimateUnit;
  readonly period?: EstimatePeriod;
}): Result<EstimateResult> {
  if (input.estimates.length === 0) {
    return { ok: false, errors: ["missing-estimate-results"] };
  }

  const confidence = propagateEstimateConfidence(
    input.estimates.map((estimate) => estimate.confidence),
    input.strategy.confidencePolicy,
  );
  if (!confidence.ok) {
    return confidence;
  }

  const range = mergeEstimateRanges({
    ranges: input.estimates.map((estimate) => estimate.range),
    policy: input.strategy.rangeMergePolicy,
    confidence: confidence.value,
    assumptions: input.estimates.flatMap((estimate) => estimate.assumptions),
    uncertaintyCodes: input.estimates.flatMap((estimate) => estimate.range.uncertaintyCodes),
    explanationCodes: input.estimates.flatMap((estimate) => estimate.range.explanationCodes),
  });
  if (!range.ok) {
    return range;
  }

  if (input.unit && range.value.unit !== input.unit) {
    return { ok: false, errors: ["estimate-unit-mismatch"] };
  }
  if (input.period && range.value.period !== input.period) {
    return { ok: false, errors: ["estimate-period-mismatch"] };
  }

  return createEstimateResult({
    estimateId: input.estimateId,
    range: range.value,
    strategy: input.strategy,
    sources: input.estimates.flatMap((estimate) => estimate.sources),
    reasonCodes: input.estimates.flatMap((estimate) => estimate.reasonCodes),
    assumptions: input.estimates.flatMap((estimate) => estimate.assumptions),
    warnings: input.estimates.flatMap((estimate) => estimate.warnings),
    officialVerificationRequired:
      input.strategy.officialVerificationRequired ||
      input.estimates.some((estimate) => estimate.officialVerificationRequired),
  });
}
