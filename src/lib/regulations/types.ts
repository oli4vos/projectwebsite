import type { SourceReference } from "@/lib/financial-constants";

export type RegulationId = string;
export type RuleId = string;
export type QuestionId = string;
export type FieldId = string;
export type InferenceId = string;
export type RecommendationId = string;
export type ActionId = string;
export type SourceReferenceId = string;
export type ReasonCode = string;
export type ToolId = string;

export type ResultOk<T> = { ok: true; value: T };
export type ResultErr = { ok: false; errors: readonly ReasonCode[] };
export type Result<T> = ResultOk<T> | ResultErr;

export type AnswerState<T = unknown> =
  | { state: "known"; fieldId: FieldId; value: T; source?: "user" | "adapter" }
  | { state: "unknown"; fieldId: FieldId; reasonCodes: readonly ReasonCode[] }
  | { state: "inferred"; fieldId: FieldId; value: T; inferenceId: InferenceId; overridable: boolean }
  | { state: "not-applicable"; fieldId: FieldId; reasonCodes: readonly ReasonCode[] }
  | { state: "skipped"; fieldId: FieldId; reasonCodes: readonly ReasonCode[] };

export type ConfidenceScore = number;
export type ConfidenceLabel =
  | "very-low"
  | "low"
  | "medium"
  | "high"
  | "very-high";

export type ConfidenceFactor = {
  readonly factorId: string;
  readonly impact: number;
  readonly reasonCode: ReasonCode;
  readonly fieldId?: FieldId;
  readonly ruleId?: RuleId;
  readonly sourceReferenceId?: SourceReferenceId;
};

/** Confidence is the quality of the Project Site estimate, not legal entitlement probability. */
export type ConfidenceAssessment = {
  readonly score: ConfidenceScore;
  readonly label: ConfidenceLabel;
  readonly factors: readonly ConfidenceFactor[];
  readonly missingFields: readonly FieldId[];
  readonly uncertaintyCodes: readonly ReasonCode[];
  readonly explanationCodes: readonly ReasonCode[];
};

export type Uncertainty = {
  readonly code: ReasonCode;
  readonly severity: "info" | "warning" | "blocking";
  readonly reasonCode: ReasonCode;
  readonly fieldIds: readonly FieldId[];
  readonly confidenceImpact: number;
  readonly estimateRangeImpact: "none" | "widen" | "blocks-estimate";
  readonly officialVerificationRequired: boolean;
};

export type EstimateUnit = "currency" | "percentage" | "count" | "duration" | "custom";
export type EstimatePeriod = "once" | "month" | "year" | "custom";

/** Financial amounts may only be shown through an explicit range with confidence and evidence. */
export type EstimateRange = {
  readonly minimum: number;
  readonly likely: number;
  readonly maximum: number;
  readonly unit: EstimateUnit;
  readonly customUnit?: string;
  readonly period: EstimatePeriod;
  readonly customPeriod?: string;
  readonly sourceYear: number;
  readonly confidence: ConfidenceAssessment;
  readonly assumptions: readonly ReasonCode[];
  readonly uncertaintyCodes: readonly ReasonCode[];
  readonly sourceReferences: readonly SourceReference[];
  readonly explanationCodes: readonly ReasonCode[];
};

export type InferenceInputReference = {
  readonly fieldId: FieldId;
  readonly answerState: AnswerState["state"];
};

export type InferenceMethod =
  | "direct-mapping"
  | "arithmetic"
  | "category-mapping"
  | "domain-adapter"
  | "manual-review";

export type InferenceEvidence = {
  readonly evidenceId: string;
  readonly ruleIds: readonly RuleId[];
  readonly sourceReferences: readonly SourceReference[];
  readonly reasonCodes: readonly ReasonCode[];
};

/** Inferred values are traceable and overridable; they are not direct user answers. */
export type InferredValue<T = unknown> = {
  readonly inferenceId: InferenceId;
  readonly targetFieldId: FieldId;
  readonly value: T;
  readonly inputReferences: readonly InferenceInputReference[];
  readonly method: InferenceMethod;
  readonly confidence: ConfidenceAssessment;
  readonly evidence: InferenceEvidence;
  readonly overridable: boolean;
  readonly reasonCodes: readonly ReasonCode[];
  readonly referenceDate?: string;
};

export type QuestionCondition =
  | { type: "equals"; fieldId: FieldId; value: unknown }
  | { type: "not-equals"; fieldId: FieldId; value: unknown }
  | { type: "in"; fieldId: FieldId; values: readonly unknown[] }
  | { type: "exists"; fieldId: FieldId }
  | { type: "known"; fieldId: FieldId }
  | { type: "unknown"; fieldId: FieldId }
  | { type: "not-applicable"; fieldId: FieldId }
  | { type: "all"; conditions: readonly QuestionCondition[] }
  | { type: "any"; conditions: readonly QuestionCondition[] };

export type QuestionDependency = {
  readonly dependsOn: readonly FieldId[];
  readonly condition: QuestionCondition;
  readonly requiredWhen: "always" | "when-condition-true" | "never";
  readonly confidenceGain: number;
  readonly enablesInferences: readonly InferenceId[];
  readonly blocksRules: readonly RuleId[];
  readonly skipReason?: ReasonCode;
};

export type FollowUpQuestion = {
  readonly questionId: QuestionId;
  readonly targetFieldId: FieldId;
  readonly dependencies: readonly QuestionDependency[];
  readonly priority: number;
};

export type QuestionResolution = {
  readonly questionId: QuestionId;
  readonly visible: boolean;
  readonly required: boolean;
  readonly skipReason?: ReasonCode;
  readonly confidenceGain: number;
  readonly enablesInferences: readonly InferenceId[];
  readonly blocksRules: readonly RuleId[];
};

export type ScenarioComplexityLevel = "simple" | "normal" | "complex" | "very-complex";

/** Complexity lowers confidence or changes actions; it does not by itself stop evaluation. */
export type ScenarioComplexity = {
  readonly level: ScenarioComplexityLevel;
  readonly reasonCodes: readonly ReasonCode[];
  readonly affectedRegulationIds: readonly RegulationId[];
  readonly affectedRuleIds: readonly RuleId[];
  readonly confidenceImpact: number;
  readonly officialVerificationRecommended: boolean;
};

export type RecommendationType =
  | "collect-data"
  | "verify"
  | "consider"
  | "monitor"
  | "open-tool";

export type RecommendationUrgency = "low" | "medium" | "high" | "time-sensitive";

export type SafeTargetReference = {
  readonly type: "official-source" | "project-tool" | "internal-reference";
  readonly targetId: string;
};

export type Recommendation = {
  readonly recommendationId: RecommendationId;
  readonly type: RecommendationType;
  readonly reasonCodes: readonly ReasonCode[];
  readonly confidence: ConfidenceAssessment;
  readonly urgency: RecommendationUrgency;
  readonly dependencies: readonly FieldId[];
  readonly nextSteps: readonly ActionId[];
  readonly sourceReferences: readonly SourceReference[];
  readonly validUntil?: string;
  readonly relatedTools: readonly ToolId[];
};

export type ActionType =
  | "collect-data"
  | "verify-officially"
  | "run-project-tool"
  | "apply-officially"
  | "monitor-year-change"
  | "review-later"
  | "not-relevant-now";

export type ActionPlanItem = {
  readonly actionId: ActionId;
  readonly type: ActionType;
  readonly priority: number;
  readonly urgency?: RecommendationUrgency;
  readonly reasonCodes: readonly ReasonCode[];
  readonly requiredFieldIds: readonly FieldId[];
  readonly sourceReferences: readonly SourceReference[];
  readonly target?: SafeTargetReference;
  readonly deadline?: string;
  readonly validUntil?: string;
  readonly relatedTool?: ToolId;
  readonly blocking: boolean;
};

export type CalculationEvidence = {
  readonly usedRuleIds: readonly RuleId[];
  readonly sourceReferences: readonly SourceReference[];
  readonly inputFieldIds: readonly FieldId[];
  readonly inferredValueIds: readonly InferenceId[];
  readonly assumptions: readonly ReasonCode[];
  readonly excludedRuleIds: readonly RuleId[];
  readonly missingFieldIds: readonly FieldId[];
  readonly confidenceFactorIds: readonly string[];
  readonly uncertaintyCodes: readonly ReasonCode[];
  readonly validity: {
    readonly effectiveFrom?: string;
    readonly effectiveTo?: string;
    readonly referenceDate?: string;
  };
};

export type RegulationEvaluationStatus =
  | "not-evaluated"
  | "not-relevant"
  | "possibly-relevant"
  | "estimate-available"
  | "official-verification-required"
  | "insufficient-data";

export type RegulationSignal =
  | "not-modeled"
  | "insufficient-information"
  | "probably-not-relevant"
  | "possibly-relevant"
  | "official-check-needed";

export type OfficialVerification = {
  readonly required: boolean;
  readonly reasonCodes: readonly ReasonCode[];
  readonly sourceReferences: readonly SourceReference[];
};

export type RegulationEvaluationResult = {
  readonly regulationId: RegulationId;
  readonly status: RegulationEvaluationStatus;
  readonly signal: RegulationSignal;
  readonly estimateRange?: EstimateRange;
  readonly confidence: ConfidenceAssessment;
  readonly uncertainties: readonly Uncertainty[];
  readonly evidence: CalculationEvidence;
  readonly recommendations: readonly Recommendation[];
  readonly actionPlan: readonly ActionPlanItem[];
  readonly complexity: ScenarioComplexity;
  readonly sourceYear: number;
  readonly validity: CalculationEvidence["validity"];
  readonly officialVerification: OfficialVerification;
};
