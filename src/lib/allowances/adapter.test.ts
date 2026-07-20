import { describe, expect, it } from "vitest";

import {
  adaptAllowanceScanToRegulationResults,
  adaptAllowanceSignalToRegulationResult,
  getAllowanceRegulationId,
} from "@/lib/allowances/adapter";
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

function byKind(results: ReturnType<typeof evaluateAllowanceSignals>["results"], kind: AllowanceKind) {
  const result = results.find((item) => item.allowanceKind === kind);
  if (!result) {
    throw new Error(`Missing allowance result for ${kind}`);
  }

  return result;
}

describe("allowance regulations adapter", () => {
  it("maps all four current allowances to stable regulation ids", () => {
    const adapted = adaptAllowanceScanToRegulationResults(
      evaluateAllowanceSignals(completeInput),
    );

    expect(adapted.map((result) => result.regulationId)).toEqual([
      "allowance.healthcare",
      "allowance.rent",
      "allowance.child-budget",
      "allowance.childcare",
    ]);
    expect(adapted.map((result) => result.sourceYear)).toEqual([2026, 2026, 2026, 2026]);
    for (const result of adapted) {
      expect(result.estimateRange).toBeUndefined();
      expect(result.evidence.sourceReferences.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.actionPlan.length).toBeGreaterThan(0);
      expect(result.officialVerification.sourceReferences.length).toBeGreaterThan(0);
      expect(result.confidence.explanationCodes).toContain(
        "temporary-allowance-confidence-mapping",
      );
    }
  });

  it("keeps healthcare possible as signal-only output with high confidence", () => {
    const healthcare = byKind(evaluateAllowanceSignals(completeInput).results, "healthcare");
    const adapted = adaptAllowanceSignalToRegulationResult(healthcare);

    expect(healthcare.status).toBe("possible");
    expect(adapted.regulationId).toBe("allowance.healthcare");
    expect(adapted.status).toBe("possibly-relevant");
    expect(adapted.signal).toBe("possibly-relevant");
    expect(adapted.confidence.label).toBe("high");
    expect(adapted.officialVerification.required).toBe(true);
    expect(adapted.estimateRange).toBeUndefined();
    expect(adapted.evidence.assumptions).toContain("allowance-adapter-signal-only");
    expect(adapted.actionPlan.map((action) => action.type)).toEqual(
      expect.arrayContaining(["verify-officially", "run-project-tool"]),
    );
  });

  it("maps official calculation recommended signals to medium confidence and verification", () => {
    const scan = evaluateAllowanceSignals(completeInput);
    const rent = adaptAllowanceSignalToRegulationResult(byKind(scan.results, "rent"));
    const childBudget = adaptAllowanceSignalToRegulationResult(
      byKind(scan.results, "child-budget"),
    );
    const childcare = adaptAllowanceSignalToRegulationResult(
      byKind(scan.results, "childcare"),
    );

    for (const result of [rent, childBudget, childcare]) {
      expect(result.status).toBe("official-verification-required");
      expect(result.signal).toBe("official-check-needed");
      expect(result.confidence.label).toBe("medium");
      expect(result.officialVerification.required).toBe(true);
      expect(result.complexity.level).toBe("complex");
      expect(result.estimateRange).toBeUndefined();
      expect(result.evidence.usedRuleIds.length).toBeGreaterThan(0);
    }
  });

  it("maps insufficient information to low confidence, missing fields and collect-data action", () => {
    const healthcare = byKind(evaluateAllowanceSignals({ year: 2026 }).results, "healthcare");
    const adapted = adaptAllowanceSignalToRegulationResult(healthcare);

    expect(adapted.status).toBe("insufficient-data");
    expect(adapted.signal).toBe("insufficient-information");
    expect(adapted.confidence.label).toBe("low");
    expect(adapted.confidence.missingFields).toEqual(
      expect.arrayContaining([
        "age",
        "partnerStatus",
        "assessmentIncome",
        "assets",
        "healthcare.hasDutchHealthInsurance",
      ]),
    );
    expect(adapted.evidence.missingFieldIds).toEqual(adapted.confidence.missingFields);
    expect(adapted.actionPlan[0]).toMatchObject({
      type: "collect-data",
      blocking: true,
    });
    expect(adapted.recommendations[0]).toMatchObject({
      type: "collect-data",
      relatedTools: ["toeslagen-scan"],
    });
  });

  it("maps strong negative signals without inventing official amounts", () => {
    const healthcare = byKind(
      evaluateAllowanceSignals({
        ...completeInput,
        age: 17,
      }).results,
      "healthcare",
    );
    const adapted = adaptAllowanceSignalToRegulationResult(healthcare);

    expect(healthcare.status).toBe("probably-not");
    expect(adapted.status).toBe("not-relevant");
    expect(adapted.signal).toBe("probably-not-relevant");
    expect(adapted.confidence.label).toBe("high");
    expect(adapted.officialVerification.required).toBe(false);
    expect(adapted.evidence.excludedRuleIds).toEqual([
      "allowance.healthcare.hard-exclusion",
    ]);
    expect(adapted.estimateRange).toBeUndefined();
  });

  it("exposes the regulation id helper for all allowance kinds", () => {
    expect(getAllowanceRegulationId("healthcare")).toBe("allowance.healthcare");
    expect(getAllowanceRegulationId("rent")).toBe("allowance.rent");
    expect(getAllowanceRegulationId("child-budget")).toBe("allowance.child-budget");
    expect(getAllowanceRegulationId("childcare")).toBe("allowance.childcare");
  });
});
