import { describe, expect, it } from "vitest";

import {
  buildConfidenceAssessment,
  createEstimateRange,
  createInferredAnswer,
  createKnownAnswer,
  createUnknownAnswer,
  evaluateQuestionCondition,
  getConfidenceLabel,
  getDirectKnownValue,
  isInferredAnswer,
  isKnownAnswer,
  isUnknownAnswer,
  mergeCalculationEvidence,
  normalizeConfidenceScore,
  overrideInferredAnswer,
  resolveFollowUpQuestion,
  sortActionPlan,
} from "@/lib/regulations";
import type {
  ActionPlanItem,
  CalculationEvidence,
  FollowUpQuestion,
  InferredValue,
  RegulationEvaluationResult,
  ScenarioComplexity,
  Uncertainty,
} from "@/lib/regulations";
import type { SourceReference } from "@/lib/financial-constants";

const sourceReference: SourceReference = {
  label: "Testbron",
  sourceName: "Testbron",
  sourceUrl: "https://example.com/source",
  sourceType: "official-execution",
  referenceDate: "2026-07-20",
  year: 2026,
  effectiveFrom: "2026-01-01",
  effectiveTo: "2026-12-31",
  methodology: "Testbron voor generieke regelingen-primitives.",
  methodologyType: "official-norm",
  freshnessStatus: "fresh",
  datasetId: "test-dataset-2026",
  version: "1.0.0",
};

const confidence = buildConfidenceAssessment({
  baseScore: 60,
  factors: [
    { factorId: "source-fresh", impact: 10, reasonCode: "source-fresh" },
  ],
  explanationCodes: ["documented-factors"],
});

if (!confidence.ok) {
  throw new Error("Test confidence fixture failed");
}

const confidenceValue = confidence.value;

describe("regulations confidence primitives", () => {
  it("maps score boundaries to stable labels", () => {
    expect(getConfidenceLabel(0)).toBe("very-low");
    expect(getConfidenceLabel(24)).toBe("very-low");
    expect(getConfidenceLabel(25)).toBe("low");
    expect(getConfidenceLabel(49)).toBe("low");
    expect(getConfidenceLabel(50)).toBe("medium");
    expect(getConfidenceLabel(74)).toBe("medium");
    expect(getConfidenceLabel(75)).toBe("high");
    expect(getConfidenceLabel(89)).toBe("high");
    expect(getConfidenceLabel(90)).toBe("very-high");
    expect(getConfidenceLabel(100)).toBe("very-high");
  });

  it("rejects invalid base scores and combines documented factors deterministically", () => {
    expect(normalizeConfidenceScore(-1)).toEqual({
      ok: false,
      errors: ["confidence-score-out-of-range"],
    });
    expect(normalizeConfidenceScore(Number.NaN)).toEqual({
      ok: false,
      errors: ["confidence-score-not-finite"],
    });

    const result = buildConfidenceAssessment({
      baseScore: 50,
      factors: [
        { factorId: "missing-income", impact: -20, reasonCode: "missing-income" },
        { factorId: "fresh-source", impact: 15, reasonCode: "fresh-source" },
      ],
      missingFields: ["income", "income"],
      uncertaintyCodes: ["unknown-income", "unknown-income"],
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.score).toBe(45);
      expect(result.value.label).toBe("low");
      expect(result.value.factors.map((factor) => factor.factorId)).toEqual([
        "missing-income",
        "fresh-source",
      ]);
      expect(result.value.missingFields).toEqual(["income"]);
      expect(result.value.uncertaintyCodes).toEqual(["unknown-income"]);
    }
  });

  it("clamps combined factors explicitly and does not produce entitlement booleans", () => {
    const low = buildConfidenceAssessment({
      baseScore: 10,
      factors: [{ factorId: "large-negative", impact: -50, reasonCode: "negative" }],
    });
    const high = buildConfidenceAssessment({
      baseScore: 90,
      factors: [{ factorId: "large-positive", impact: 50, reasonCode: "positive" }],
    });

    expect(low.ok && low.value.score).toBe(0);
    expect(high.ok && high.value.score).toBe(100);
    expect("entitled" in confidenceValue).toBe(false);
  });
});

describe("regulations estimate range primitives", () => {
  it("accepts valid generic ranges and exact ranges", () => {
    const range = createEstimateRange({
      minimum: 10,
      likely: 20,
      maximum: 30,
      unit: "count",
      period: "year",
      sourceYear: 2026,
      confidence: confidenceValue,
      assumptions: ["test-assumption"],
      uncertaintyCodes: ["wide-range"],
      sourceReferences: [sourceReference],
      explanationCodes: ["range-explained"],
    });
    const exact = createEstimateRange({
      minimum: 1,
      likely: 1,
      maximum: 1,
      unit: "custom",
      customUnit: "points",
      period: "custom",
      customPeriod: "case",
      sourceYear: 2026,
      confidence: confidenceValue,
      assumptions: [],
      uncertaintyCodes: [],
      sourceReferences: [sourceReference],
      explanationCodes: [],
    });

    expect(range.ok).toBe(true);
    expect(exact.ok).toBe(true);
    if (range.ok) {
      expect(range.value.assumptions).toEqual(["test-assumption"]);
      expect(range.value.sourceReferences).toEqual([sourceReference]);
    }
  });

  it("rejects invalid ordering, non-finite values and missing metadata", () => {
    const base = {
      minimum: 1,
      likely: 2,
      maximum: 3,
      unit: "currency" as const,
      period: "month" as const,
      sourceYear: 2026,
      confidence: confidenceValue,
      assumptions: [],
      uncertaintyCodes: [],
      sourceReferences: [sourceReference],
      explanationCodes: [],
    };

    expect(createEstimateRange({ ...base, minimum: 3 }).ok).toBe(false);
    expect(createEstimateRange({ ...base, likely: 4 }).ok).toBe(false);
    expect(createEstimateRange({ ...base, maximum: Number.POSITIVE_INFINITY }).ok).toBe(false);
    expect(createEstimateRange({ ...base, minimum: Number.NaN }).ok).toBe(false);
    expect(createEstimateRange({ ...base, sourceYear: 0 }).ok).toBe(false);
    expect(createEstimateRange({ ...base, unit: "custom" }).ok).toBe(false);
  });
});

describe("regulations answer-state primitives", () => {
  it("keeps known, unknown, inferred, not-applicable and skipped explicit", () => {
    const known = createKnownAnswer("income", 42);
    const unknown = createUnknownAnswer("assets", ["unknown-assets"]);
    const inferred = createInferredAnswer({
      fieldId: "income",
      value: 40,
      inferenceId: "infer-income",
      overridable: true,
    });
    const notApplicable = { state: "not-applicable", fieldId: "rent", reasonCodes: ["owner"] } as const;
    const skipped = { state: "skipped", fieldId: "partner", reasonCodes: ["later"] } as const;

    expect(isKnownAnswer(known)).toBe(true);
    expect(isUnknownAnswer(unknown)).toBe(true);
    expect(isInferredAnswer(inferred)).toBe(true);
    expect(notApplicable.state).toBe("not-applicable");
    expect(skipped.state).toBe("skipped");
    expect(getDirectKnownValue(known)).toBe(42);
    expect(getDirectKnownValue(inferred)).toBeUndefined();
  });

  it("supports explicit override from inferred to known only when allowed", () => {
    const inferred = createInferredAnswer({
      fieldId: "income",
      value: 40,
      inferenceId: "infer-income",
      overridable: true,
    });
    const locked = createInferredAnswer({
      fieldId: "income",
      value: 40,
      inferenceId: "infer-income",
      overridable: false,
    });

    expect(overrideInferredAnswer(inferred, 50)).toEqual({
      state: "known",
      fieldId: "income",
      value: 50,
      source: "user",
    });
    expect(overrideInferredAnswer(locked, 50)).toBe(locked);
  });
});

describe("regulations dependency primitives", () => {
  const answers = {
    tenure: createKnownAnswer("tenure", "rent"),
    income: createUnknownAnswer("income", ["unknown-income"]),
    age: createKnownAnswer("age", 30),
    inferredHousehold: createInferredAnswer({
      fieldId: "household",
      value: "single",
      inferenceId: "infer-household",
      overridable: true,
    }),
    care: { state: "not-applicable", fieldId: "care", reasonCodes: ["no-children"] } as const,
  };

  it("evaluates typed conditions without free expressions", () => {
    expect(evaluateQuestionCondition({ type: "equals", fieldId: "tenure", value: "rent" }, answers)).toBe(true);
    expect(evaluateQuestionCondition({ type: "not-equals", fieldId: "tenure", value: "owner" }, answers)).toBe(true);
    expect(evaluateQuestionCondition({ type: "in", fieldId: "tenure", values: ["rent", "other"] }, answers)).toBe(true);
    expect(evaluateQuestionCondition({ type: "exists", fieldId: "missing" }, answers)).toBe(false);
    expect(evaluateQuestionCondition({ type: "known", fieldId: "age" }, answers)).toBe(true);
    expect(evaluateQuestionCondition({ type: "unknown", fieldId: "income" }, answers)).toBe(true);
    expect(evaluateQuestionCondition({ type: "not-applicable", fieldId: "care" }, answers)).toBe(true);
    expect(evaluateQuestionCondition({
      type: "all",
      conditions: [
        { type: "known", fieldId: "age" },
        { type: "equals", fieldId: "tenure", value: "rent" },
      ],
    }, answers)).toBe(true);
    expect(evaluateQuestionCondition({
      type: "any",
      conditions: [
        { type: "known", fieldId: "missing" },
        { type: "unknown", fieldId: "income" },
      ],
    }, answers)).toBe(true);
  });

  it("resolves multiple dependencies deterministically", () => {
    const question: FollowUpQuestion = {
      questionId: "q-income",
      targetFieldId: "income",
      priority: 2,
      dependencies: [
        {
          dependsOn: ["tenure"],
          condition: { type: "equals", fieldId: "tenure", value: "rent" },
          requiredWhen: "when-condition-true",
          confidenceGain: 10,
          enablesInferences: ["infer-income"],
          blocksRules: ["rule-without-income"],
        },
        {
          dependsOn: ["age"],
          condition: { type: "known", fieldId: "age" },
          requiredWhen: "when-condition-true",
          confidenceGain: 5,
          enablesInferences: ["infer-age-group"],
          blocksRules: [],
        },
      ],
    };

    expect(resolveFollowUpQuestion(question, answers)).toEqual({
      questionId: "q-income",
      visible: true,
      required: true,
      confidenceGain: 15,
      enablesInferences: ["infer-income", "infer-age-group"],
      blocksRules: ["rule-without-income"],
    });
  });
});

describe("regulations inference, complexity and action primitives", () => {
  it("keeps inference provenance and avoids silent direct-answer promotion", () => {
    const inferred: InferredValue<number> = {
      inferenceId: "infer-annual-income",
      targetFieldId: "annual-income",
      value: 36_000,
      inputReferences: [{ fieldId: "monthly-income", answerState: "known" }],
      method: "arithmetic",
      confidence: confidenceValue,
      evidence: {
        evidenceId: "income-evidence",
        ruleIds: ["annualize-monthly-income"],
        sourceReferences: [sourceReference],
        reasonCodes: ["derived-income-estimate"],
      },
      overridable: true,
      reasonCodes: ["derived-income-estimate"],
      referenceDate: "2026-07-20",
    };
    const answer = createInferredAnswer({
      fieldId: inferred.targetFieldId,
      value: inferred.value,
      inferenceId: inferred.inferenceId,
      overridable: inferred.overridable,
    });

    expect(inferred.inputReferences).toEqual([{ fieldId: "monthly-income", answerState: "known" }]);
    expect(getDirectKnownValue(answer)).toBeUndefined();
    expect(isInferredAnswer(answer)).toBe(true);
  });

  it("models every complexity level without implying a stop status", () => {
    const levels: ScenarioComplexity["level"][] = [
      "simple",
      "normal",
      "complex",
      "very-complex",
    ];

    for (const level of levels) {
      const complexity: ScenarioComplexity = {
        level,
        reasonCodes: [`${level}-case`],
        affectedRegulationIds: ["regulation"],
        affectedRuleIds: ["rule"],
        confidenceImpact: level === "simple" ? 0 : -10,
        officialVerificationRecommended: level !== "simple",
      };

      expect(complexity.level).toBe(level);
      expect("stop" in complexity).toBe(false);
    }
  });

  it("sorts action plans by priority, urgency and id with safe targets", () => {
    const actions: ActionPlanItem[] = [
      {
        actionId: "z-review",
        type: "review-later",
        priority: 2,
        urgency: "low",
        reasonCodes: ["later"],
        requiredFieldIds: [],
        sourceReferences: [],
        blocking: false,
      },
      {
        actionId: "a-verify",
        type: "verify-officially",
        priority: 1,
        urgency: "high",
        reasonCodes: ["verify"],
        requiredFieldIds: ["income"],
        sourceReferences: [sourceReference],
        target: { type: "official-source", targetId: "official-check" },
        blocking: true,
      },
      {
        actionId: "b-tool",
        type: "run-project-tool",
        priority: 1,
        urgency: "medium",
        reasonCodes: ["tool"],
        requiredFieldIds: [],
        sourceReferences: [],
        target: { type: "project-tool", targetId: "duo-maandbedrag" },
        relatedTool: "duo-maandbedrag",
        blocking: false,
      },
    ];

    expect(sortActionPlan(actions).map((action) => action.actionId)).toEqual([
      "a-verify",
      "b-tool",
      "z-review",
    ]);
  });
});

describe("regulations evidence and result contracts", () => {
  const baseEvidence: CalculationEvidence = {
    usedRuleIds: ["rule-a"],
    sourceReferences: [sourceReference],
    inputFieldIds: ["income"],
    inferredValueIds: ["infer-income"],
    assumptions: ["assumption-a"],
    excludedRuleIds: ["excluded-a"],
    missingFieldIds: ["assets"],
    confidenceFactorIds: ["factor-a"],
    uncertaintyCodes: ["unknown-assets"],
    validity: {
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-12-31",
      referenceDate: "2026-07-20",
    },
  };

  it("merges evidence deterministically with deduplication and validity", () => {
    const merged = mergeCalculationEvidence([
      baseEvidence,
      {
        ...baseEvidence,
        usedRuleIds: ["rule-a", "rule-b"],
        inputFieldIds: ["income", "age"],
        missingFieldIds: ["assets", "partner"],
        validity: {
          effectiveFrom: "2025-01-01",
          effectiveTo: "2027-12-31",
          referenceDate: "2026-08-01",
        },
      },
    ]);

    expect(merged.usedRuleIds).toEqual(["rule-a", "rule-b"]);
    expect(merged.sourceReferences).toEqual([sourceReference]);
    expect(merged.inputFieldIds).toEqual(["income", "age"]);
    expect(merged.missingFieldIds).toEqual(["assets", "partner"]);
    expect(merged.validity).toEqual({
      effectiveFrom: "2025-01-01",
      effectiveTo: "2027-12-31",
      referenceDate: "2026-08-01",
    });
  });

  it("supports signal-only, estimate, insufficient-data and official-check result statuses", () => {
    const uncertainty: Uncertainty = {
      code: "unknown-income",
      severity: "warning",
      reasonCode: "missing-income",
      fieldIds: ["income"],
      confidenceImpact: -20,
      estimateRangeImpact: "widen",
      officialVerificationRequired: true,
    };
    const result: RegulationEvaluationResult = {
      regulationId: "generic-regulation",
      status: "official-verification-required",
      signal: "official-check-needed",
      confidence: confidenceValue,
      uncertainties: [uncertainty],
      evidence: baseEvidence,
      recommendations: [],
      actionPlan: [],
      complexity: {
        level: "complex",
        reasonCodes: ["complex-case"],
        affectedRegulationIds: ["generic-regulation"],
        affectedRuleIds: ["rule-a"],
        confidenceImpact: -10,
        officialVerificationRecommended: true,
      },
      sourceYear: 2026,
      validity: baseEvidence.validity,
      officialVerification: {
        required: true,
        reasonCodes: ["official-check-needed"],
        sourceReferences: [sourceReference],
      },
    };
    const range = createEstimateRange({
      minimum: 0,
      likely: 1,
      maximum: 2,
      unit: "count",
      period: "year",
      sourceYear: 2026,
      confidence: confidenceValue,
      assumptions: [],
      uncertaintyCodes: [],
      sourceReferences: [sourceReference],
      explanationCodes: [],
    });
    expect(range.ok).toBe(true);

    const estimateResult: RegulationEvaluationResult = {
      ...result,
      status: "estimate-available",
      signal: "possibly-relevant",
      estimateRange: range.ok ? range.value : undefined,
    };

    expect(result.status).toBe("official-verification-required");
    expect("entitled" in result).toBe(false);
    expect({ ...result, status: "insufficient-data" }).toMatchObject({
      status: "insufficient-data",
    });
    expect({ ...result, status: "possibly-relevant", signal: "possibly-relevant" }).toMatchObject({
      status: "possibly-relevant",
    });
    expect(estimateResult.estimateRange?.minimum).toBe(0);
  });
});
