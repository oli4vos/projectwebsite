import { describe, expect, it } from "vitest";

import { buildConfidenceAssessment } from "@/lib/regulations/confidence";
import { createEstimateRange } from "@/lib/regulations/estimate";
import {
  createUnavailableEstimateResult,
  createEstimateResult,
  mergeEstimateRanges,
  mergeEstimateResults,
  propagateEstimateConfidence,
} from "@/lib/regulations/estimate-engine";
import type { EstimateResult, EstimateSource, EstimateStrategy } from "@/lib/regulations/estimate-engine";
import type { ConfidenceAssessment, EstimateRange } from "@/lib/regulations/types";
import type { SourceReference } from "@/lib/financial-constants";

const sourceReference: SourceReference = {
  label: "Generieke testbron",
  sourceName: "Testbron",
  sourceUrl: "https://example.com/estimate-source",
  sourceType: "project-assumption",
  referenceDate: "2026-07-20",
  year: 2026,
  effectiveFrom: "2026-01-01",
  effectiveTo: "2026-12-31",
  methodology: "Generieke testbron zonder wettelijke bedragen.",
  methodologyType: "project-assumption",
  freshnessStatus: "fresh",
  datasetId: "generic-estimate-source-2026",
  version: "1.0.0",
};

const source: EstimateSource = {
  sourceId: "generic-source",
  sourceType: "project-assumption",
  sourceReferences: [sourceReference],
  reasonCodes: ["generic-source"],
  validFrom: "2026-01-01",
  validUntil: "2026-12-31",
};

const strategy: EstimateStrategy = {
  strategyId: "generic-estimate-strategy",
  estimateType: "amount-range",
  rangeMergePolicy: "union",
  confidencePolicy: "minimum",
  minimumConfidenceLevel: "low",
  officialVerificationRequired: true,
  reasonCodes: ["generic-estimate-strategy"],
};

function confidence(score: number, explanationCode: string): ConfidenceAssessment {
  const result = buildConfidenceAssessment({
    baseScore: score,
    explanationCodes: [explanationCode],
  });
  if (!result.ok) {
    throw new Error(result.errors.join(", "));
  }

  return result.value;
}

function range(input: {
  minimum: number;
  likely: number;
  maximum: number;
  confidence: ConfidenceAssessment;
  unit?: "currency" | "count";
}): EstimateRange {
  const result = createEstimateRange({
    minimum: input.minimum,
    likely: input.likely,
    maximum: input.maximum,
    unit: input.unit ?? "currency",
    period: "month",
    sourceYear: 2026,
    confidence: input.confidence,
    assumptions: ["generic-assumption"],
    uncertaintyCodes: ["generic-uncertainty"],
    sourceReferences: [sourceReference],
    explanationCodes: ["generic-range"],
  });
  if (!result.ok) {
    throw new Error(result.errors.join(", "));
  }

  return result.value;
}

function estimate(id: string, estimateRange: EstimateRange = range({
  minimum: 10,
  likely: 20,
  maximum: 30,
  confidence: confidence(80, "high-confidence"),
})): EstimateResult {
  const result = createEstimateResult({
    estimateId: id,
    range: estimateRange,
    strategy,
    sources: [source],
    reasonCodes: [`${id}.reason`],
    warnings: [`${id}.warning`],
  });
  if (!result.ok) {
    throw new Error(result.errors.join(", "));
  }

  return result.value;
}

describe("regulations estimate engine", () => {
  it("creates immutable estimate results with confidence level and verification flag", () => {
    const result = estimate("estimate.a");

    expect(result.estimateId).toBe("estimate.a");
    expect(result.availability).toBe("available");
    expect(result.range).toBeDefined();
    expect(result.confidenceLevel).toBe("high");
    expect(result.officialVerificationRequired).toBe(true);
    expect(result.reasonCodes).toEqual(["estimate.a.reason", "generic-estimate-strategy"]);
    expect(result.assumptions).toEqual(["generic-assumption"]);
    expect(result.warnings).toEqual(["estimate.a.warning"]);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.range)).toBe(true);
    expect(Object.isFrozen(result.sources)).toBe(true);
  });

  it("creates signal-only unavailable estimate results without a range", () => {
    const result = createUnavailableEstimateResult({
      estimateId: "signal-only",
      strategy: {
        ...strategy,
        estimateType: "signal-only",
      },
      confidence: confidence(35, "signal-only-confidence"),
      sources: [source],
      availability: "signal-only",
      reasonCodes: ["amount-rules-not-modeled"],
      assumptions: ["signal-only"],
      officialVerificationRequired: true,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.availability).toBe("signal-only");
    expect(result.value.range).toBeUndefined();
    expect(result.value.confidenceLevel).toBe("low");
    expect(result.value.officialVerificationRequired).toBe(true);
    expect(result.value.reasonCodes).toEqual([
      "amount-rules-not-modeled",
      "generic-estimate-strategy",
    ]);
    expect(Object.isFrozen(result.value)).toBe(true);
  });

  it("rejects missing estimate metadata", () => {
    const result = createEstimateResult({
      estimateId: "",
      range: range({ minimum: 1, likely: 2, maximum: 3, confidence: confidence(60, "medium") }),
      strategy,
      sources: [],
    });

    expect(result).toEqual({
      ok: false,
      errors: ["missing-estimate-id", "missing-estimate-sources"],
    });
  });

  it("merges ranges with union policy", () => {
    const propagated = propagateEstimateConfidence([
      confidence(80, "first"),
      confidence(60, "second"),
    ]);
    expect(propagated.ok).toBe(true);
    if (!propagated.ok) return;

    const merged = mergeEstimateRanges({
      ranges: [
        range({ minimum: 10, likely: 20, maximum: 30, confidence: confidence(80, "first") }),
        range({ minimum: 5, likely: 15, maximum: 40, confidence: confidence(60, "second") }),
      ],
      policy: "union",
      confidence: propagated.value,
      assumptions: ["merged-assumption"],
    });

    expect(merged.ok).toBe(true);
    if (!merged.ok) return;
    expect(merged.value.minimum).toBe(5);
    expect(merged.value.maximum).toBe(40);
    expect(merged.value.likely).toBe(17.5);
    expect(merged.value.confidence.label).toBe("medium");
    expect(merged.value.assumptions).toEqual(["generic-assumption", "merged-assumption"]);
  });

  it("merges ranges with intersection policy and rejects empty intersections", () => {
    const merged = mergeEstimateRanges({
      ranges: [
        range({ minimum: 10, likely: 20, maximum: 30, confidence: confidence(80, "first") }),
        range({ minimum: 15, likely: 22, maximum: 25, confidence: confidence(70, "second") }),
      ],
      policy: "intersection",
      confidence: confidence(70, "intersection"),
    });
    const empty = mergeEstimateRanges({
      ranges: [
        range({ minimum: 10, likely: 12, maximum: 15, confidence: confidence(80, "first") }),
        range({ minimum: 20, likely: 22, maximum: 25, confidence: confidence(70, "second") }),
      ],
      policy: "intersection",
      confidence: confidence(70, "intersection"),
    });

    expect(merged.ok).toBe(true);
    if (merged.ok) {
      expect(merged.value.minimum).toBe(15);
      expect(merged.value.maximum).toBe(25);
    }
    expect(empty).toEqual({
      ok: false,
      errors: ["estimate-range-intersection-empty"],
    });
  });

  it("propagates confidence using minimum and average policies", () => {
    const minimum = propagateEstimateConfidence([
      confidence(80, "first"),
      confidence(40, "second"),
    ], "minimum");
    const average = propagateEstimateConfidence([
      confidence(80, "first"),
      confidence(40, "second"),
    ], "average");

    expect(minimum.ok && minimum.value.score).toBe(40);
    expect(minimum.ok && minimum.value.label).toBe("low");
    expect(average.ok && average.value.score).toBe(60);
    expect(average.ok && average.value.label).toBe("medium");
  });

  it("rejects incompatible range metadata", () => {
    const merged = mergeEstimateRanges({
      ranges: [
        range({ minimum: 1, likely: 2, maximum: 3, confidence: confidence(80, "first") }),
        range({ minimum: 1, likely: 2, maximum: 3, confidence: confidence(80, "second"), unit: "count" }),
      ],
      policy: "union",
      confidence: confidence(80, "merged"),
    });

    expect(merged).toEqual({
      ok: false,
      errors: ["estimate-unit-mismatch"],
    });
  });

  it("merges estimate results and propagates official verification", () => {
    const merged = mergeEstimateResults({
      estimateId: "merged",
      estimates: [
        estimate("a", range({ minimum: 10, likely: 15, maximum: 20, confidence: confidence(80, "first") })),
        estimate("b", range({ minimum: 12, likely: 18, maximum: 25, confidence: confidence(50, "second") })),
      ],
      strategy: {
        ...strategy,
        confidencePolicy: "minimum",
        rangeMergePolicy: "union",
        officialVerificationRequired: false,
      },
    });

    expect(merged.ok).toBe(true);
    if (!merged.ok) return;
    expect(merged.value.estimateId).toBe("merged");
    expect(merged.value.range).toBeDefined();
    if (!merged.value.range) return;
    expect(merged.value.range.minimum).toBe(10);
    expect(merged.value.range.maximum).toBe(25);
    expect(merged.value.confidence.score).toBe(50);
    expect(merged.value.confidenceLevel).toBe("medium");
    expect(merged.value.officialVerificationRequired).toBe(true);
    expect(merged.value.sources).toHaveLength(2);
  });

  it("rejects result merging when an estimate has no range", () => {
    const unavailable = createUnavailableEstimateResult({
      estimateId: "signal-only",
      strategy: { ...strategy, estimateType: "signal-only" },
      confidence: confidence(35, "signal-only-confidence"),
      sources: [source],
      availability: "signal-only",
    });
    expect(unavailable.ok).toBe(true);
    if (!unavailable.ok) return;

    expect(mergeEstimateResults({
      estimateId: "merged",
      estimates: [unavailable.value],
      strategy,
    })).toEqual({
      ok: false,
      errors: ["estimate-result-range-missing"],
    });
  });

  it("is deterministic across repeated merges", () => {
    const estimates = [
      estimate("a", range({ minimum: 10, likely: 15, maximum: 20, confidence: confidence(80, "first") })),
      estimate("b", range({ minimum: 12, likely: 18, maximum: 25, confidence: confidence(50, "second") })),
    ];
    const first = mergeEstimateResults({ estimateId: "merged", estimates, strategy });
    const second = mergeEstimateResults({ estimateId: "merged", estimates, strategy });

    expect(first).toEqual(second);
  });
});
