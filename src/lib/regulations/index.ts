export {
  createInferredAnswer,
  createKnownAnswer,
  createUnknownAnswer,
  getDirectKnownValue,
  isInferredAnswer,
  isKnownAnswer,
  isUnknownAnswer,
  overrideInferredAnswer,
} from "@/lib/regulations/answers";
export { sortActionPlan } from "@/lib/regulations/actions";
export {
  buildConfidenceAssessment,
  CONFIDENCE_LABEL_RANGES,
  getConfidenceLabel,
  isValidConfidenceScore,
  normalizeConfidenceScore,
} from "@/lib/regulations/confidence";
export {
  evaluateQuestionCondition,
  resolveFollowUpQuestion,
} from "@/lib/regulations/dependencies";
export { createRegulationDefinition } from "@/lib/regulations/definition";
export { evaluateRegulation } from "@/lib/regulations/evaluator";
export {
  createUnavailableEstimateResult,
  createEstimateResult,
  mergeEstimateRanges,
  mergeEstimateResults,
  propagateEstimateConfidence,
} from "@/lib/regulations/estimate-engine";
export { createEstimateRange } from "@/lib/regulations/estimate";
export { mergeCalculationEvidence } from "@/lib/regulations/evidence";
export {
  collectInferenceEvidence,
  filterBlockingUnknowns,
  mergeResolvedAnswers,
  resolveRegulationInputs,
  resolveUnknownFields,
  runInference,
} from "@/lib/regulations/unknown";
export {
  buildRecommendations,
  collectRecommendationEvidence,
  filterSuppressedRecommendations,
  mergeRecommendations,
  sortRecommendations,
} from "@/lib/regulations/recommendations";
export {
  buildQuestionFlow,
  determineBlockingQuestions,
  determineCompletedQuestions,
  determineNextQuestion,
  determineProgress,
  determineRemainingQuestions,
  determineSkippedQuestions,
} from "@/lib/regulations/question-flow";
export type {
  RegulationAdapterMetadata,
  RegulationDefinitionMetadata,
  RegulationDomain,
  RegulationCategory,
  RegulationEstimateStrategy,
  RegulationEvidenceStrategy,
  RegulationFieldDatatype,
  RegulationFieldValidationType,
  RegulationInferenceMetadata,
  RegulationInputDefinition,
  RegulationQuestionDefinition,
  RegulationRecommendationStrategy,
  RegulationReviewPolicy,
  RegulationUnknownStrategy,
} from "@/lib/regulations/definition";
export type {
  InferenceCandidate,
  InferenceResult,
  ResolutionPipelineResult,
  UnknownResolution,
  UnknownResolutionType,
} from "@/lib/regulations/unknown";
export type {
  BuildRecommendationsInput,
  RecommendationResult,
} from "@/lib/regulations/recommendations";
export type {
  BuildQuestionFlowInput,
  QuestionFlowDecision,
  QuestionFlowGroup,
  QuestionFlowProgress,
  QuestionFlowQuestionState,
  QuestionFlowQuestionStatus,
  QuestionFlowState,
  QuestionFlowStep,
  QuestionFlowSummary,
} from "@/lib/regulations/question-flow";
export type {
  RegulationDefinition,
  RegulationEvaluationContext,
} from "@/lib/regulations/evaluator";
export type {
  ConfidenceLevel,
  EstimateAvailability,
  EstimateResult,
  EstimateSource,
  EstimateStrategy,
} from "@/lib/regulations/estimate-engine";
export type * from "@/lib/regulations/types";
