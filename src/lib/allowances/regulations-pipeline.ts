import {
  adaptAllowanceSignalToRegulationResult,
  getAllowanceRegulationId,
} from "@/lib/allowances/adapter";
import { getAllowanceRegulationDefinition } from "@/lib/allowances/definitions";
import {
  evaluateAllowanceSignals,
} from "@/lib/allowances/signaling";
import type {
  AllowanceEvaluationContext,
  AllowanceKind,
  AllowanceMissingField,
  AllowanceScanInput,
  AllowanceScanResult,
  AllowanceSignalResult,
} from "@/lib/allowances/signaling";
import { evaluateRegulation } from "@/lib/regulations/evaluator";
import type { RegulationDefinition } from "@/lib/regulations/definition";
import { createUnavailableEstimateResult } from "@/lib/regulations/estimate-engine";
import type { EstimateResult, EstimateSource, EstimateStrategy } from "@/lib/regulations/estimate-engine";
import {
  buildRecommendations,
  mergeRecommendations,
} from "@/lib/regulations/recommendations";
import type { RecommendationResult } from "@/lib/regulations/recommendations";
import {
  resolveRegulationInputs,
} from "@/lib/regulations/unknown";
import type {
  InferenceCandidate,
  InferenceResult,
  UnknownResolution,
} from "@/lib/regulations/unknown";
import type {
  ActionPlanItem,
  AnswerState,
  CalculationEvidence,
  FieldId,
  RegulationEvaluationResult,
  Result,
} from "@/lib/regulations/types";

export type AllowanceRegulationAssessment = {
  readonly allowanceKind: AllowanceKind;
  readonly regulationId: string;
  readonly definition: RegulationDefinition;
  readonly originalSignal: AllowanceSignalResult;
  readonly resolvedAnswers: Readonly<Record<FieldId, AnswerState>>;
  readonly unknownResolutions: readonly UnknownResolution[];
  readonly inferredValues: readonly InferenceResult[];
  readonly blockingUnknowns: readonly UnknownResolution[];
  readonly evaluation: RegulationEvaluationResult;
  readonly recommendations: readonly RecommendationResult[];
  readonly estimate: EstimateResult;
  readonly actionPlan: readonly ActionPlanItem[];
  readonly evidence: CalculationEvidence;
  readonly sourceReferences: RegulationEvaluationResult["evidence"]["sourceReferences"];
  readonly sourceYear: number;
  readonly officialVerification: RegulationEvaluationResult["officialVerification"];
};

export type AllowanceRegulationsScanResult = {
  readonly ruleYear: number;
  readonly datasetId: string;
  readonly datasetVersion: string;
  readonly freshnessStatus: AllowanceScanResult["freshnessStatus"];
  readonly originalScan: AllowanceScanResult;
  readonly assessments: readonly [
    AllowanceRegulationAssessment,
    AllowanceRegulationAssessment,
    AllowanceRegulationAssessment,
    AllowanceRegulationAssessment,
  ];
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

function known<T>(fieldId: FieldId, value: T): AnswerState<T> {
  return { state: "known", fieldId, value, source: "adapter" };
}

function unknown(fieldId: FieldId, reasonCodes: readonly string[]): AnswerState {
  return { state: "unknown", fieldId, reasonCodes };
}

function notApplicable(fieldId: FieldId, reasonCodes: readonly string[]): AnswerState {
  return { state: "not-applicable", fieldId, reasonCodes };
}

function hasKnownValue(value: unknown) {
  return value !== undefined && value !== "unknown";
}

function valueForField(input: AllowanceScanInput, fieldId: AllowanceMissingField): unknown {
  switch (fieldId) {
    case "year":
      return input.year;
    case "age":
      return input.age;
    case "partnerStatus":
      return input.partnerStatus;
    case "assessmentIncome":
      return input.assessmentIncome;
    case "jointAssessmentIncome":
      return input.jointAssessmentIncome;
    case "assets":
      return input.assets;
    case "jointAssets":
      return input.jointAssets;
    case "householdIncome":
      return input.rent?.householdIncome;
    case "householdAssets":
      return input.rent?.householdAssets;
    case "healthcare.hasDutchHealthInsurance":
      return input.healthcare?.hasDutchHealthInsurance;
    case "rent.tenure":
      return input.rent?.tenure;
    case "rent.independentHome":
      return input.rent?.independentHome;
    case "rent.basicRent":
      return input.rent?.basicRent;
    case "rent.hasCoResidents":
      return input.rent?.hasCoResidents;
    case "children.hasChildren":
      return input.childBudget?.hasChildren ?? input.childcare?.hasChildren;
    case "children.childAges":
      return input.childBudget?.childAges;
    case "children.receivesChildBenefit":
      return input.childBudget?.receivesChildBenefit;
    case "children.childLivesWithApplicant":
      return input.childBudget?.childLivesWithApplicant;
    case "childcare.usesChildcare":
      return input.childcare?.usesChildcare;
    case "childcare.registeredChildcare":
      return input.childcare?.registeredChildcare;
    case "childcare.paysOwnContribution":
      return input.childcare?.paysOwnContribution;
    case "childcare.childLivesWithApplicant":
      return input.childcare?.childLivesWithApplicant;
    case "childcare.applicantHasQualifyingActivity":
      return input.childcare?.applicantHasQualifyingActivity;
    case "childcare.partnerHasQualifyingActivity":
      return input.childcare?.partnerHasQualifyingActivity;
    case "childcare.hoursPerMonth":
      return input.childcare?.hoursPerMonth;
  }
}

function answersFromInput(
  input: AllowanceScanInput,
  signal: AllowanceSignalResult,
  definition: RegulationDefinition,
): Readonly<Record<FieldId, AnswerState>> {
  const missing = new Set<AllowanceMissingField>(signal.missingFields);
  const answers: Record<FieldId, AnswerState> = {};

  for (const field of definition.inputDefinitions) {
    const fieldId = field.fieldId as AllowanceMissingField;
    const value = valueForField(input, fieldId);
    if (fieldId === "childcare.partnerHasQualifyingActivity" && value === "not-applicable") {
      answers[field.fieldId] = notApplicable(field.fieldId, ["allowance.partner-activity-not-applicable"]);
    } else if (missing.has(fieldId)) {
      answers[field.fieldId] = unknown(field.fieldId, signal.reasonCodes);
    } else if (hasKnownValue(value)) {
      answers[field.fieldId] = known(field.fieldId, value);
    }
  }

  return answers;
}

function inferenceCandidatesFor(
  input: AllowanceScanInput,
  definition: RegulationDefinition,
): readonly InferenceCandidate[] {
  const fieldIds = new Set(definition.inputDefinitions.map((field) => field.fieldId));
  const candidates: InferenceCandidate[] = [];
  const childAges = input.childBudget?.childAges;

  if (
    fieldIds.has("children.hasChildren") &&
    fieldIds.has("children.childAges") &&
    input.childBudget?.hasChildren === undefined &&
    Array.isArray(childAges) &&
    childAges.length > 0
  ) {
    candidates.push({
      inferenceId: `${definition.regulationId}.infer-children-present-from-ages`,
      targetFieldId: "children.hasChildren",
      sourceFieldIds: ["children.childAges"],
      inferredValue: true,
      reasonCodes: ["allowance.inference.children-present-from-ages"],
      evidenceReferences: definition.sourceReferences.map((source) => source.datasetId),
    });
  }

  if (
    fieldIds.has("childcare.partnerHasQualifyingActivity") &&
    input.partnerStatus === "no" &&
    input.childcare?.partnerHasQualifyingActivity === undefined
  ) {
    candidates.push({
      inferenceId: `${definition.regulationId}.infer-partner-activity-not-applicable`,
      targetFieldId: "childcare.partnerHasQualifyingActivity",
      sourceFieldIds: ["partnerStatus"],
      inferredValue: "not-applicable",
      reasonCodes: ["allowance.inference.partner-activity-not-applicable"],
      evidenceReferences: definition.sourceReferences.map((source) => source.datasetId),
    });
  }

  return candidates;
}

function estimateStrategyFor(definition: RegulationDefinition): EstimateStrategy {
  return {
    strategyId: `${definition.regulationId}.signal-only-estimate`,
    estimateType: definition.estimateStrategy.estimateType === "signal-only" ? "signal-only" : "none",
    rangeMergePolicy: "union",
    confidencePolicy: "minimum",
    minimumConfidenceLevel: "low",
    officialVerificationRequired: definition.estimateStrategy.officialVerificationRequired,
    reasonCodes: definition.estimateStrategy.reasonCodes,
  };
}

function estimateSourceFor(definition: RegulationDefinition): EstimateSource {
  return {
    sourceId: `${definition.regulationId}.source`,
    sourceType: "adapter",
    sourceReferences: definition.sourceReferences,
    reasonCodes: ["allowance-signal-only-source"],
    validFrom: definition.validFrom,
    validUntil: definition.validUntil,
  };
}

function evaluateAssessment(input: {
  scanInput: AllowanceScanInput;
  signal: AllowanceSignalResult;
}): Result<AllowanceRegulationAssessment> {
  const definition = getAllowanceRegulationDefinition(input.signal.allowanceKind);
  if (!definition) {
    return { ok: false, errors: [`missing-definition:${input.signal.allowanceKind}`] };
  }
  const expectedRegulationId = getAllowanceRegulationId(input.signal.allowanceKind);
  if (definition.regulationId !== expectedRegulationId) {
    return { ok: false, errors: [`definition-regulation-id-mismatch:${input.signal.allowanceKind}`] };
  }

  const adapterOutput = adaptAllowanceSignalToRegulationResult(input.signal);
  if (adapterOutput.regulationId !== definition.regulationId) {
    return { ok: false, errors: [`adapter-definition-mismatch:${input.signal.allowanceKind}`] };
  }

  const answers = answersFromInput(input.scanInput, input.signal, definition);
  const resolved = resolveRegulationInputs({
    definition,
    answers,
    inferenceCandidates: inferenceCandidatesFor(input.scanInput, definition),
  });
  if (!resolved.ok) {
    return resolved;
  }

  const evaluated = evaluateRegulation(
    { regulationId: definition.regulationId, sourceYear: definition.sourceYear },
    adapterOutput,
  );
  if (!evaluated.ok) {
    return evaluated;
  }

  const recommendations = mergeRecommendations(buildRecommendations({
    definition,
    evaluation: evaluated.value,
    unknownResolutions: resolved.value.unknownResolutions,
    inferences: resolved.value.inferences,
  }));
  const estimate = createUnavailableEstimateResult({
    estimateId: `${definition.regulationId}.estimate`,
    strategy: estimateStrategyFor(definition),
    confidence: evaluated.value.confidence,
    sources: [estimateSourceFor(definition)],
    availability: "signal-only",
    reasonCodes: ["allowance-estimate-not-implemented"],
    assumptions: evaluated.value.evidence.assumptions,
    warnings: evaluated.value.evidence.uncertaintyCodes,
    officialVerificationRequired: evaluated.value.officialVerification.required,
  });
  if (!estimate.ok) {
    return estimate;
  }

  return {
    ok: true,
    value: deepFreeze({
      allowanceKind: input.signal.allowanceKind,
      regulationId: definition.regulationId,
      definition,
      originalSignal: input.signal,
      resolvedAnswers: resolved.value.answers,
      unknownResolutions: resolved.value.unknownResolutions,
      inferredValues: resolved.value.inferences,
      blockingUnknowns: resolved.value.blockingUnknowns,
      evaluation: evaluated.value,
      recommendations,
      estimate: estimate.value,
      actionPlan: evaluated.value.actionPlan,
      evidence: evaluated.value.evidence,
      sourceReferences: evaluated.value.evidence.sourceReferences,
      sourceYear: evaluated.value.sourceYear,
      officialVerification: evaluated.value.officialVerification,
    }),
  };
}

export function evaluateAllowanceRegulations(
  input: AllowanceScanInput,
  context: AllowanceEvaluationContext = {},
): Result<AllowanceRegulationsScanResult> {
  let originalScan: AllowanceScanResult;
  try {
    // Central eligibility and hard-check layer. The Regulations pipeline enriches
    // this result; it does not duplicate allowance eligibility rules.
    originalScan = evaluateAllowanceSignals(input, context);
  } catch (error) {
    return {
      ok: false,
      errors: [
        `allowance-signaling-failed:${error instanceof Error ? error.message : "unknown-error"}`,
      ],
    };
  }
  const assessments = originalScan.results.map((signal) =>
    evaluateAssessment({ scanInput: input, signal }),
  );
  const firstError = assessments.find((assessment) => !assessment.ok);
  if (firstError && !firstError.ok) {
    return firstError;
  }

  return {
    ok: true,
    value: deepFreeze({
      ruleYear: originalScan.ruleYear,
      datasetId: originalScan.datasetId,
      datasetVersion: originalScan.datasetVersion,
      freshnessStatus: originalScan.freshnessStatus,
      originalScan,
      assessments: assessments.map((assessment) => {
        if (!assessment.ok) {
          throw new Error("Unexpected failed assessment after error check.");
        }
        return assessment.value;
      }) as unknown as AllowanceRegulationsScanResult["assessments"],
    }),
  };
}
