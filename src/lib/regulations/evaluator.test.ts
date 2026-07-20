import { describe, expect, it } from "vitest";

import { adaptAllowanceSignalToRegulationResult } from "@/lib/allowances/adapter";
import { evaluateAllowanceSignals } from "@/lib/allowances/signaling";
import type { AllowanceScanInput } from "@/lib/allowances/signaling";
import { evaluateRegulation } from "@/lib/regulations/evaluator";
import type {
  ActionPlanItem,
  CalculationEvidence,
  Recommendation,
  RegulationEvaluationResult,
} from "@/lib/regulations/types";

const completeInput: AllowanceScanInput = {
  year: 2026,
  age: 30,
  partnerStatus: "no",
  assessmentIncome: 30_000,
  assets: 10_000,
  healthcare: { hasDutchHealthInsurance: true },
  rent: {
    tenure: "rent",
    independentHome: true,
    basicRent: 1200,
    hasCoResidents: false,
  },
  childBudget: {
    hasChildren: true,
    childAges: [6],
    receivesChildBenefit: true,
    childLivesWithApplicant: true,
  },
  childcare: {
    hasChildren: true,
    usesChildcare: true,
    registeredChildcare: true,
    childLivesWithApplicant: true,
    paysOwnContribution: true,
    applicantHasQualifyingActivity: true,
    partnerHasQualifyingActivity: "not-applicable",
    hoursPerMonth: 80,
  },
};

function healthcareAdapterOutput() {
  const healthcare = evaluateAllowanceSignals(completeInput).results[0];

  return adaptAllowanceSignalToRegulationResult(healthcare);
}

function definition() {
  return { regulationId: "allowance.healthcare", sourceYear: 2026 };
}

function expectError(
  result: ReturnType<typeof evaluateRegulation>,
  errorCode: string,
) {
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.errors).toContain(errorCode);
  }
}

describe("regulations evaluation engine", () => {
  it("returns a valid immutable regulation result from adapter output", () => {
    const adapterOutput = healthcareAdapterOutput();
    const evaluated = evaluateRegulation(definition(), adapterOutput);

    expect(evaluated.ok).toBe(true);
    if (!evaluated.ok) return;

    expect(evaluated.value.regulationId).toBe("allowance.healthcare");
    expect(evaluated.value.sourceYear).toBe(2026);
    expect(evaluated.value.confidence.label).toBe("high");
    expect(evaluated.value.evidence.sourceReferences.length).toBeGreaterThan(0);
    expect(evaluated.value.recommendations.length).toBeGreaterThan(0);
    expect(evaluated.value.actionPlan.length).toBeGreaterThan(0);
    expect(evaluated.value.officialVerification.required).toBe(true);
    expect(evaluated.value.estimateRange).toBeUndefined();
    expect(Object.isFrozen(evaluated.value)).toBe(true);
    expect(Object.isFrozen(evaluated.value.actionPlan)).toBe(true);
    expect(Object.isFrozen(evaluated.value.evidence)).toBe(true);
  });

  it("fails when regulationId is missing", () => {
    const adapterOutput = {
      ...healthcareAdapterOutput(),
      regulationId: "",
    } as RegulationEvaluationResult;

    expectError(evaluateRegulation({ regulationId: "" }, adapterOutput), "missing-definition-regulation-id");
    expectError(
      evaluateRegulation({ regulationId: "allowance.healthcare" }, adapterOutput),
      "definition-regulation-id-mismatch",
    );
  });

  it("fails when sourceYear is missing", () => {
    const adapterOutput = {
      ...healthcareAdapterOutput(),
      sourceYear: undefined,
    } as unknown as RegulationEvaluationResult;

    expectError(evaluateRegulation(definition(), adapterOutput), "missing-source-year");
  });

  it("fails when evidence is missing", () => {
    const adapterOutput = {
      ...healthcareAdapterOutput(),
      evidence: undefined,
    } as unknown as RegulationEvaluationResult;

    expectError(evaluateRegulation(definition(), adapterOutput), "missing-evidence");
  });

  it("fails when confidence is outside the valid range", () => {
    const validOutput = healthcareAdapterOutput();
    const adapterOutput = {
      ...validOutput,
      confidence: {
        ...validOutput.confidence,
      score: 101,
      },
    } as RegulationEvaluationResult;

    expectError(evaluateRegulation(definition(), adapterOutput), "confidence-score-out-of-range");
  });

  it("fails on inconsistent estimate ranges", () => {
    const validOutput = healthcareAdapterOutput();
    const adapterOutput = {
      ...validOutput,
      estimateRange: {
      minimum: 20,
      likely: 10,
      maximum: 30,
      unit: "currency",
      period: "month",
      sourceYear: 2026,
        confidence: validOutput.confidence,
      assumptions: [],
      uncertaintyCodes: [],
        sourceReferences: validOutput.evidence.sourceReferences,
      explanationCodes: [],
      },
    } as RegulationEvaluationResult;

    expectError(evaluateRegulation(definition(), adapterOutput), "estimate-minimum-above-likely");
  });

  it("fails when recommendations are empty", () => {
    const adapterOutput = {
      ...healthcareAdapterOutput(),
      recommendations: [],
    };

    expectError(evaluateRegulation(definition(), adapterOutput), "missing-recommendations");
  });

  it("fails when action plan is empty", () => {
    const adapterOutput = {
      ...healthcareAdapterOutput(),
      actionPlan: [],
    };

    expectError(evaluateRegulation(definition(), adapterOutput), "missing-action-plan");
  });

  it("combines existing evidence, action plan and recommendations without mutating adapter output", () => {
    const adapterOutput = healthcareAdapterOutput();
    const before = structuredClone(adapterOutput);
    const additionalEvidence: CalculationEvidence = {
      usedRuleIds: ["allowance.healthcare.adapter-contract"],
      sourceReferences: [],
      inputFieldIds: [],
      inferredValueIds: [],
      assumptions: ["evaluation-context"],
      excludedRuleIds: [],
      missingFieldIds: [],
      confidenceFactorIds: [],
      uncertaintyCodes: [],
      validity: { referenceDate: "2026-07-20" },
    };
    const additionalAction: ActionPlanItem = {
      actionId: "allowance.healthcare.review-later",
      type: "review-later",
      priority: 50,
      urgency: "low",
      reasonCodes: ["evaluation-context"],
      requiredFieldIds: [],
      sourceReferences: [],
      blocking: false,
    };
    const additionalRecommendation: Recommendation = {
      recommendationId: "allowance.healthcare.context-recommendation",
      type: "monitor",
      reasonCodes: ["evaluation-context"],
      confidence: adapterOutput.confidence,
      urgency: "low",
      dependencies: [],
      nextSteps: [additionalAction.actionId],
      sourceReferences: [],
      relatedTools: [],
    };

    const evaluated = evaluateRegulation(definition(), adapterOutput, {
      referenceDate: "2026-07-20",
      evidence: additionalEvidence,
      actionPlan: [additionalAction],
      recommendations: [additionalRecommendation],
    });

    expect(evaluated.ok).toBe(true);
    if (!evaluated.ok) return;

    expect(adapterOutput).toEqual(before);
    expect(evaluated.value.evidence.usedRuleIds).toContain(
      "allowance.healthcare.adapter-contract",
    );
    expect(evaluated.value.actionPlan.map((action) => action.actionId)).toContain(
      additionalAction.actionId,
    );
    expect(evaluated.value.recommendations.map((item) => item.recommendationId)).toContain(
      additionalRecommendation.recommendationId,
    );
    expect(evaluated.value.validity.referenceDate).toBe("2026-07-20");
  });

  it("evaluates multiple results in sequence and remains deterministic", () => {
    const adapterOutputs = evaluateAllowanceSignals(completeInput).results.map(
      adaptAllowanceSignalToRegulationResult,
    );
    const first = adapterOutputs.map((adapterOutput) =>
      evaluateRegulation({ regulationId: adapterOutput.regulationId }, adapterOutput),
    );
    const second = adapterOutputs.map((adapterOutput) =>
      evaluateRegulation({ regulationId: adapterOutput.regulationId }, adapterOutput),
    );

    expect(first.every((result) => result.ok)).toBe(true);
    expect(second.every((result) => result.ok)).toBe(true);
    expect(first).toEqual(second);
    expect(
      first.map((result) => (result.ok ? result.value.regulationId : "error")),
    ).toEqual([
      "allowance.healthcare",
      "allowance.rent",
      "allowance.child-budget",
      "allowance.childcare",
    ]);
  });
});
