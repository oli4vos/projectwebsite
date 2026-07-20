import { sortActionPlan } from "@/lib/regulations/actions";
import { getConfidenceLabel, isValidConfidenceScore } from "@/lib/regulations/confidence";
import { mergeCalculationEvidence } from "@/lib/regulations/evidence";
import type {
  ActionPlanItem,
  CalculationEvidence,
  ConfidenceAssessment,
  EstimateRange,
  Recommendation,
  RegulationEvaluationResult,
  RegulationId,
  Result,
} from "@/lib/regulations/types";

export type RegulationDefinition = {
  readonly regulationId: RegulationId;
  readonly sourceYear?: number;
  readonly evidence?: CalculationEvidence;
  readonly actionPlan?: readonly ActionPlanItem[];
  readonly recommendations?: readonly Recommendation[];
};

export type RegulationEvaluationContext = {
  readonly referenceDate?: string;
  readonly evidence?: CalculationEvidence;
  readonly actionPlan?: readonly ActionPlanItem[];
  readonly recommendations?: readonly Recommendation[];
};

function isNonEmptyString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonEmptyArray<T>(value: readonly T[] | undefined): value is readonly T[] {
  return Array.isArray(value) && value.length > 0;
}

function unique<T>(values: readonly T[]) {
  return [...new Set(values)];
}

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

function cloneResult(result: RegulationEvaluationResult): RegulationEvaluationResult {
  return structuredClone(result) as RegulationEvaluationResult;
}

function normalizeConfidence(confidence: ConfidenceAssessment): Result<ConfidenceAssessment> {
  if (!isValidConfidenceScore(confidence.score)) {
    return { ok: false, errors: ["confidence-score-out-of-range"] };
  }

  return {
    ok: true,
    value: {
      ...confidence,
      label: getConfidenceLabel(confidence.score),
      factors: [...confidence.factors],
      missingFields: unique(confidence.missingFields),
      uncertaintyCodes: unique(confidence.uncertaintyCodes),
      explanationCodes: unique(confidence.explanationCodes),
    },
  };
}

function validateEvidence(evidence: CalculationEvidence | undefined) {
  if (!evidence) {
    return ["missing-evidence"];
  }

  return [
    !Array.isArray(evidence.usedRuleIds) ? "missing-evidence-used-rules" : undefined,
    !Array.isArray(evidence.sourceReferences) ? "missing-evidence-source-references" : undefined,
    !Array.isArray(evidence.inputFieldIds) ? "missing-evidence-input-fields" : undefined,
    !Array.isArray(evidence.missingFieldIds) ? "missing-evidence-missing-fields" : undefined,
    !evidence.validity ? "missing-evidence-validity" : undefined,
  ].filter(Boolean) as string[];
}

function validateEstimate(estimate: EstimateRange | undefined, sourceYear: number) {
  if (!estimate) {
    return [];
  }

  return [
    !Number.isFinite(estimate.minimum) ? "estimate-minimum-not-finite" : undefined,
    !Number.isFinite(estimate.likely) ? "estimate-likely-not-finite" : undefined,
    !Number.isFinite(estimate.maximum) ? "estimate-maximum-not-finite" : undefined,
    estimate.minimum > estimate.likely ? "estimate-minimum-above-likely" : undefined,
    estimate.likely > estimate.maximum ? "estimate-likely-above-maximum" : undefined,
    estimate.sourceYear !== sourceYear ? "estimate-source-year-mismatch" : undefined,
    !isValidConfidenceScore(estimate.confidence.score)
      ? "estimate-confidence-score-out-of-range"
      : undefined,
    !isNonEmptyArray(estimate.sourceReferences)
      ? "estimate-missing-source-references"
      : undefined,
  ].filter(Boolean) as string[];
}

function validateRequiredOutput(result: RegulationEvaluationResult) {
  return [
    !isNonEmptyString(result.regulationId) ? "missing-regulation-id" : undefined,
    !Number.isInteger(result.sourceYear) ? "missing-source-year" : undefined,
    ...validateEvidence(result.evidence),
    !result.officialVerification ? "missing-official-verification" : undefined,
    !isNonEmptyArray(result.actionPlan) ? "missing-action-plan" : undefined,
    !isNonEmptyArray(result.recommendations) ? "missing-recommendations" : undefined,
  ].filter(Boolean) as string[];
}

export function evaluateRegulation(
  definition: RegulationDefinition,
  adapterOutput: RegulationEvaluationResult,
  context: RegulationEvaluationContext = {},
): Result<RegulationEvaluationResult> {
  const validationErrors = [
    !isNonEmptyString(definition.regulationId) ? "missing-definition-regulation-id" : undefined,
    definition.regulationId !== adapterOutput.regulationId
      ? "definition-regulation-id-mismatch"
      : undefined,
    ...validateRequiredOutput(adapterOutput),
  ].filter(Boolean) as string[];

  if (validationErrors.length > 0) {
    return { ok: false, errors: validationErrors };
  }

  const confidence = normalizeConfidence(adapterOutput.confidence);
  if (!confidence.ok) {
    return confidence;
  }

  const sourceYear = adapterOutput.sourceYear ?? definition.sourceYear;
  const estimateErrors = validateEstimate(adapterOutput.estimateRange, sourceYear);
  if (estimateErrors.length > 0) {
    return { ok: false, errors: estimateErrors };
  }

  const evidenceEntries = [
    definition.evidence,
    adapterOutput.evidence,
    context.evidence,
  ].filter(Boolean) as CalculationEvidence[];
  const evidence = mergeCalculationEvidence(evidenceEntries);
  const actionPlan = sortActionPlan([
    ...(definition.actionPlan ?? []),
    ...adapterOutput.actionPlan,
    ...(context.actionPlan ?? []),
  ]);
  const recommendations = [
    ...(definition.recommendations ?? []),
    ...adapterOutput.recommendations,
    ...(context.recommendations ?? []),
  ];

  const result: RegulationEvaluationResult = {
    ...cloneResult(adapterOutput),
    confidence: confidence.value,
    evidence,
    recommendations,
    actionPlan,
    sourceYear,
    validity: {
      ...evidence.validity,
      referenceDate: context.referenceDate ?? evidence.validity.referenceDate,
    },
  };

  const finalErrors = [
    ...validateRequiredOutput(result),
    ...validateEstimate(result.estimateRange, result.sourceYear),
  ];
  if (finalErrors.length > 0) {
    return { ok: false, errors: finalErrors };
  }

  return { ok: true, value: deepFreeze(result) };
}
