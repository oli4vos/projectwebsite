import type {
  AnswerState,
  QuestionCondition,
  QuestionDependency,
  QuestionResolution,
  FollowUpQuestion,
} from "@/lib/regulations/types";

export type AnswerStateMap = Readonly<Record<string, AnswerState>>;

function getAnswer(answers: AnswerStateMap, fieldId: string) {
  return answers[fieldId];
}

function answerValue(answer: AnswerState | undefined) {
  return answer?.state === "known" || answer?.state === "inferred" ? answer.value : undefined;
}

export function evaluateQuestionCondition(
  condition: QuestionCondition,
  answers: AnswerStateMap,
): boolean {
  const answer = "fieldId" in condition ? getAnswer(answers, condition.fieldId) : undefined;

  switch (condition.type) {
    case "equals":
      return answerValue(answer) === condition.value;
    case "not-equals":
      return answerValue(answer) !== condition.value;
    case "in":
      return condition.values.includes(answerValue(answer));
    case "exists":
      return answer !== undefined;
    case "known":
      return answer?.state === "known";
    case "unknown":
      return answer?.state === "unknown";
    case "not-applicable":
      return answer?.state === "not-applicable";
    case "all":
      return condition.conditions.every((item) => evaluateQuestionCondition(item, answers));
    case "any":
      return condition.conditions.some((item) => evaluateQuestionCondition(item, answers));
  }
}

function mergeUnique<T>(values: readonly T[]) {
  return [...new Set(values)];
}

function resolveDependency(
  questionId: string,
  dependency: QuestionDependency,
  answers: AnswerStateMap,
): QuestionResolution {
  const conditionMatches = evaluateQuestionCondition(dependency.condition, answers);
  const visible = dependency.requiredWhen === "always" || conditionMatches;
  const required = dependency.requiredWhen === "always" || (
    dependency.requiredWhen === "when-condition-true" && conditionMatches
  );

  return {
    questionId,
    visible,
    required,
    skipReason: visible ? undefined : dependency.skipReason,
    confidenceGain: visible ? dependency.confidenceGain : 0,
    enablesInferences: visible ? dependency.enablesInferences : [],
    blocksRules: visible ? dependency.blocksRules : [],
  };
}

export function resolveFollowUpQuestion(
  question: FollowUpQuestion,
  answers: AnswerStateMap,
): QuestionResolution {
  if (question.dependencies.length === 0) {
    return {
      questionId: question.questionId,
      visible: true,
      required: false,
      confidenceGain: 0,
      enablesInferences: [],
      blocksRules: [],
    };
  }

  const resolutions = question.dependencies.map((dependency) =>
    resolveDependency(question.questionId, dependency, answers),
  );
  const visible = resolutions.every((resolution) => resolution.visible);

  return {
    questionId: question.questionId,
    visible,
    required: visible && resolutions.some((resolution) => resolution.required),
    skipReason: visible ? undefined : resolutions.find((resolution) => resolution.skipReason)?.skipReason,
    confidenceGain: resolutions.reduce((sum, resolution) => sum + resolution.confidenceGain, 0),
    enablesInferences: mergeUnique(resolutions.flatMap((resolution) => resolution.enablesInferences)),
    blocksRules: mergeUnique(resolutions.flatMap((resolution) => resolution.blocksRules)),
  };
}
