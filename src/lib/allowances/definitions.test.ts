import { describe, expect, it } from "vitest";

import { getAllowanceRegulationId } from "@/lib/allowances/adapter";
import {
  ALLOWANCE_REGULATION_DEFINITIONS,
  getAllowanceRegulationDefinition,
} from "@/lib/allowances/definitions";
import type { AllowanceKind } from "@/lib/allowances/signaling";

const allowanceKinds: readonly AllowanceKind[] = [
  "healthcare",
  "rent",
  "child-budget",
  "childcare",
];

describe("allowance regulation definitions", () => {
  it("defines all four allowance regulations with adapter-matching ids", () => {
    expect(Object.keys(ALLOWANCE_REGULATION_DEFINITIONS)).toEqual([
      "healthcare",
      "rent",
      "child-budget",
      "childcare",
    ]);

    for (const kind of allowanceKinds) {
      const definition = getAllowanceRegulationDefinition(kind);
      expect(definition.regulationId).toBe(getAllowanceRegulationId(kind));
      expect(definition.category).toBe("allowance");
      expect(definition.domain).toBe("allowances");
      expect(definition.sourceYear).toBe(2026);
      expect(definition.validFrom).toBe("2026-01-01");
      expect(definition.validUntil).toBe("2026-12-31");
    }
  });

  it("keeps fieldIds and questionIds unique per definition", () => {
    for (const kind of allowanceKinds) {
      const definition = getAllowanceRegulationDefinition(kind);
      const fieldIds = definition.inputDefinitions.map((field) => field.fieldId);
      const questionIds = definition.questionDefinitions.map((question) => question.questionId);

      expect(fieldIds).toHaveLength(new Set(fieldIds).size);
      expect(questionIds).toHaveLength(new Set(questionIds).size);
      expect(fieldIds.length).toBeGreaterThan(0);
      expect(questionIds.length).toBe(fieldIds.length);
    }
  });

  it("uses existing source references and source metadata", () => {
    for (const kind of allowanceKinds) {
      const definition = getAllowanceRegulationDefinition(kind);

      expect(definition.sourceReferences.length).toBeGreaterThan(1);
      expect(definition.sourceReferences.every((source) => source.datasetId === "allowance-signal-rules-2026")).toBe(true);
      expect(definition.sourceReferences.every((source) => source.version === "1.0.0")).toBe(true);
      expect(definition.sourceReferences.every((source) => source.year === 2026)).toBe(true);
      expect(definition.sourceReferences.every((source) => source.sourceUrl.startsWith("https://"))).toBe(true);
      expect(definition.reviewPolicy).toEqual({
        cadence: "annual",
        nextReviewAt: "2026-11-15",
        reasonCodes: ["allowance-source-annual-review"],
      });
    }
  });

  it("keeps adapter metadata stable and estimate strategy signal-only", () => {
    for (const kind of allowanceKinds) {
      const definition = getAllowanceRegulationDefinition(kind);

      expect(definition.adapter).toEqual({
        adapterId: "allowance-regulations-adapter",
        adapterVersion: "0.1.0",
        supportedResultVersion: "regulation-evaluation-result.v1",
        relatedTools: ["toeslagen-scan"],
      });
      expect(definition.estimateStrategy).toEqual({
        supported: false,
        estimateType: "signal-only",
        confidenceRequired: true,
        officialVerificationRequired: true,
        reasonCodes: ["allowance-estimate-not-implemented"],
      });
    }
  });

  it("keeps definitions immutable and deterministic", () => {
    const first = allowanceKinds.map(getAllowanceRegulationDefinition);
    const second = allowanceKinds.map(getAllowanceRegulationDefinition);

    expect(first).toEqual(second);
    for (const definition of first) {
      expect(Object.isFrozen(definition)).toBe(true);
      expect(Object.isFrozen(definition.inputDefinitions)).toBe(true);
      expect(Object.isFrozen(definition.sourceReferences)).toBe(true);
    }
  });

  it("does not encode entitlement statuses or amount logic", () => {
    for (const kind of allowanceKinds) {
      const definition = getAllowanceRegulationDefinition(kind);
      const serialized = JSON.stringify(definition);

      expect(serialized).not.toContain("je-hebt-recht");
      expect(serialized).not.toContain("entitled");
      expect(serialized).not.toContain("amount-range");
      expect(definition.estimateStrategy.supported).toBe(false);
    }
  });
});
