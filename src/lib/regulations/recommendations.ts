import type { SourceReference } from "@/lib/financial-constants";
import type { RegulationDefinition } from "@/lib/regulations/definition";
import type { InferenceResult, UnknownResolution } from "@/lib/regulations/unknown";
import type {
  ActionType,
  FieldId,
  ReasonCode,
  RegulationEvaluationResult,
  RecommendationUrgency,
  ToolId,
} from "@/lib/regulations/types";

export type RecommendationResult = {
  readonly recommendationId: string;
  readonly priority: number;
  readonly urgency: RecommendationUrgency;
  readonly type: ActionType;
  readonly titleCode: ReasonCode;
  readonly explanationCode: ReasonCode;
  readonly reasonCodes: readonly ReasonCode[];
  readonly sourceReferences: readonly SourceReference[];
  readonly relatedFields: readonly FieldId[];
  readonly relatedTools: readonly ToolId[];
  readonly dependsOn: readonly string[];
  readonly confidenceImpact: number;
  readonly suppressed: boolean;
};

export type BuildRecommendationsInput = {
  readonly definition: RegulationDefinition;
  readonly evaluation: RegulationEvaluationResult;
  readonly unknownResolutions?: readonly UnknownResolution[];
  readonly inferences?: readonly InferenceResult[];
  readonly suppressedRecommendationIds?: readonly string[];
};

const TYPE_PRIORITY: Record<ActionType, number> = {
  "collect-data": 10,
  "verify-officially": 20,
  "apply-officially": 30,
  "run-project-tool": 40,
  "monitor-year-change": 50,
  "review-later": 60,
  "not-relevant-now": 70,
};

const URGENCY_WEIGHT: Record<RecommendationUrgency, number> = {
  "time-sensitive": 0,
  high: 1,
  medium: 2,
  low: 3,
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

function uniqueSources(sources: readonly SourceReference[]) {
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

function typeFromExpectedAction(actionType: string): ActionType | undefined {
  return Object.hasOwn(TYPE_PRIORITY, actionType) ? (actionType as ActionType) : undefined;
}

function createRecommendation(input: {
  definition: RegulationDefinition;
  evaluation: RegulationEvaluationResult;
  type: ActionType;
  reasonCodes: readonly ReasonCode[];
  sourceReferences?: readonly SourceReference[];
  relatedFields?: readonly FieldId[];
  relatedTools?: readonly ToolId[];
  dependsOn?: readonly string[];
  confidenceImpact?: number;
  priority?: number;
  urgency?: RecommendationUrgency;
}): RecommendationResult {
  const recommendationId = `${input.definition.regulationId}.${input.type}`;

  return {
    recommendationId,
    priority: input.priority ?? TYPE_PRIORITY[input.type],
    urgency: input.urgency ?? "medium",
    type: input.type,
    titleCode: `${recommendationId}.title`,
    explanationCode: `${recommendationId}.explanation`,
    reasonCodes: input.reasonCodes,
    sourceReferences: input.sourceReferences ?? input.definition.sourceReferences,
    relatedFields: input.relatedFields ?? [],
    relatedTools: input.relatedTools ?? input.definition.adapter.relatedTools,
    dependsOn: input.dependsOn ?? [],
    confidenceImpact: input.confidenceImpact ?? 0,
    suppressed: false,
  };
}

export function sortRecommendations(
  recommendations: readonly RecommendationResult[],
): readonly RecommendationResult[] {
  return deepFreeze(
    [...recommendations].sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }

      const urgencyDelta = URGENCY_WEIGHT[left.urgency] - URGENCY_WEIGHT[right.urgency];
      if (urgencyDelta !== 0) {
        return urgencyDelta;
      }

      return left.recommendationId.localeCompare(right.recommendationId);
    }),
  );
}

export function mergeRecommendations(
  recommendations: readonly RecommendationResult[],
): readonly RecommendationResult[] {
  const merged = new Map<string, RecommendationResult>();

  for (const recommendation of recommendations) {
    const existing = merged.get(recommendation.recommendationId);
    if (!existing) {
      merged.set(recommendation.recommendationId, { ...recommendation });
      continue;
    }

    merged.set(recommendation.recommendationId, {
      ...existing,
      priority: Math.min(existing.priority, recommendation.priority),
      urgency:
        URGENCY_WEIGHT[recommendation.urgency] < URGENCY_WEIGHT[existing.urgency]
          ? recommendation.urgency
          : existing.urgency,
      reasonCodes: unique([...existing.reasonCodes, ...recommendation.reasonCodes]),
      sourceReferences: uniqueSources([
        ...existing.sourceReferences,
        ...recommendation.sourceReferences,
      ]),
      relatedFields: unique([...existing.relatedFields, ...recommendation.relatedFields]),
      relatedTools: unique([...existing.relatedTools, ...recommendation.relatedTools]),
      dependsOn: unique([...existing.dependsOn, ...recommendation.dependsOn]),
      confidenceImpact: Math.min(existing.confidenceImpact, recommendation.confidenceImpact),
      suppressed: existing.suppressed && recommendation.suppressed,
    });
  }

  return sortRecommendations([...merged.values()]);
}

export function filterSuppressedRecommendations(
  recommendations: readonly RecommendationResult[],
): readonly RecommendationResult[] {
  return deepFreeze(recommendations.filter((recommendation) => !recommendation.suppressed));
}

export function collectRecommendationEvidence(
  recommendations: readonly RecommendationResult[],
): readonly SourceReference[] {
  return deepFreeze(uniqueSources(recommendations.flatMap((item) => item.sourceReferences)));
}

export function buildRecommendations(
  input: BuildRecommendationsInput,
): readonly RecommendationResult[] {
  const recommendations: RecommendationResult[] = [];
  const suppressedIds = new Set(input.suppressedRecommendationIds ?? []);

  for (const resolution of input.unknownResolutions ?? []) {
    if (resolution.blocking || resolution.resolutionType === "alternative-question") {
      recommendations.push(createRecommendation({
        definition: input.definition,
        evaluation: input.evaluation,
        type: "collect-data",
        reasonCodes: resolution.reasonCodes,
        relatedFields: [resolution.fieldId],
        dependsOn: resolution.nextQuestionCandidate ? [resolution.nextQuestionCandidate] : [],
        confidenceImpact: resolution.confidenceImpact,
        urgency: resolution.blocking ? "high" : "medium",
      }));
    }

    if (resolution.requiresOfficialSource) {
      recommendations.push(createRecommendation({
        definition: input.definition,
        evaluation: input.evaluation,
        type: "verify-officially",
        reasonCodes: resolution.reasonCodes,
        relatedFields: [resolution.fieldId],
        confidenceImpact: resolution.confidenceImpact,
        urgency: "high",
      }));
    }
  }

  for (const inference of input.inferences ?? []) {
    recommendations.push(createRecommendation({
      definition: input.definition,
      evaluation: input.evaluation,
      type: "review-later",
      reasonCodes: inference.reasonCodes,
      sourceReferences: inference.value.evidence.sourceReferences,
      relatedFields: [inference.targetField, ...inference.sourceFields],
      dependsOn: [inference.inferenceId],
      confidenceImpact: inference.confidenceModifier,
      urgency: "low",
    }));
  }

  for (const actionType of input.definition.recommendationStrategy.expectedActionTypes) {
    const type = typeFromExpectedAction(actionType);
    if (!type) continue;

    recommendations.push(createRecommendation({
      definition: input.definition,
      evaluation: input.evaluation,
      type,
      reasonCodes: input.definition.recommendationStrategy.reasonCodes,
      sourceReferences: input.evaluation.evidence.sourceReferences,
      relatedFields: input.evaluation.evidence.inputFieldIds,
      relatedTools: input.definition.adapter.relatedTools,
      confidenceImpact: 0,
      urgency: type === "apply-officially" ? "high" : "medium",
    }));
  }

  if (input.evaluation.signal === "probably-not-relevant" || input.evaluation.status === "not-relevant") {
    recommendations.push(createRecommendation({
      definition: input.definition,
      evaluation: input.evaluation,
      type: "not-relevant-now",
      reasonCodes: input.evaluation.evidence.excludedRuleIds,
      sourceReferences: input.evaluation.evidence.sourceReferences,
      relatedFields: input.evaluation.evidence.inputFieldIds,
      confidenceImpact: 0,
      urgency: "low",
    }));
  }

  if (input.definition.reviewPolicy.nextReviewAt) {
    recommendations.push(createRecommendation({
      definition: input.definition,
      evaluation: input.evaluation,
      type: "monitor-year-change",
      reasonCodes: input.definition.reviewPolicy.reasonCodes,
      relatedTools: input.definition.adapter.relatedTools,
      confidenceImpact: 0,
      urgency: "low",
    }));
  }

  const merged = mergeRecommendations(recommendations).map((recommendation) => ({
    ...recommendation,
    suppressed: suppressedIds.has(recommendation.recommendationId),
  }));

  return filterSuppressedRecommendations(merged);
}
