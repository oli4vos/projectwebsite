import { describe, expect, it } from "vitest";

import { buildConfidenceAssessment } from "@/lib/regulations/confidence";
import type { RegulationDefinition } from "@/lib/regulations/definition";
import {
  buildRecommendations,
  collectRecommendationEvidence,
  filterSuppressedRecommendations,
  mergeRecommendations,
  sortRecommendations,
} from "@/lib/regulations/recommendations";
import type { RecommendationResult } from "@/lib/regulations/recommendations";
import type { InferenceResult, UnknownResolution } from "@/lib/regulations/unknown";
import type { RegulationEvaluationResult } from "@/lib/regulations/types";
import type { SourceReference } from "@/lib/financial-constants";

const sourceReference: SourceReference = {
  label: "Testbron",
  sourceName: "Testuitvoerder",
  sourceUrl: "https://example.com/regulation",
  sourceType: "official-execution",
  referenceDate: "2026-07-20",
  year: 2026,
  effectiveFrom: "2026-01-01",
  effectiveTo: "2026-12-31",
  methodology: "Testbron voor recommendation engine.",
  methodologyType: "official-norm",
  freshnessStatus: "fresh",
  datasetId: "test-regulation-2026",
  version: "1.0.0",
};

const confidence = buildConfidenceAssessment({ baseScore: 80 });
if (!confidence.ok) {
  throw new Error("Invalid confidence fixture");
}
const confidenceValue = confidence.value;

function definition(): RegulationDefinition {
  return {
    regulationId: "regulation.test",
    displayName: "Testregeling",
    shortDescription: "Generieke testregeling.",
    category: "other",
    domain: "generic",
    sourceReferences: [sourceReference],
    sourceYear: 2026,
    validFrom: "2026-01-01",
    reviewPolicy: {
      cadence: "annual",
      nextReviewAt: "2026-11-15",
      reasonCodes: ["annual-review"],
    },
    inputDefinitions: [],
    questionDefinitions: [],
    evidenceStrategy: {
      expectedRuleIds: [],
      expectedSourceReferenceIds: ["test-regulation-2026"],
      requiredInputFields: ["missingField"],
      reasonCodes: ["evidence-metadata"],
    },
    recommendationStrategy: {
      enabled: true,
      expectedActionTypes: [
        "run-project-tool",
        "apply-officially",
      ],
      reasonCodes: ["definition-recommendation"],
    },
    estimateStrategy: {
      supported: false,
      estimateType: "none",
      confidenceRequired: true,
      officialVerificationRequired: true,
      reasonCodes: ["estimate-not-implemented"],
    },
    adapter: {
      adapterId: "test-adapter",
      adapterVersion: "0.1.0",
      supportedResultVersion: "regulation-evaluation-result.v1",
      relatedTools: ["test-tool"],
    },
  };
}

function evaluation(overrides: Partial<RegulationEvaluationResult> = {}): RegulationEvaluationResult {
  return {
    regulationId: "regulation.test",
    status: "possibly-relevant",
    signal: "possibly-relevant",
    confidence: confidenceValue,
    uncertainties: [],
    evidence: {
      usedRuleIds: ["rule.test"],
      sourceReferences: [sourceReference],
      inputFieldIds: ["missingField"],
      inferredValueIds: [],
      assumptions: [],
      excludedRuleIds: ["excluded.rule"],
      missingFieldIds: ["missingField"],
      confidenceFactorIds: [],
      uncertaintyCodes: [],
      validity: { referenceDate: "2026-07-20" },
    },
    recommendations: [],
    actionPlan: [],
    complexity: {
      level: "normal",
      reasonCodes: [],
      affectedRegulationIds: [],
      affectedRuleIds: [],
      confidenceImpact: 0,
      officialVerificationRecommended: false,
    },
    sourceYear: 2026,
    validity: { referenceDate: "2026-07-20" },
    officialVerification: {
      required: true,
      reasonCodes: ["official-check"],
      sourceReferences: [sourceReference],
    },
    ...overrides,
  };
}

const blockingUnknown: UnknownResolution = {
  fieldId: "missingField",
  resolutionType: "blocking",
  known: false,
  unknown: true,
  inferable: false,
  requiresOfficialSource: false,
  alternativeQuestion: false,
  blocking: true,
  reasonCodes: ["missing-field"],
  confidenceImpact: -30,
  requiredSources: [],
};

const officialUnknown: UnknownResolution = {
  fieldId: "officialField",
  resolutionType: "requires-official-source",
  known: false,
  unknown: true,
  inferable: false,
  requiresOfficialSource: true,
  alternativeQuestion: false,
  blocking: false,
  reasonCodes: ["official-source-needed"],
  confidenceImpact: -20,
  requiredSources: [],
};

const alternativeUnknown: UnknownResolution = {
  fieldId: "alternativeField",
  resolutionType: "alternative-question",
  known: false,
  unknown: true,
  inferable: false,
  requiresOfficialSource: false,
  alternativeQuestion: true,
  blocking: false,
  reasonCodes: ["alternative-question-needed"],
  confidenceImpact: -8,
  nextQuestionCandidate: "question.alternative",
  requiredSources: [],
};

function inference(): InferenceResult {
  return {
    inferenceId: "infer.test",
    targetField: "inferredField",
    sourceFields: ["sourceField"],
    inferredValue: "derived",
    confidenceModifier: -5,
    overwriteAllowed: true,
    reasonCodes: ["inference-used"],
    evidenceReferences: ["test-regulation-2026"],
    value: {
      inferenceId: "infer.test",
      targetFieldId: "inferredField",
      value: "derived",
      inputReferences: [{ fieldId: "sourceField", answerState: "known" }],
      method: "domain-adapter",
      confidence: confidenceValue,
      evidence: {
        evidenceId: "infer.test.evidence",
        ruleIds: [],
        sourceReferences: [sourceReference],
        reasonCodes: ["inference-used"],
      },
      overridable: true,
      reasonCodes: ["inference-used"],
    },
  };
}

function recommendation(overrides: Partial<RecommendationResult> = {}): RecommendationResult {
  return {
    recommendationId: "regulation.test.collect-data",
    priority: 20,
    urgency: "medium",
    type: "collect-data",
    titleCode: "regulation.test.collect-data.title",
    explanationCode: "regulation.test.collect-data.explanation",
    reasonCodes: ["base"],
    sourceReferences: [sourceReference],
    relatedFields: ["fieldA"],
    relatedTools: ["toolA"],
    dependsOn: ["dependencyA"],
    confidenceImpact: -10,
    suppressed: false,
    ...overrides,
  };
}

describe("regulations recommendation engine", () => {
  it("builds every supported recommendation type from metadata", () => {
    const results = buildRecommendations({
      definition: {
        ...definition(),
        recommendationStrategy: {
          enabled: true,
          expectedActionTypes: [
            "collect-data",
            "verify-officially",
            "run-project-tool",
            "apply-officially",
            "monitor-year-change",
            "review-later",
            "not-relevant-now",
          ],
          reasonCodes: ["all-types"],
        },
      },
      evaluation: evaluation({ status: "not-relevant", signal: "probably-not-relevant" }),
    });

    expect(results.map((item) => item.type)).toEqual([
      "collect-data",
      "verify-officially",
      "apply-officially",
      "run-project-tool",
      "monitor-year-change",
      "review-later",
      "not-relevant-now",
    ]);
    for (const item of results) {
      expect(item.titleCode).toBe(`${item.recommendationId}.title`);
      expect(item.explanationCode).toBe(`${item.recommendationId}.explanation`);
      expect(item.reasonCodes.length).toBeGreaterThan(0);
    }
  });

  it("prioritizes and sorts deterministically", () => {
    const sorted = sortRecommendations([
      recommendation({ recommendationId: "z", priority: 20, urgency: "low" }),
      recommendation({ recommendationId: "a", priority: 10, urgency: "medium" }),
      recommendation({ recommendationId: "b", priority: 10, urgency: "high" }),
    ]);

    expect(sorted.map((item) => item.recommendationId)).toEqual(["b", "a", "z"]);
    expect(Object.isFrozen(sorted)).toBe(true);
  });

  it("deduplicates and preserves strongest metadata", () => {
    const merged = mergeRecommendations([
      recommendation({
        priority: 50,
        urgency: "low",
        reasonCodes: ["a"],
        relatedFields: ["fieldA"],
        relatedTools: ["toolA"],
        dependsOn: ["dependencyA"],
        confidenceImpact: -5,
      }),
      recommendation({
        priority: 10,
        urgency: "high",
        reasonCodes: ["b"],
        relatedFields: ["fieldB"],
        relatedTools: ["toolB"],
        dependsOn: ["dependencyB"],
        confidenceImpact: -20,
      }),
    ]);

    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({
      priority: 10,
      urgency: "high",
      reasonCodes: ["a", "b"],
      relatedFields: ["fieldA", "fieldB"],
      relatedTools: ["toolA", "toolB"],
      dependsOn: ["dependencyA", "dependencyB"],
      confidenceImpact: -20,
    });
  });

  it("filters suppressed recommendations", () => {
    const filtered = filterSuppressedRecommendations([
      recommendation({ recommendationId: "visible" }),
      recommendation({ recommendationId: "hidden", suppressed: true }),
    ]);

    expect(filtered.map((item) => item.recommendationId)).toEqual(["visible"]);
    expect(Object.isFrozen(filtered)).toBe(true);
  });

  it("builds recommendations from unknowns and inferences", () => {
    const results = buildRecommendations({
      definition: definition(),
      evaluation: evaluation(),
      unknownResolutions: [blockingUnknown, officialUnknown, alternativeUnknown],
      inferences: [inference()],
    });

    expect(results.map((item) => item.type)).toEqual([
      "collect-data",
      "verify-officially",
      "apply-officially",
      "run-project-tool",
      "monitor-year-change",
      "review-later",
    ]);
    const collectData = results.find((item) => item.type === "collect-data");
    expect(collectData).toMatchObject({
      relatedFields: ["missingField", "alternativeField"],
      confidenceImpact: -30,
    });
    expect(collectData?.dependsOn).toContain("question.alternative");
  });

  it("carries source references, related tools and dependencies", () => {
    const results = buildRecommendations({
      definition: definition(),
      evaluation: evaluation(),
      unknownResolutions: [alternativeUnknown],
      inferences: [inference()],
    });
    const review = results.find((item) => item.type === "review-later");
    const runTool = results.find((item) => item.type === "run-project-tool");

    expect(review?.sourceReferences).toEqual([sourceReference]);
    expect(review?.relatedFields).toEqual(["inferredField", "sourceField"]);
    expect(review?.dependsOn).toEqual(["infer.test"]);
    expect(runTool?.relatedTools).toEqual(["test-tool"]);
    expect(collectRecommendationEvidence(results)).toEqual([sourceReference]);
  });

  it("suppresses requested recommendation ids after merge", () => {
    const results = buildRecommendations({
      definition: definition(),
      evaluation: evaluation(),
      suppressedRecommendationIds: ["regulation.test.run-project-tool"],
    });

    expect(results.map((item) => item.recommendationId)).not.toContain(
      "regulation.test.run-project-tool",
    );
  });

  it("builds deterministic immutable output", () => {
    const input = {
      definition: definition(),
      evaluation: evaluation(),
      unknownResolutions: [blockingUnknown, officialUnknown],
      inferences: [inference()],
    };
    const first = buildRecommendations(input);
    const second = buildRecommendations(input);

    expect(first).toEqual(second);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first[0])).toBe(true);
  });
});
