import type { AnswerState, FieldId, InferenceId, ReasonCode } from "@/lib/regulations/types";

export function isKnownAnswer<T>(answer: AnswerState<T>): answer is Extract<AnswerState<T>, { state: "known" }> {
  return answer.state === "known";
}

export function isUnknownAnswer<T>(answer: AnswerState<T>) {
  return answer.state === "unknown";
}

export function isInferredAnswer<T>(answer: AnswerState<T>): answer is Extract<AnswerState<T>, { state: "inferred" }> {
  return answer.state === "inferred";
}

export function getDirectKnownValue<T>(answer: AnswerState<T>) {
  return isKnownAnswer(answer) ? answer.value : undefined;
}

export function createKnownAnswer<T>(fieldId: FieldId, value: T): AnswerState<T> {
  return { state: "known", fieldId, value, source: "user" };
}

export function createUnknownAnswer(fieldId: FieldId, reasonCodes: readonly ReasonCode[]): AnswerState {
  return { state: "unknown", fieldId, reasonCodes };
}

export function createInferredAnswer<T>(input: {
  fieldId: FieldId;
  value: T;
  inferenceId: InferenceId;
  overridable: boolean;
}): AnswerState<T> {
  return {
    state: "inferred",
    fieldId: input.fieldId,
    value: input.value,
    inferenceId: input.inferenceId,
    overridable: input.overridable,
  };
}

export function overrideInferredAnswer<T>(answer: AnswerState<T>, value: T): AnswerState<T> {
  if (answer.state !== "inferred" || !answer.overridable) {
    return answer;
  }

  return { state: "known", fieldId: answer.fieldId, value, source: "user" };
}
