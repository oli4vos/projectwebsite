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
export { evaluateRegulation } from "@/lib/regulations/evaluator";
export { createEstimateRange } from "@/lib/regulations/estimate";
export { mergeCalculationEvidence } from "@/lib/regulations/evidence";
export type {
  RegulationDefinition,
  RegulationEvaluationContext,
} from "@/lib/regulations/evaluator";
export type * from "@/lib/regulations/types";
