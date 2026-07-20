import type { SourceReference } from "@/lib/financial-constants";
import { evaluateQuestionCondition } from "@/lib/regulations/dependencies";
import type {
  RegulationDefinition,
  RegulationQuestionDefinition,
} from "@/lib/regulations/definition";
import type { RecommendationResult } from "@/lib/regulations/recommendations";
import type {
  AnswerState,
  FieldId,
  InferenceId,
  QuestionId,
  ReasonCode,
  RegulationEvaluationResult,
  RegulationId,
  RuleId,
} from "@/lib/regulations/types";
import type { InferenceResult, UnknownResolution } from "@/lib/regulations/unknown";

export type QuestionFlowQuestionStatus =
  | "pending"
  | "active"
  | "answered"
  | "inferred"
  | "skipped"
  | "blocked"
  | "not-applicable";

export type QuestionFlowQuestionState = {
  readonly questionId: QuestionId;
  readonly fieldId: FieldId;
  readonly status: QuestionFlowQuestionStatus;
  readonly relevant: boolean;
  readonly required: boolean;
  readonly blocking: boolean;
  readonly completed: boolean;
  readonly order: number;
  readonly groupId: string;
  readonly groupLabel?: string;
  readonly answerState?: AnswerState["state"];
  readonly reasonCodes: readonly ReasonCode[];
  readonly skipReasonCodes: readonly ReasonCode[];
  readonly confidenceImpact: number;
  readonly enablesInferences: readonly InferenceId[];
  readonly blocksRules: readonly RuleId[];
  readonly alternativeQuestionIds: readonly QuestionId[];
  readonly officialSourceRequired: boolean;
  readonly unknownResolution?: UnknownResolution;
  readonly inference?: InferenceResult;
  readonly recommendations: readonly RecommendationResult[];
  readonly sourceReferences: readonly SourceReference[];
};

export type QuestionFlowStep = {
  readonly questionId: QuestionId;
  readonly fieldId: FieldId;
  readonly status: QuestionFlowQuestionStatus;
  readonly required: boolean;
  readonly groupId: string;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly reasonCodes: readonly ReasonCode[];
};

export type QuestionFlowDecision = {
  readonly nextQuestionId?: QuestionId;
  readonly nextFieldId?: FieldId;
  readonly reason: "empty" | "next-pending" | "blocked" | "complete";
  readonly blockingQuestionIds: readonly QuestionId[];
  readonly remainingQuestionIds: readonly QuestionId[];
};

export type QuestionFlowProgress = {
  readonly totalRelevant: number;
  readonly completed: number;
  readonly answered: number;
  readonly inferred: number;
  readonly skipped: number;
  readonly blocked: number;
  readonly remaining: number;
  readonly percentage: number;
};

export type QuestionFlowGroup = {
  readonly groupId: string;
  readonly label?: string;
  readonly order: number;
  readonly questionIds: readonly QuestionId[];
  readonly relevantQuestionIds: readonly QuestionId[];
  readonly completedQuestionIds: readonly QuestionId[];
  readonly activeQuestionId?: QuestionId;
};

export type QuestionFlowSummary = {
  readonly askedQuestionIds: readonly QuestionId[];
  readonly answeredQuestionIds: readonly QuestionId[];
  readonly inferredQuestionIds: readonly QuestionId[];
  readonly skippedQuestionIds: readonly QuestionId[];
  readonly notApplicableQuestionIds: readonly QuestionId[];
  readonly blockingQuestionIds: readonly QuestionId[];
  readonly missingBlockingFieldIds: readonly FieldId[];
  readonly remainingQuestionIds: readonly QuestionId[];
  readonly reasonCodes: readonly ReasonCode[];
  readonly confidenceImpact: number;
  readonly sourceReferences: readonly SourceReference[];
  readonly recommendationIds: readonly string[];
};

export type QuestionFlowState = {
  readonly regulationId: RegulationId;
  readonly steps: readonly QuestionFlowStep[];
  readonly questions: readonly QuestionFlowQuestionState[];
  readonly groups: readonly QuestionFlowGroup[];
  readonly decision: QuestionFlowDecision;
  readonly progress: QuestionFlowProgress;
  readonly summary: QuestionFlowSummary;
};

export type BuildQuestionFlowInput = {
  readonly definition: RegulationDefinition;
  readonly answers?: Readonly<Record<FieldId, AnswerState>> | readonly AnswerState[];
  readonly unknownResolutions?: readonly UnknownResolution[];
  readonly inferences?: readonly InferenceResult[];
  readonly evaluation?: RegulationEvaluationResult;
  readonly recommendations?: readonly RecommendationResult[];
  readonly activeQuestionId?: QuestionId;
};

const DEFAULT_GROUP_ID = "default";

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

function answerMap(
  answers: Readonly<Record<FieldId, AnswerState>> | readonly AnswerState[] | undefined,
): Readonly<Record<FieldId, AnswerState>> {
  if (!answers) {
    return {};
  }

  if (Array.isArray(answers)) {
    return Object.fromEntries(answers.map((answer) => [answer.fieldId, answer]));
  }

  return { ...(answers as Readonly<Record<FieldId, AnswerState>>) };
}

function unique<T>(values: readonly T[]) {
  return [...new Set(values)];
}

function uniqueSources(sources: readonly SourceReference[]) {
  const seen = new Set<string>();

  return sources.filter((source) => {
    const key = `${source.datasetId}:${source.version}:${source.sourceUrl}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function sortStrings(values: readonly string[]) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function relatedRecommendations(
  recommendations: readonly RecommendationResult[],
  question: RegulationQuestionDefinition,
) {
  return recommendations
    .filter((recommendation) =>
      recommendation.relatedFields.includes(question.fieldId) ||
      recommendation.dependsOn.includes(question.questionId),
    )
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }
      return left.recommendationId.localeCompare(right.recommendationId);
    });
}

function relatedInference(
  inferences: readonly InferenceResult[],
  fieldId: FieldId,
) {
  return inferences.find((inference) => inference.targetField === fieldId);
}

function resolutionForField(
  resolutions: readonly UnknownResolution[],
  fieldId: FieldId,
) {
  return resolutions.find((resolution) => resolution.fieldId === fieldId);
}

function conditionMetadata(
  question: RegulationQuestionDefinition,
  answers: Readonly<Record<FieldId, AnswerState>>,
) {
  if (!question.condition) {
    return {
      relevant: true,
      required: question.requiredWhen === "always" || question.requiredWhen === "when-condition-true",
      skipReasonCodes: [] as ReasonCode[],
    };
  }

  const matches = evaluateQuestionCondition(question.condition, answers);
  const relevant = question.requiredWhen === "always" || matches;
  const required =
    question.requiredWhen === "always" ||
    (question.requiredWhen === "when-condition-true" && matches);

  return {
    relevant,
    required,
    skipReasonCodes: relevant ? [] : [`skipped:${question.questionId}`],
  };
}

function statusForQuestion(input: {
  question: RegulationQuestionDefinition;
  answer?: AnswerState;
  relevant: boolean;
  required: boolean;
  resolution?: UnknownResolution;
  inference?: InferenceResult;
}): QuestionFlowQuestionStatus {
  if (!input.relevant) {
    return input.answer?.state === "not-applicable" ? "not-applicable" : "skipped";
  }

  if (input.answer?.state === "known") {
    return "answered";
  }

  if (input.answer?.state === "inferred" || input.inference) {
    return "inferred";
  }

  if (input.answer?.state === "not-applicable") {
    return "not-applicable";
  }

  if (input.answer?.state === "skipped") {
    return "skipped";
  }

  if (input.answer?.state === "unknown") {
    return input.resolution?.blocking ? "blocked" : "answered";
  }

  return "pending";
}

function isCompleted(status: QuestionFlowQuestionStatus) {
  // Inferred, skipped and not-applicable questions count as completed because no
  // immediate user answer is needed; blocking unknowns do not count as complete.
  return status === "answered" || status === "inferred" || status === "skipped" ||
    status === "not-applicable";
}

function applyActiveQuestion(
  questions: readonly QuestionFlowQuestionState[],
  activeQuestionId?: QuestionId,
) {
  const activeId = activeQuestionId ?? determineNextQuestion(questions)?.questionId;

  return questions.map((question) => ({
    ...question,
    status: question.questionId === activeId && question.status === "pending"
      ? "active"
      : question.status,
  }));
}

function buildQuestionState(input: {
  definition: RegulationDefinition;
  question: RegulationQuestionDefinition;
  order: number;
  answers: Readonly<Record<FieldId, AnswerState>>;
  unknownResolutions: readonly UnknownResolution[];
  inferences: readonly InferenceResult[];
  recommendations: readonly RecommendationResult[];
}): QuestionFlowQuestionState {
  const answer = input.answers[input.question.fieldId];
  const condition = conditionMetadata(input.question, input.answers);
  const resolution = resolutionForField(input.unknownResolutions, input.question.fieldId);
  const inference = relatedInference(input.inferences, input.question.fieldId);
  const recommendations = relatedRecommendations(input.recommendations, input.question);
  const status = statusForQuestion({
    question: input.question,
    answer,
    relevant: condition.relevant,
    required: condition.required,
    resolution,
    inference,
  });
  const reasonCodes = unique([
    ...input.question.evidenceContribution,
    ...(answer && "reasonCodes" in answer ? answer.reasonCodes : []),
    ...(resolution?.reasonCodes ?? []),
    ...(inference?.reasonCodes ?? []),
    ...recommendations.flatMap((recommendation) => recommendation.reasonCodes),
  ]);
  const sourceReferences = uniqueSources([
    ...input.definition.sourceReferences,
    ...(inference?.value.evidence.sourceReferences ?? []),
    ...recommendations.flatMap((recommendation) => recommendation.sourceReferences),
  ]);

  return {
    questionId: input.question.questionId,
    fieldId: input.question.fieldId,
    status,
    relevant: condition.relevant,
    required: condition.required,
    blocking: status === "blocked",
    completed: isCompleted(status),
    order: input.order,
    groupId: input.question.groupId ?? DEFAULT_GROUP_ID,
    groupLabel: input.question.groupLabel,
    answerState: answer?.state,
    reasonCodes,
    skipReasonCodes: unique(condition.skipReasonCodes),
    confidenceImpact:
      input.question.confidenceImpact +
      (resolution?.confidenceImpact ?? 0) +
      (inference?.confidenceModifier ?? 0) +
      recommendations.reduce((sum, recommendation) => sum + recommendation.confidenceImpact, 0),
    enablesInferences: inference ? [inference.inferenceId] : [],
    blocksRules: [],
    alternativeQuestionIds: resolution?.nextQuestionCandidate
      ? [resolution.nextQuestionCandidate]
      : [],
    officialSourceRequired: Boolean(resolution?.requiresOfficialSource),
    unknownResolution: resolution,
    inference,
    recommendations,
    sourceReferences,
  };
}

export function determineCompletedQuestions(
  questions: readonly QuestionFlowQuestionState[],
): readonly QuestionFlowQuestionState[] {
  return deepFreeze(questions.filter((question) => question.completed));
}

export function determineSkippedQuestions(
  questions: readonly QuestionFlowQuestionState[],
): readonly QuestionFlowQuestionState[] {
  return deepFreeze(questions.filter((question) => question.status === "skipped"));
}

export function determineBlockingQuestions(
  questions: readonly QuestionFlowQuestionState[],
): readonly QuestionFlowQuestionState[] {
  return deepFreeze(questions.filter((question) => question.status === "blocked"));
}

export function determineRemainingQuestions(
  questions: readonly QuestionFlowQuestionState[],
): readonly QuestionFlowQuestionState[] {
  return deepFreeze(
    questions.filter((question) => question.relevant && !question.completed),
  );
}

export function determineNextQuestion(
  questions: readonly QuestionFlowQuestionState[],
): QuestionFlowQuestionState | undefined {
  return questions.find((question) => question.status === "active" && question.relevant) ??
    questions.find((question) => question.status === "pending" && question.relevant) ??
    determineBlockingQuestions(questions)[0];
}

export function determineProgress(
  questions: readonly QuestionFlowQuestionState[],
): QuestionFlowProgress {
  const relevant = questions.filter((question) => question.relevant);
  const completed = determineCompletedQuestions(relevant);
  const answered = relevant.filter((question) => question.status === "answered");
  const inferred = relevant.filter((question) => question.status === "inferred");
  const skipped = relevant.filter((question) => question.status === "skipped");
  const blocked = determineBlockingQuestions(relevant);
  const remaining = determineRemainingQuestions(relevant);

  return deepFreeze({
    totalRelevant: relevant.length,
    completed: completed.length,
    answered: answered.length,
    inferred: inferred.length,
    skipped: skipped.length,
    blocked: blocked.length,
    remaining: remaining.length,
    percentage: relevant.length === 0
      ? 100
      : Math.round((completed.length / relevant.length) * 100),
  });
}

function buildGroups(questions: readonly QuestionFlowQuestionState[]): readonly QuestionFlowGroup[] {
  const groups = new Map<string, QuestionFlowQuestionState[]>();

  for (const question of questions) {
    const existing = groups.get(question.groupId) ?? [];
    groups.set(question.groupId, [...existing, question]);
  }

  return deepFreeze([...groups.entries()].map(([groupId, groupQuestions], index) => ({
    groupId,
    label: groupQuestions.find((question) => question.groupLabel)?.groupLabel,
    order: index,
    questionIds: groupQuestions.map((question) => question.questionId),
    relevantQuestionIds: groupQuestions
      .filter((question) => question.relevant)
      .map((question) => question.questionId),
    completedQuestionIds: groupQuestions
      .filter((question) => question.completed)
      .map((question) => question.questionId),
    activeQuestionId: groupQuestions.find((question) => question.status === "active")?.questionId,
  })));
}

function buildDecision(questions: readonly QuestionFlowQuestionState[]): QuestionFlowDecision {
  const remaining = determineRemainingQuestions(questions);
  const blocking = determineBlockingQuestions(questions);
  const next = determineNextQuestion(questions);
  const reason = questions.length === 0
    ? "empty"
    : next?.status === "blocked"
      ? "blocked"
      : next
        ? "next-pending"
        : "complete";

  return deepFreeze({
    nextQuestionId: next?.questionId,
    nextFieldId: next?.fieldId,
    reason,
    blockingQuestionIds: blocking.map((question) => question.questionId),
    remainingQuestionIds: remaining.map((question) => question.questionId),
  });
}

function buildSteps(
  definitions: readonly RegulationQuestionDefinition[],
  questions: readonly QuestionFlowQuestionState[],
): readonly QuestionFlowStep[] {
  return deepFreeze(questions.map((question) => {
    const definition = definitions[question.order];

    return {
      questionId: question.questionId,
      fieldId: question.fieldId,
      status: question.status,
      required: question.required,
      groupId: question.groupId,
      titleKey: definition.titleKey,
      descriptionKey: definition.descriptionKey,
      reasonCodes: question.reasonCodes,
    };
  }));
}

function buildSummary(
  questions: readonly QuestionFlowQuestionState[],
  recommendations: readonly RecommendationResult[],
  evaluation?: RegulationEvaluationResult,
): QuestionFlowSummary {
  const remaining = determineRemainingQuestions(questions);
  const blocking = determineBlockingQuestions(questions);
  const reasonCodes = unique([
    ...questions.flatMap((question) => question.reasonCodes),
    ...questions.flatMap((question) => question.skipReasonCodes),
    ...(evaluation?.confidence.uncertaintyCodes ?? []),
    ...(evaluation?.confidence.explanationCodes ?? []),
    ...(evaluation?.evidence.assumptions ?? []),
    ...(evaluation?.evidence.uncertaintyCodes ?? []),
  ]);
  const sourceReferences = uniqueSources([
    ...questions.flatMap((question) => question.sourceReferences),
    ...(evaluation?.evidence.sourceReferences ?? []),
  ]);

  return deepFreeze({
    askedQuestionIds: questions
      .filter((question) => question.relevant)
      .map((question) => question.questionId),
    answeredQuestionIds: questions
      .filter((question) => question.status === "answered")
      .map((question) => question.questionId),
    inferredQuestionIds: questions
      .filter((question) => question.status === "inferred")
      .map((question) => question.questionId),
    skippedQuestionIds: questions
      .filter((question) => question.status === "skipped")
      .map((question) => question.questionId),
    notApplicableQuestionIds: questions
      .filter((question) => question.status === "not-applicable")
      .map((question) => question.questionId),
    blockingQuestionIds: blocking.map((question) => question.questionId),
    missingBlockingFieldIds: blocking.map((question) => question.fieldId),
    remainingQuestionIds: remaining.map((question) => question.questionId),
    reasonCodes: sortStrings(reasonCodes),
    confidenceImpact: questions.reduce((sum, question) => sum + question.confidenceImpact, 0),
    sourceReferences,
    recommendationIds: recommendations.map((recommendation) => recommendation.recommendationId),
  });
}

export function buildQuestionFlow(input: BuildQuestionFlowInput): QuestionFlowState {
  const answers = answerMap(input.answers);
  const baseQuestions = input.definition.questionDefinitions.map((question, order) =>
    buildQuestionState({
      definition: input.definition,
      question,
      order,
      answers,
      unknownResolutions: input.unknownResolutions ?? [],
      inferences: input.inferences ?? [],
      recommendations: input.recommendations ?? [],
    }),
  );
  const questions = applyActiveQuestion(baseQuestions, input.activeQuestionId);

  return deepFreeze({
    regulationId: input.definition.regulationId,
    steps: buildSteps(input.definition.questionDefinitions, questions),
    questions,
    groups: buildGroups(questions),
    decision: buildDecision(questions),
    progress: determineProgress(questions),
    summary: buildSummary(questions, input.recommendations ?? [], input.evaluation),
  });
}
