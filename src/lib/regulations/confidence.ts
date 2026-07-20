import type {
  ConfidenceAssessment,
  ConfidenceFactor,
  ConfidenceLabel,
  ConfidenceScore,
  FieldId,
  ReasonCode,
  Result,
} from "@/lib/regulations/types";

export const CONFIDENCE_LABEL_RANGES: readonly {
  min: number;
  max: number;
  label: ConfidenceLabel;
}[] = [
  { min: 0, max: 24, label: "very-low" },
  { min: 25, max: 49, label: "low" },
  { min: 50, max: 74, label: "medium" },
  { min: 75, max: 89, label: "high" },
  { min: 90, max: 100, label: "very-high" },
];

export function isValidConfidenceScore(score: number): score is ConfidenceScore {
  return Number.isFinite(score) && score >= 0 && score <= 100;
}

export function normalizeConfidenceScore(score: number): Result<ConfidenceScore> {
  if (!Number.isFinite(score)) {
    return { ok: false, errors: ["confidence-score-not-finite"] };
  }
  if (score < 0 || score > 100) {
    return { ok: false, errors: ["confidence-score-out-of-range"] };
  }

  return { ok: true, value: score };
}

export function getConfidenceLabel(score: ConfidenceScore): ConfidenceLabel {
  const match = CONFIDENCE_LABEL_RANGES.find(
    (range) => score >= range.min && score <= range.max,
  );

  return match?.label ?? "very-low";
}

function unique<T>(values: readonly T[]) {
  return [...new Set(values)];
}

/**
 * Confidence combines explicit documented factors only. It is not a legal
 * entitlement probability.
 */
export function buildConfidenceAssessment(input: {
  baseScore: number;
  factors?: readonly ConfidenceFactor[];
  missingFields?: readonly FieldId[];
  uncertaintyCodes?: readonly ReasonCode[];
  explanationCodes?: readonly ReasonCode[];
}): Result<ConfidenceAssessment> {
  const base = normalizeConfidenceScore(input.baseScore);
  if (!base.ok) {
    return base;
  }

  const factorDelta = (input.factors ?? []).reduce(
    (sum, factor) => sum + factor.impact,
    0,
  );
  const combinedScore = base.value + factorDelta;
  const score = Math.min(Math.max(combinedScore, 0), 100);

  return {
    ok: true,
    value: {
      score,
      label: getConfidenceLabel(score),
      factors: input.factors ?? [],
      missingFields: unique(input.missingFields ?? []),
      uncertaintyCodes: unique(input.uncertaintyCodes ?? []),
      explanationCodes: unique(input.explanationCodes ?? []),
    },
  };
}
