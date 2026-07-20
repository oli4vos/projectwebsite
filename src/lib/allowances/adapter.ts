import type {
  AllowanceKind,
  AllowanceScanResult,
  AllowanceSignalResult,
  AllowanceSignalStatus,
} from "@/lib/allowances/signaling";
import { sortActionPlan } from "@/lib/regulations/actions";
import { buildConfidenceAssessment } from "@/lib/regulations/confidence";
import type {
  ActionPlanItem,
  CalculationEvidence,
  ConfidenceAssessment,
  RegulationEvaluationResult,
  RegulationEvaluationStatus,
  RegulationId,
  RegulationSignal,
  ScenarioComplexity,
  Uncertainty,
} from "@/lib/regulations/types";

const ALLOWANCE_REGULATION_IDS: Record<AllowanceKind, RegulationId> = {
  healthcare: "allowance.healthcare",
  rent: "allowance.rent",
  "child-budget": "allowance.child-budget",
  childcare: "allowance.childcare",
};

const CONFIDENCE_BY_SIGNAL_STATUS: Record<
  AllowanceSignalStatus,
  { score: number; explanationCode: string }
> = {
  possible: {
    score: 80,
    explanationCode: "temporary-confidence-strong-signal",
  },
  "official-calculation-recommended": {
    score: 60,
    explanationCode: "temporary-confidence-possible-relevance",
  },
  "insufficient-information": {
    score: 35,
    explanationCode: "temporary-confidence-insufficient-information",
  },
  "probably-not": {
    score: 80,
    explanationCode: "temporary-confidence-strong-negative-signal",
  },
};

function getRegulationStatus(signal: AllowanceSignalResult): RegulationEvaluationStatus {
  if (signal.status === "insufficient-information") {
    return "insufficient-data";
  }
  if (signal.status === "probably-not") {
    return "not-relevant";
  }
  if (signal.status === "possible") {
    return "possibly-relevant";
  }

  return "official-verification-required";
}

function getRegulationSignal(status: AllowanceSignalStatus): RegulationSignal {
  if (status === "insufficient-information") {
    return "insufficient-information";
  }
  if (status === "probably-not") {
    return "probably-not-relevant";
  }
  if (status === "possible") {
    return "possibly-relevant";
  }

  return "official-check-needed";
}

function getConfidence(signal: AllowanceSignalResult): ConfidenceAssessment {
  const mapping = CONFIDENCE_BY_SIGNAL_STATUS[signal.status];
  const confidence = buildConfidenceAssessment({
    baseScore: mapping.score,
    missingFields: signal.missingFields,
    uncertaintyCodes: signal.uncertaintyCodes,
    explanationCodes: [
      "temporary-allowance-confidence-mapping",
      mapping.explanationCode,
      ...signal.reasonCodes,
    ],
  });

  if (!confidence.ok) {
    throw new Error(`Ongeldige tijdelijke confidence mapping voor ${signal.allowanceKind}.`);
  }

  return confidence.value;
}

function getEvidence(
  signal: AllowanceSignalResult,
  regulationId: RegulationId,
  confidence: ConfidenceAssessment,
): CalculationEvidence {
  return {
    usedRuleIds: signal.reasonCodes.map((reasonCode) => `${regulationId}.${reasonCode}`),
    sourceReferences: signal.sourceReferences,
    inputFieldIds: signal.missingFields,
    inferredValueIds: [],
    assumptions: ["allowance-adapter-signal-only", "allowance-estimate-not-implemented"],
    excludedRuleIds: signal.hardExclusion ? [`${regulationId}.hard-exclusion`] : [],
    missingFieldIds: signal.missingFields,
    confidenceFactorIds: confidence.factors.map((factor) => factor.factorId),
    uncertaintyCodes: signal.uncertaintyCodes,
    validity: {
      effectiveFrom: signal.sourceReferences.map((source) => source.effectiveFrom).filter(Boolean).sort()[0],
      effectiveTo: signal.sourceReferences.map((source) => source.effectiveTo).filter(Boolean).sort().at(-1),
      referenceDate: signal.sourceReferences.map((source) => source.referenceDate).filter(Boolean).sort().at(-1),
    },
  };
}

function getUncertainties(signal: AllowanceSignalResult): Uncertainty[] {
  return signal.uncertaintyCodes.map((code) => ({
    code,
    severity: signal.status === "official-calculation-recommended" ? "warning" : "info",
    reasonCode: code,
    fieldIds: [],
    confidenceImpact: 0,
    estimateRangeImpact: "blocks-estimate",
    officialVerificationRequired: true,
  }));
}

function getComplexity(signal: AllowanceSignalResult, regulationId: RegulationId): ScenarioComplexity {
  const isComplex =
    signal.status === "official-calculation-recommended" || signal.uncertaintyCodes.length > 0;

  return {
    level: isComplex ? "complex" : "normal",
    reasonCodes: isComplex ? signal.reasonCodes : [],
    affectedRegulationIds: isComplex ? [regulationId] : [],
    affectedRuleIds: isComplex
      ? signal.reasonCodes.map((reasonCode) => `${regulationId}.${reasonCode}`)
      : [],
    confidenceImpact: 0,
    officialVerificationRecommended: isComplex,
  };
}

function getActionPlan(
  signal: AllowanceSignalResult,
  regulationId: RegulationId,
): ActionPlanItem[] {
  const actions: ActionPlanItem[] = [];

  if (signal.missingFields.length > 0) {
    actions.push({
      actionId: `${regulationId}.collect-missing-data`,
      type: "collect-data",
      priority: 10,
      urgency: "medium",
      reasonCodes: signal.reasonCodes,
      requiredFieldIds: signal.missingFields,
      sourceReferences: signal.sourceReferences,
      blocking: true,
    });
  }

  actions.push({
    actionId: `${regulationId}.verify-officially`,
    type: "verify-officially",
    priority: signal.status === "probably-not" ? 30 : 20,
    urgency: signal.status === "official-calculation-recommended" ? "high" : "medium",
    reasonCodes: signal.reasonCodes,
    requiredFieldIds: [],
    sourceReferences: signal.sourceReferences,
    target: {
      type: "official-source",
      targetId: signal.officialCalculationUrl,
    },
    blocking: signal.status !== "probably-not",
  });

  actions.push({
    actionId: `${regulationId}.run-project-tool`,
    type: "run-project-tool",
    priority: 40,
    urgency: "low",
    reasonCodes: signal.reasonCodes,
    requiredFieldIds: [],
    sourceReferences: [],
    target: {
      type: "project-tool",
      targetId: "toeslagen-scan",
    },
    relatedTool: "toeslagen-scan",
    blocking: false,
  });

  return sortActionPlan(actions);
}

function getRecommendations(
  signal: AllowanceSignalResult,
  regulationId: RegulationId,
  confidence: ConfidenceAssessment,
  actionPlan: readonly ActionPlanItem[],
) {
  return [
    {
      recommendationId: `${regulationId}.next-step`,
      type: signal.missingFields.length > 0 ? "collect-data" : "verify",
      reasonCodes: signal.reasonCodes,
      confidence,
      urgency: signal.status === "official-calculation-recommended" ? "high" : "medium",
      dependencies: signal.missingFields,
      nextSteps: actionPlan.map((action) => action.actionId),
      sourceReferences: signal.sourceReferences,
      relatedTools: ["toeslagen-scan"],
    },
  ] as const;
}

export function getAllowanceRegulationId(kind: AllowanceKind): RegulationId {
  return ALLOWANCE_REGULATION_IDS[kind];
}

export function adaptAllowanceSignalToRegulationResult(
  signal: AllowanceSignalResult,
): RegulationEvaluationResult {
  const regulationId = getAllowanceRegulationId(signal.allowanceKind);
  const confidence = getConfidence(signal);
  const evidence = getEvidence(signal, regulationId, confidence);
  const actionPlan = getActionPlan(signal, regulationId);

  return {
    regulationId,
    status: getRegulationStatus(signal),
    signal: getRegulationSignal(signal.status),
    confidence,
    uncertainties: getUncertainties(signal),
    evidence,
    recommendations: getRecommendations(signal, regulationId, confidence, actionPlan),
    actionPlan,
    complexity: getComplexity(signal, regulationId),
    sourceYear: signal.ruleYear,
    validity: evidence.validity,
    officialVerification: {
      required: signal.status !== "probably-not",
      reasonCodes: signal.reasonCodes,
      sourceReferences: signal.sourceReferences,
    },
  };
}

export function adaptAllowanceScanToRegulationResults(
  scan: AllowanceScanResult,
): RegulationEvaluationResult[] {
  return scan.results.map(adaptAllowanceSignalToRegulationResult);
}
