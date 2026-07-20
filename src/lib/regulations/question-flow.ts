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
  QuestionCondition,
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

export type QuestionFlowCompletionState =
  | "completed"
  | "partially-completed"
  | "blocked"
  | "unresolved";

export type QuestionFlowAlternativeRouteState = {
  readonly routeId: string;
  readonly questionId: QuestionId;
  readonly fieldId?: FieldId;
  readonly labelKey: string;
  readonly descriptionKey?: string;
  readonly priority: number;
  readonly blocking: boolean;
  readonly confirmationRequired: boolean;
  readonly selected: boolean;
  readonly answered: boolean;
  readonly skipped: boolean;
  readonly reasonCodes: readonly ReasonCode[];
};

export type QuestionFlowConfirmationState = {
  readonly questionId: QuestionId;
  readonly fieldId: FieldId;
  readonly inferenceId?: InferenceId;
  readonly required: boolean;
  readonly confirmed: boolean;
  readonly reasonCodes: readonly ReasonCode[];
};

export type QuestionFlowNavigationState = {
  readonly currentQuestionId?: QuestionId;
  readonly previousQuestionId?: QuestionId;
  readonly visitedQuestionIds: readonly QuestionId[];
  readonly canGoBack: boolean;
};

export type QuestionFlowIntegrityIssue = {
  readonly code: ReasonCode;
  readonly questionIds: readonly QuestionId[];
  readonly fieldIds: readonly FieldId[];
};

export type QuestionFlowIntegrity = {
  readonly ok: boolean;
  readonly issues: readonly QuestionFlowIntegrityIssue[];
};

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
  readonly alternativeQuestions: readonly QuestionFlowAlternativeRouteState[];
  readonly officialSourceRequired: boolean;
  readonly confirmationRequired: boolean;
  readonly confirmed: boolean;
  readonly skipAllowed: boolean;
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
  readonly reason: "empty" | "next-pending" | "blocked" | "complete" | "unresolved";
  readonly completionState: QuestionFlowCompletionState;
  readonly blockingQuestionIds: readonly QuestionId[];
  readonly remainingQuestionIds: readonly QuestionId[];
  readonly unresolvedQuestionIds: readonly QuestionId[];
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
  readonly unresolvedQuestionIds: readonly QuestionId[];
  readonly alternativeRouteIds: readonly string[];
  readonly pendingConfirmationQuestionIds: readonly QuestionId[];
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
  readonly navigation: QuestionFlowNavigationState;
  readonly confirmations: readonly QuestionFlowConfirmationState[];
  readonly integrity: QuestionFlowIntegrity;
};

export type GuidedQuestionFlowInputState = {
  readonly currentQuestionId?: QuestionId;
  readonly visitedQuestionIds?: readonly QuestionId[];
  readonly selectedAlternativeRouteIds?: readonly string[];
  readonly skippedQuestionIds?: readonly QuestionId[];
  readonly confirmedQuestionIds?: readonly QuestionId[];
  readonly confirmedInferenceIds?: readonly InferenceId[];
  readonly requireInferredConfirmation?: boolean;
};

export type BuildQuestionFlowInput = {
  readonly definition: RegulationDefinition;
  readonly answers?: Readonly<Record<FieldId, AnswerState>> | readonly AnswerState[];
  readonly unknownResolutions?: readonly UnknownResolution[];
  readonly inferences?: readonly InferenceResult[];
  readonly evaluation?: RegulationEvaluationResult;
  readonly recommendations?: readonly RecommendationResult[];
  readonly activeQuestionId?: QuestionId;
  readonly flowState?: GuidedQuestionFlowInputState;
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

function confirmedQuestionIds(flowState?: GuidedQuestionFlowInputState) {
  return new Set(flowState?.confirmedQuestionIds ?? []);
}

function confirmedInferenceIds(flowState?: GuidedQuestionFlowInputState) {
  return new Set(flowState?.confirmedInferenceIds ?? []);
}

function skippedQuestionIds(flowState?: GuidedQuestionFlowInputState) {
  return new Set(flowState?.skippedQuestionIds ?? []);
}

function selectedAlternativeRouteIds(flowState?: GuidedQuestionFlowInputState) {
  return new Set(flowState?.selectedAlternativeRouteIds ?? []);
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

function confirmationState(input: {
  question: RegulationQuestionDefinition;
  answer?: AnswerState;
  inference?: InferenceResult;
  resolution?: UnknownResolution;
  flowState?: GuidedQuestionFlowInputState;
}): QuestionFlowConfirmationState {
  const confirmedQuestions = confirmedQuestionIds(input.flowState);
  const confirmedInferences = confirmedInferenceIds(input.flowState);
  const inferenceId =
    input.inference?.inferenceId ??
    (input.answer?.state === "inferred" ? input.answer.inferenceId : undefined);
  const inferred = input.answer?.state === "inferred" || Boolean(input.inference);
  const required = Boolean(
    inferred &&
      (input.flowState?.requireInferredConfirmation ||
        input.resolution?.confirmationRequired ||
        input.inference?.overwriteAllowed),
  );

  return {
    questionId: input.question.questionId,
    fieldId: input.question.fieldId,
    inferenceId,
    required,
    confirmed:
      !required ||
      confirmedQuestions.has(input.question.questionId) ||
      Boolean(inferenceId && confirmedInferences.has(inferenceId)),
    reasonCodes: required ? ["question-flow.confirm-inferred-answer"] : [],
  };
}

function alternativeRoutes(input: {
  resolution?: UnknownResolution;
  answers: Readonly<Record<FieldId, AnswerState>>;
  flowState?: GuidedQuestionFlowInputState;
}): readonly QuestionFlowAlternativeRouteState[] {
  const selected = selectedAlternativeRouteIds(input.flowState);
  const skipped = skippedQuestionIds(input.flowState);
  const candidates = input.resolution?.alternativeQuestionCandidates ??
    (input.resolution?.nextQuestionCandidate
      ? [{
          routeId: `${input.resolution.fieldId}.primary`,
          questionId: input.resolution.nextQuestionCandidate,
          fieldId: input.resolution.fieldId,
          labelKey: `${input.resolution.nextQuestionCandidate}.alternative`,
          priority: 0,
          blocking: false,
          confirmationRequired: false,
          reasonCodes: input.resolution.reasonCodes,
        }]
      : []);

  return candidates.map((route) => ({
    routeId: route.routeId,
    questionId: route.questionId,
    fieldId: route.fieldId,
    labelKey: route.labelKey,
    descriptionKey: route.descriptionKey,
    priority: route.priority,
    blocking: route.blocking,
    confirmationRequired: route.confirmationRequired,
    selected: selected.has(route.routeId),
    answered: route.fieldId ? input.answers[route.fieldId]?.state === "known" : false,
    skipped: skipped.has(route.questionId),
    reasonCodes: route.reasonCodes,
  }));
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
  flowState?: GuidedQuestionFlowInputState;
}): QuestionFlowQuestionStatus {
  if (!input.relevant) {
    return input.answer?.state === "not-applicable" ? "not-applicable" : "skipped";
  }

  if (skippedQuestionIds(input.flowState).has(input.question.questionId) && input.resolution?.skipAllowed) {
    return "skipped";
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
    if (
      input.resolution?.alternativeQuestion &&
      ((input.resolution.alternativeQuestionCandidates?.length ?? 0) > 0 ||
        Boolean(input.resolution.nextQuestionCandidate))
    ) {
      return input.resolution.blocking ? "blocked" : "pending";
    }
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
  flowState?: GuidedQuestionFlowInputState;
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
    flowState: input.flowState,
  });
  const confirmation = confirmationState({
    question: input.question,
    answer,
    inference,
    resolution,
    flowState: input.flowState,
  });
  const alternatives = alternativeRoutes({
    resolution,
    answers: input.answers,
    flowState: input.flowState,
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
    completed: isCompleted(status) && confirmation.confirmed,
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
    alternativeQuestionIds: alternatives.map((route) => route.questionId),
    alternativeQuestions: alternatives,
    officialSourceRequired: Boolean(resolution?.requiresOfficialSource),
    confirmationRequired: confirmation.required,
    confirmed: confirmation.confirmed,
    skipAllowed: Boolean(resolution?.skipAllowed),
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
  for (const question of questions) {
    if (question.answerState !== "unknown" || question.alternativeQuestions.length === 0) {
      continue;
    }
    const sortedRoutes = [...question.alternativeQuestions].sort((left, right) =>
      Number(right.selected) - Number(left.selected) ||
      left.priority - right.priority ||
      left.routeId.localeCompare(right.routeId),
    );
    const routeQuestion = sortedRoutes
      .map((route) => questions.find((candidate) => candidate.questionId === route.questionId))
      .find((candidate) => candidate && candidate.relevant && !candidate.completed);
    if (routeQuestion) {
      return routeQuestion;
    }
  }

  return questions.find((question) => question.status === "active" && question.relevant) ??
    questions.find((question) => question.status === "pending" && question.relevant) ??
    determineBlockingQuestions(questions)[0];
}

function pendingConfirmations(questions: readonly QuestionFlowQuestionState[]) {
  return questions.filter((question) => question.confirmationRequired && !question.confirmed);
}

function unresolvedQuestions(questions: readonly QuestionFlowQuestionState[]) {
  return questions.filter((question) =>
    question.relevant &&
    !question.completed &&
    question.status !== "blocked" &&
    (
      question.alternativeQuestions.length > 0 ||
      question.officialSourceRequired ||
      question.confirmationRequired
    )
  );
}

function completionState(questions: readonly QuestionFlowQuestionState[]): QuestionFlowCompletionState {
  if (questions.length === 0) {
    return "completed";
  }
  if (determineBlockingQuestions(questions).length > 0) {
    return "blocked";
  }
  if (unresolvedQuestions(questions).length > 0 || pendingConfirmations(questions).length > 0) {
    return "unresolved";
  }
  if (determineRemainingQuestions(questions).length > 0) {
    return "partially-completed";
  }

  return "completed";
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
  const unresolved = unresolvedQuestions(questions);
  const next = determineNextQuestion(questions);
  const state = completionState(questions);
  const reason = questions.length === 0
    ? "empty"
    : next?.status === "blocked"
      ? "blocked"
      : state === "unresolved" && !next
        ? "unresolved"
      : next
        ? "next-pending"
        : "complete";

  return deepFreeze({
    nextQuestionId: next?.questionId,
    nextFieldId: next?.fieldId,
    reason,
    completionState: state,
    blockingQuestionIds: blocking.map((question) => question.questionId),
    remainingQuestionIds: remaining.map((question) => question.questionId),
    unresolvedQuestionIds: unresolved.map((question) => question.questionId),
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
  const unresolved = unresolvedQuestions(questions);
  const pendingConfirmation = pendingConfirmations(questions);
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
    unresolvedQuestionIds: unresolved.map((question) => question.questionId),
    alternativeRouteIds: questions.flatMap((question) =>
      question.alternativeQuestions.map((route) => route.routeId),
    ),
    pendingConfirmationQuestionIds: pendingConfirmation.map((question) => question.questionId),
    reasonCodes: sortStrings(reasonCodes),
    confidenceImpact: questions.reduce((sum, question) => sum + question.confidenceImpact, 0),
    sourceReferences,
    recommendationIds: recommendations.map((recommendation) => recommendation.recommendationId),
  });
}

function conditionFieldIds(condition: QuestionCondition | undefined): readonly FieldId[] {
  if (!condition) {
    return [];
  }
  if ("fieldId" in condition) {
    return [condition.fieldId];
  }

  return condition.conditions.flatMap(conditionFieldIds);
}

function buildDependencyIntegrity(
  definitions: readonly RegulationQuestionDefinition[],
  resolutions: readonly UnknownResolution[],
): QuestionFlowIntegrity {
  const byField = new Map<FieldId, QuestionId>();
  for (const question of definitions) {
    byField.set(question.fieldId, question.questionId);
  }

  const graph = new Map<QuestionId, Set<QuestionId>>();
  for (const question of definitions) {
    const dependencyQuestionIds = [
      ...question.dependsOn,
      ...conditionFieldIds(question.condition),
    ]
      .map((fieldId) => byField.get(fieldId))
      .filter((questionId): questionId is QuestionId => Boolean(questionId));
    graph.set(question.questionId, new Set(dependencyQuestionIds));
  }

  for (const resolution of resolutions) {
    const sourceQuestionId = byField.get(resolution.fieldId);
    if (!sourceQuestionId) continue;
    const existing = graph.get(sourceQuestionId) ?? new Set<QuestionId>();
    for (const alternative of resolution.alternativeQuestionCandidates ?? []) {
      existing.add(alternative.questionId);
    }
    graph.set(sourceQuestionId, existing);
  }

  const issues: QuestionFlowIntegrityIssue[] = [];
  const visiting = new Set<QuestionId>();
  const visited = new Set<QuestionId>();
  const stack: QuestionId[] = [];

  function visit(questionId: QuestionId) {
    if (visiting.has(questionId)) {
      const cycle = stack.slice(stack.indexOf(questionId)).concat(questionId);
      issues.push({
        code: "question-flow.circular-dependency",
        questionIds: cycle,
        fieldIds: cycle
          .map((item) => definitions.find((question) => question.questionId === item)?.fieldId)
          .filter((fieldId): fieldId is FieldId => Boolean(fieldId)),
      });
      return;
    }
    if (visited.has(questionId)) {
      return;
    }

    visiting.add(questionId);
    stack.push(questionId);
    for (const dependency of graph.get(questionId) ?? []) {
      visit(dependency);
    }
    stack.pop();
    visiting.delete(questionId);
    visited.add(questionId);
  }

  for (const question of definitions) {
    visit(question.questionId);
  }

  return deepFreeze({
    ok: issues.length === 0,
    issues,
  });
}

function buildNavigation(
  questions: readonly QuestionFlowQuestionState[],
  flowState?: GuidedQuestionFlowInputState,
): QuestionFlowNavigationState {
  const visited = flowState?.visitedQuestionIds ?? [];
  const current = flowState?.currentQuestionId ?? determineNextQuestion(questions)?.questionId;

  return deepFreeze({
    currentQuestionId: current,
    previousQuestionId: visited.at(-1),
    visitedQuestionIds: visited,
    canGoBack: visited.length > 0,
  });
}

function buildConfirmations(questions: readonly QuestionFlowQuestionState[]): readonly QuestionFlowConfirmationState[] {
  return deepFreeze(questions
    .filter((question) => question.confirmationRequired || !question.confirmed)
    .map((question) => ({
      questionId: question.questionId,
      fieldId: question.fieldId,
      inferenceId: question.inference?.inferenceId,
      required: question.confirmationRequired,
      confirmed: question.confirmed,
      reasonCodes: question.confirmationRequired ? ["question-flow.confirm-inferred-answer"] : [],
    })));
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
      flowState: input.flowState,
    }),
  );
  const questions = applyActiveQuestion(baseQuestions, input.activeQuestionId);
  const integrity = buildDependencyIntegrity(
    input.definition.questionDefinitions,
    input.unknownResolutions ?? [],
  );

  return deepFreeze({
    regulationId: input.definition.regulationId,
    steps: buildSteps(input.definition.questionDefinitions, questions),
    questions,
    groups: buildGroups(questions),
    decision: buildDecision(questions),
    progress: determineProgress(questions),
    summary: buildSummary(questions, input.recommendations ?? [], input.evaluation),
    navigation: buildNavigation(questions, input.flowState),
    confirmations: buildConfirmations(questions),
    integrity,
  });
}
