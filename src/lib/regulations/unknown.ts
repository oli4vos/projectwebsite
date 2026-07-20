import { buildConfidenceAssessment } from "@/lib/regulations/confidence";
import type {
  RegulationAlternativeQuestionDefinition,
  RegulationDefinition,
  RegulationInputDefinition,
} from "@/lib/regulations/definition";
import type {
  AnswerState,
  FieldId,
  InferenceEvidence,
  InferredValue,
  InferenceInputReference,
  ReasonCode,
  Result,
} from "@/lib/regulations/types";

export type UnknownResolutionType =
  | "known"
  | "unknown"
  | "inferable"
  | "requires-official-source"
  | "alternative-question"
  | "blocking"
  | "non-blocking";

export type UnknownResolution = {
  readonly fieldId: FieldId;
  readonly resolutionType: UnknownResolutionType;
  readonly known: boolean;
  readonly unknown: boolean;
  readonly inferable: boolean;
  readonly requiresOfficialSource: boolean;
  readonly alternativeQuestion: boolean;
  readonly blocking: boolean;
  readonly reasonCodes: readonly ReasonCode[];
  readonly confidenceImpact: number;
  readonly nextQuestionCandidate?: string;
  readonly alternativeQuestionCandidates?: readonly RegulationAlternativeQuestionDefinition[];
  readonly skipAllowed?: boolean;
  readonly confirmationRequired?: boolean;
  readonly requiredSources: readonly string[];
};

export type InferenceCandidate<T = unknown> = {
  readonly inferenceId: string;
  readonly targetFieldId: FieldId;
  readonly sourceFieldIds: readonly FieldId[];
  readonly inferredValue: T;
  readonly reasonCodes: readonly ReasonCode[];
  readonly evidenceReferences?: readonly string[];
};

export type InferenceResult<T = unknown> = {
  readonly inferenceId: string;
  readonly targetField: FieldId;
  readonly sourceFields: readonly FieldId[];
  readonly inferredValue: T;
  readonly confidenceModifier: number;
  readonly overwriteAllowed: boolean;
  readonly reasonCodes: readonly ReasonCode[];
  readonly evidenceReferences: readonly string[];
  readonly value: InferredValue<T>;
};

export type ResolutionPipelineResult = {
  readonly unknownResolutions: readonly UnknownResolution[];
  readonly inferences: readonly InferenceResult[];
  readonly answers: Readonly<Record<FieldId, AnswerState>>;
  readonly blockingUnknowns: readonly UnknownResolution[];
  readonly inferenceEvidence: readonly InferenceEvidence[];
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

function answerMap(answers: Readonly<Record<FieldId, AnswerState>> | readonly AnswerState[]) {
  if (!Array.isArray(answers)) {
    return { ...answers };
  }

  return Object.fromEntries(answers.map((answer) => [answer.fieldId, answer]));
}

function isKnown(answer: AnswerState | undefined) {
  return answer?.state === "known" || answer?.state === "inferred";
}

function isUnknown(answer: AnswerState | undefined) {
  return answer === undefined || answer.state === "unknown";
}

function nextQuestionFor(definition: RegulationDefinition, fieldId: FieldId) {
  return definition.questionDefinitions.find((question) => question.fieldId === fieldId)
    ?.questionId;
}

function fallbackAlternativeQuestion(
  definition: RegulationDefinition,
  fieldId: FieldId,
): readonly RegulationAlternativeQuestionDefinition[] {
  const questionId = nextQuestionFor(definition, fieldId);
  if (!questionId) {
    return [];
  }

  return [{
    routeId: `${fieldId}.primary`,
    questionId,
    fieldId,
    labelKey: `${questionId}.alternative`,
    priority: 0,
    blocking: false,
    confirmationRequired: false,
    reasonCodes: [`alternative:${fieldId}`],
  }];
}

function resolveField(
  definition: RegulationDefinition,
  field: RegulationInputDefinition,
  answers: Readonly<Record<FieldId, AnswerState>>,
): UnknownResolution {
  const answer = answers[field.fieldId];
  if (isKnown(answer)) {
    return {
      fieldId: field.fieldId,
      resolutionType: "known",
      known: true,
      unknown: false,
      inferable: false,
      requiresOfficialSource: false,
      alternativeQuestion: false,
      blocking: false,
      reasonCodes: [],
      confidenceImpact: 0,
      alternativeQuestionCandidates: [],
      skipAllowed: false,
      confirmationRequired: false,
      requiredSources: [],
    };
  }

  const strategy = field.unknownStrategy;
  const inference = field.inference;
  const inferable = Boolean(
    field.supportsInference &&
      strategy?.inferable &&
      inference?.inferable &&
      inference.overwritePolicy !== "not-applicable",
  );
  const requiresOfficialSource = Boolean(strategy?.officialSourceAvailable && !inferable);
  const alternativeQuestion = Boolean(strategy?.followUpPossible);
  const blocking = Boolean(field.required && !field.optional && !strategy?.allowed && !inferable);
  const alternativeQuestionCandidates = alternativeQuestion
    ? [...(strategy?.alternativeQuestions ?? fallbackAlternativeQuestion(definition, field.fieldId))]
      .sort((left, right) => left.priority - right.priority || left.routeId.localeCompare(right.routeId))
    : [];
  const nextQuestionCandidate = alternativeQuestionCandidates[0]?.questionId;
  const resolutionType: UnknownResolutionType = inferable
    ? "inferable"
    : requiresOfficialSource
      ? "requires-official-source"
      : alternativeQuestion
        ? "alternative-question"
        : blocking
          ? "blocking"
          : "non-blocking";

  return {
    fieldId: field.fieldId,
    resolutionType,
    known: false,
    unknown: isUnknown(answer),
    inferable,
    requiresOfficialSource,
    alternativeQuestion,
    blocking,
    reasonCodes: [
      ...(answer?.state === "unknown" ? answer.reasonCodes : []),
      ...(strategy?.reasonCodes ?? []),
      ...(inference?.reasonCodes ?? []),
    ],
    confidenceImpact: (strategy?.confidenceImpact ?? 0) + (inference?.confidenceModifier ?? 0),
    nextQuestionCandidate,
    alternativeQuestionCandidates,
    skipAllowed: Boolean(strategy?.skipAllowed),
    confirmationRequired: Boolean(strategy?.confirmationRequired),
    requiredSources: inference?.preferredSources ?? [],
  };
}

export function resolveUnknownFields(
  definition: RegulationDefinition,
  answers: Readonly<Record<FieldId, AnswerState>> | readonly AnswerState[],
): readonly UnknownResolution[] {
  const mappedAnswers = answerMap(answers);

  return deepFreeze(
    definition.inputDefinitions.map((field) => resolveField(definition, field, mappedAnswers)),
  );
}

export function filterBlockingUnknowns(
  resolutions: readonly UnknownResolution[],
): readonly UnknownResolution[] {
  return deepFreeze(resolutions.filter((resolution) => resolution.blocking));
}

function getField(definition: RegulationDefinition, fieldId: FieldId) {
  return definition.inputDefinitions.find((field) => field.fieldId === fieldId);
}

function inputReferences(
  sourceFieldIds: readonly FieldId[],
  answers: Readonly<Record<FieldId, AnswerState>>,
): InferenceInputReference[] {
  return sourceFieldIds.map((fieldId) => ({
    fieldId,
    answerState: answers[fieldId]?.state ?? "unknown",
  }));
}

export function runInference(
  definition: RegulationDefinition,
  answers: Readonly<Record<FieldId, AnswerState>> | readonly AnswerState[],
  candidates: readonly InferenceCandidate[],
): Result<readonly InferenceResult[]> {
  const mappedAnswers = answerMap(answers);
  const results: InferenceResult[] = [];
  const errors: ReasonCode[] = [];

  for (const candidate of candidates) {
    const field = getField(definition, candidate.targetFieldId);
    if (!field?.supportsInference || !field.inference?.inferable) {
      errors.push(`inference-not-supported:${candidate.targetFieldId}`);
      continue;
    }

    const missingSource = candidate.sourceFieldIds.find(
      (fieldId) => !isKnown(mappedAnswers[fieldId]),
    );
    if (missingSource) {
      errors.push(`inference-source-not-known:${candidate.inferenceId}:${missingSource}`);
      continue;
    }

    const confidence = buildConfidenceAssessment({
      baseScore: 70,
      factors: [{
        factorId: `${candidate.inferenceId}.metadata-confidence-modifier`,
        impact: field.inference.confidenceModifier,
        reasonCode: "inference-metadata-confidence-modifier",
        fieldId: candidate.targetFieldId,
      }],
      explanationCodes: field.inference.reasonCodes,
    });
    if (!confidence.ok) {
      return confidence;
    }

    const evidence: InferenceEvidence = {
      evidenceId: `${candidate.inferenceId}.evidence`,
      ruleIds: [],
      sourceReferences: definition.sourceReferences.filter((reference) =>
        (candidate.evidenceReferences ?? []).includes(reference.datasetId),
      ),
      reasonCodes: candidate.reasonCodes,
    };
    const overwriteAllowed = field.inference.overwritePolicy !== "locked";
    const inferred: InferredValue = {
      inferenceId: candidate.inferenceId,
      targetFieldId: candidate.targetFieldId,
      value: candidate.inferredValue,
      inputReferences: inputReferences(candidate.sourceFieldIds, mappedAnswers),
      method: "domain-adapter",
      confidence: confidence.value,
      evidence,
      overridable: overwriteAllowed,
      reasonCodes: [...candidate.reasonCodes, ...field.inference.reasonCodes],
    };

    results.push({
      inferenceId: candidate.inferenceId,
      targetField: candidate.targetFieldId,
      sourceFields: candidate.sourceFieldIds,
      inferredValue: candidate.inferredValue,
      confidenceModifier: field.inference.confidenceModifier,
      overwriteAllowed,
      reasonCodes: inferred.reasonCodes,
      evidenceReferences: candidate.evidenceReferences ?? [],
      value: inferred,
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: deepFreeze(results) };
}

export function mergeResolvedAnswers(
  answers: Readonly<Record<FieldId, AnswerState>> | readonly AnswerState[],
  inferences: readonly InferenceResult[],
): Readonly<Record<FieldId, AnswerState>> {
  const merged = answerMap(answers);

  for (const inference of inferences) {
    const existing = merged[inference.targetField];
    if (existing?.state === "known") {
      continue;
    }
    merged[inference.targetField] = {
      state: "inferred",
      fieldId: inference.targetField,
      value: inference.inferredValue,
      inferenceId: inference.inferenceId,
      overridable: inference.overwriteAllowed,
    };
  }

  return deepFreeze(merged);
}

export function collectInferenceEvidence(
  inferences: readonly InferenceResult[],
): readonly InferenceEvidence[] {
  return deepFreeze(inferences.map((inference) => inference.value.evidence));
}

export function resolveRegulationInputs(input: {
  readonly definition: RegulationDefinition;
  readonly answers: Readonly<Record<FieldId, AnswerState>> | readonly AnswerState[];
  readonly inferenceCandidates?: readonly InferenceCandidate[];
}): Result<ResolutionPipelineResult> {
  const unknownResolutions = resolveUnknownFields(input.definition, input.answers);
  const inferences = runInference(
    input.definition,
    input.answers,
    input.inferenceCandidates ?? [],
  );
  if (!inferences.ok) {
    return inferences;
  }

  const answers = mergeResolvedAnswers(input.answers, inferences.value);

  return {
    ok: true,
    value: deepFreeze({
      unknownResolutions,
      inferences: inferences.value,
      answers,
      blockingUnknowns: filterBlockingUnknowns(unknownResolutions),
      inferenceEvidence: collectInferenceEvidence(inferences.value),
    }),
  };
}
