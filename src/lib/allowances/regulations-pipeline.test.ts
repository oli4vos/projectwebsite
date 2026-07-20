import { describe, expect, it } from "vitest";

import { getAllowanceRegulationId } from "@/lib/allowances/adapter";
import { evaluateAllowanceRegulations } from "@/lib/allowances/regulations-pipeline";
import { evaluateAllowanceSignals } from "@/lib/allowances/signaling";
import type { AllowanceKind, AllowanceScanInput } from "@/lib/allowances/signaling";

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

function unwrap(input: AllowanceScanInput = completeInput) {
  const result = evaluateAllowanceRegulations(input);
  if (!result.ok) {
    throw new Error(result.errors.join(", "));
  }

  return result.value;
}

function assessment(kind: AllowanceKind, input: AllowanceScanInput = completeInput) {
  const result = unwrap(input).assessments.find((item) => item.allowanceKind === kind);
  if (!result) {
    throw new Error(`Missing assessment ${kind}`);
  }

  return result;
}

describe("allowance regulations pipeline", () => {
  it("returns four immutable assessments in the existing allowance order", () => {
    const result = unwrap();

    expect(result.assessments.map((item) => item.allowanceKind)).toEqual([
      "healthcare",
      "rent",
      "child-budget",
      "childcare",
    ]);
    expect(result.ruleYear).toBe(2026);
    expect(result.datasetId).toBe("allowance-signal-rules-2026");
    expect(result.datasetVersion).toBe("1.0.0");
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.assessments)).toBe(true);
    expect(Object.isFrozen(result.assessments[0])).toBe(true);
  });

  it("uses the correct definition and keeps original signaling available", () => {
    const original = evaluateAllowanceSignals(completeInput);
    const result = unwrap();

    expect(result.originalScan).toEqual(original);
    for (const item of result.assessments) {
      expect(item.regulationId).toBe(getAllowanceRegulationId(item.allowanceKind));
      expect(item.definition.regulationId).toBe(item.regulationId);
      expect(item.originalSignal).toEqual(
        original.results.find((signal) => signal.allowanceKind === item.allowanceKind),
      );
      expect(item.sourceYear).toBe(2026);
      expect(item.sourceReferences.length).toBeGreaterThan(0);
      expect(item.officialVerification).toBeDefined();
      expect(item.evaluation.estimateRange).toBeUndefined();
      expect(item.estimate.availability).toBe("signal-only");
      expect(item.estimate.range).toBeUndefined();
      expect(item.estimate.strategy.estimateType).toBe("signal-only");
    }
  });

  it("applies adapter and evaluator output without changing statuses", () => {
    const healthcare = assessment("healthcare");
    const rent = assessment("rent");
    const childBudget = assessment("child-budget");
    const childcare = assessment("childcare");

    expect(healthcare.originalSignal.status).toBe("possible");
    expect(healthcare.evaluation.status).toBe("possibly-relevant");
    expect(rent.originalSignal.status).toBe("official-calculation-recommended");
    expect(rent.evaluation.status).toBe("official-verification-required");
    expect(childBudget.evaluation.signal).toBe("official-check-needed");
    expect(childcare.evaluation.signal).toBe("official-check-needed");
    for (const item of [healthcare, rent, childBudget, childcare]) {
      expect(item.actionPlan.length).toBeGreaterThan(0);
      expect(item.evidence.usedRuleIds.length).toBeGreaterThan(0);
      expect(item.evidence.sourceReferences.length).toBeGreaterThan(0);
      expect(item.evaluation.recommendations.length).toBeGreaterThan(0);
      expect(item.estimate.sources[0].sourceType).toBe("adapter");
      expect(item.estimate.officialVerificationRequired).toBe(item.officialVerification.required);
    }
  });

  it("represents estimates through the Estimate Engine without amount logic", () => {
    const result = unwrap();

    for (const item of result.assessments) {
      expect(item.estimate.estimateId).toBe(`${item.regulationId}.estimate`);
      expect(item.estimate.availability).toBe("signal-only");
      expect(item.estimate.range).toBeUndefined();
      expect(item.estimate.reasonCodes).toEqual(["allowance-estimate-not-implemented"]);
      expect(item.estimate.assumptions).toContain("allowance-adapter-signal-only");
      expect(item.estimate.sources[0].sourceReferences).toEqual(item.definition.sourceReferences);
    }
  });

  it("maps unknowns explicitly and distinguishes blocking unknowns", () => {
    const healthcare = assessment("healthcare", { year: 2026 });

    expect(healthcare.originalSignal.status).toBe("insufficient-information");
    expect(healthcare.unknownResolutions.map((item) => item.fieldId)).toEqual(
      expect.arrayContaining([
        "age",
        "partnerStatus",
        "assessmentIncome",
        "assets",
        "healthcare.hasDutchHealthInsurance",
      ]),
    );
    expect(
      healthcare.unknownResolutions.filter((item) => item.resolutionType === "requires-official-source").length,
    ).toBeGreaterThan(0);
    expect(Array.isArray(healthcare.blockingUnknowns)).toBe(true);
    expect(healthcare.recommendations.map((item) => item.type)).toContain("verify-officially");
  });

  it("runs only safe explicit inferences and keeps inferred values inferred", () => {
    const childBudget = assessment("child-budget", {
      ...completeInput,
      childBudget: {
        ...completeInput.childBudget,
        hasChildren: undefined,
        childAges: [5],
      },
    });

    expect(childBudget.originalSignal.status).toBe("insufficient-information");
    expect(childBudget.inferredValues.map((item) => item.inferenceId)).toContain(
      "allowance.child-budget.infer-children-present-from-ages",
    );
    expect(childBudget.resolvedAnswers["children.hasChildren"]).toMatchObject({
      state: "inferred",
      value: true,
      overridable: true,
    });
    expect(childBudget.inferredValues[0].value.inputReferences).toEqual([
      { fieldId: "children.childAges", answerState: "known" },
    ]);
  });

  it("does not infer when source input is not sufficiently safe", () => {
    const childBudget = assessment("child-budget", {
      ...completeInput,
      childBudget: {
        ...completeInput.childBudget,
        hasChildren: undefined,
        childAges: undefined,
      },
    });

    expect(childBudget.inferredValues).toHaveLength(0);
    expect(childBudget.resolvedAnswers["children.hasChildren"]).toMatchObject({
      state: "unknown",
    });
  });

  it("deduplicates deterministic recommendation output", () => {
    const healthcare = assessment("healthcare", { year: 2026 });
    const recommendationIds = healthcare.recommendations.map((item) => item.recommendationId);

    expect(recommendationIds).toEqual([...new Set(recommendationIds)]);
    expect(recommendationIds).toEqual([...recommendationIds].sort((left, right) => {
      const leftItem = healthcare.recommendations.find((item) => item.recommendationId === left);
      const rightItem = healthcare.recommendations.find((item) => item.recommendationId === right);
      return (leftItem?.priority ?? 0) - (rightItem?.priority ?? 0) || left.localeCompare(right);
    }));
  });

  it("covers existing allowance statuses", () => {
    expect(assessment("healthcare").originalSignal.status).toBe("possible");
    expect(assessment("healthcare", { ...completeInput, age: 17 }).originalSignal.status).toBe("probably-not");
    expect(assessment("rent").originalSignal.status).toBe("official-calculation-recommended");
    expect(assessment("healthcare", { year: 2026 }).originalSignal.status).toBe("insufficient-information");
  });

  it("is deterministic and one run does not affect the next", () => {
    const first = unwrap();
    const second = unwrap();

    expect(first).toEqual(second);
    expect(first.assessments[0]).not.toBe(second.assessments[0]);
  });
});
