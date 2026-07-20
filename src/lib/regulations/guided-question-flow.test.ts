import { describe, expect, it } from "vitest";

import type { SourceReference } from "@/lib/financial-constants";
import { createRegulationDefinition, type RegulationDefinition } from "@/lib/regulations/definition";
import { buildQuestionFlow } from "@/lib/regulations/question-flow";
import type { InferenceResult, UnknownResolution } from "@/lib/regulations/unknown";
import type { AnswerState, ConfidenceAssessment } from "@/lib/regulations/types";

const sourceReference: SourceReference = {
  label: "Guided flow test source",
  sourceName: "Project Site",
  sourceUrl: "https://example.com/guided-flow",
  sourceType: "project-assumption",
  referenceDate: "2026-07-20",
  year: 2026,
  effectiveFrom: "2026-01-01",
  effectiveTo: "2026-12-31",
  methodology: "Test source for generic guided question flow.",
  methodologyType: "project-assumption",
  freshnessStatus: "fresh",
  datasetId: "guided-flow-test-2026",
  version: "1.0.0",
};

const confidence: ConfidenceAssessment = {
  score: 70,
  label: "medium",
  factors: [],
  missingFields: [],
  uncertaintyCodes: [],
  explanationCodes: ["guided-flow-confidence"],
};

function answer(state: AnswerState): AnswerState {
  return state;
}

function definition(overrides: Partial<RegulationDefinition> = {}): RegulationDefinition {
  const result = createRegulationDefinition({
    regulationId: "guided.flow",
    displayName: "Guided flow",
    shortDescription: "Generic guided advisor flow contract.",
    category: "other",
    domain: "generic",
    sourceReferences: [sourceReference],
    sourceYear: 2026,
    validFrom: "2026-01-01",
    reviewPolicy: {
      cadence: "manual",
      reasonCodes: ["guided-flow-review"],
    },
    inputDefinitions: [
      field("income", true, [
        route("income.salary", "q.salary", "salary", 1, true),
        route("income.benefit", "q.benefit", "benefit", 2, false),
        route("income.business", "q.business", "businessIncome", 3, true),
      ]),
      field("salary", false),
      field("benefit", false),
      field("businessIncome", false),
      field("partner", false),
      field("partnerIncome", false),
      field("inferredRent", false, [], true),
      field("rentSource", false),
      field("skipAllowed", false),
    ],
    questionDefinitions: [
      question("q.income", "income", 0),
      question("q.salary", "salary", 1, { dependsOn: ["income"] }),
      question("q.benefit", "benefit", 2, { dependsOn: ["income"] }),
      question("q.business", "businessIncome", 3, { dependsOn: ["income"] }),
      question("q.partner", "partner", 4),
      question("q.partner-income", "partnerIncome", 5, {
        dependsOn: ["partner"],
        condition: { type: "equals", fieldId: "partner", value: true },
      }),
      question("q.rent-source", "rentSource", 6),
      question("q.inferred-rent", "inferredRent", 7, { dependsOn: ["rentSource"] }),
      question("q.skip-allowed", "skipAllowed", 8),
    ],
    evidenceStrategy: {
      expectedRuleIds: ["guided.rule"],
      expectedSourceReferenceIds: ["guided-flow-test-2026"],
      requiredInputFields: ["income"],
      reasonCodes: ["guided-evidence"],
    },
    recommendationStrategy: {
      enabled: true,
      expectedActionTypes: ["collect-data"],
      reasonCodes: ["guided-recommendation"],
    },
    estimateStrategy: {
      supported: false,
      estimateType: "signal-only",
      confidenceRequired: true,
      officialVerificationRequired: true,
      reasonCodes: ["guided-no-estimate"],
    },
    adapter: {
      adapterId: "guided-flow-test",
      adapterVersion: "1.0.0",
      supportedResultVersion: "regulation-evaluation-result.v1",
      relatedTools: ["guided-flow-test"],
    },
    ...overrides,
  });

  if (!result.ok) {
    throw new Error(result.errors.join(", "));
  }

  return result.value;
}

function field(
  fieldId: string,
  required: boolean,
  alternativeQuestions: NonNullable<UnknownResolution["alternativeQuestionCandidates"]> = [],
  supportsInference = false,
) {
  return {
    fieldId,
    datatype: "currency" as const,
    required,
    optional: !required,
    nullable: true,
    supportsUnknown: true,
    supportsInference,
    validationType: "currency" as const,
    explanationCode: `${fieldId}.explanation`,
    unknownStrategy: {
      allowed: !required,
      inferable: supportsInference,
      officialSourceAvailable: required,
      confidenceImpact: required ? -20 : -5,
      followUpPossible: alternativeQuestions.length > 0,
      alternativeQuestions,
      skipAllowed: fieldId === "skipAllowed",
      confirmationRequired: supportsInference,
      reasonCodes: [`unknown.${fieldId}`],
    },
    inference: {
      inferable: supportsInference,
      preferredSources: supportsInference ? ["rentSource"] : [],
      overwritePolicy: supportsInference ? "allow-with-warning" as const : "not-applicable" as const,
      confidenceModifier: supportsInference ? -5 : 0,
      reasonCodes: [`inference.${fieldId}`],
    },
  };
}

function route(
  routeId: string,
  questionId: string,
  fieldId: string,
  priority: number,
  blocking: boolean,
) {
  return {
    routeId,
    questionId,
    fieldId,
    labelKey: `${routeId}.label`,
    descriptionKey: `${routeId}.description`,
    priority,
    blocking,
    confirmationRequired: false,
    reasonCodes: [`route.${routeId}`],
  };
}

function question(
  questionId: string,
  fieldId: string,
  order: number,
  overrides: Partial<RegulationDefinition["questionDefinitions"][number]> = {},
) {
  return {
    questionId,
    fieldId,
    groupId: "guided",
    titleKey: `${questionId}.title`,
    descriptionKey: `${questionId}.description`,
    dependsOn: [],
    requiredWhen: "when-condition-true" as const,
    confidenceImpact: 10 - order,
    evidenceContribution: [`evidence.${fieldId}`],
    ...overrides,
  };
}

function incomeUnknown(): UnknownResolution {
  return {
    fieldId: "income",
    resolutionType: "alternative-question",
    known: false,
    unknown: true,
    inferable: false,
    requiresOfficialSource: true,
    alternativeQuestion: true,
    blocking: false,
    reasonCodes: ["unknown.income"],
    confidenceImpact: -20,
    nextQuestionCandidate: "q.salary",
    alternativeQuestionCandidates: [
      route("income.salary", "q.salary", "salary", 1, true),
      route("income.benefit", "q.benefit", "benefit", 2, false),
      route("income.business", "q.business", "businessIncome", 3, true),
    ],
    skipAllowed: false,
    confirmationRequired: false,
    requiredSources: ["jaaropgave", "loonstrook"],
  };
}

function inferredRent(): InferenceResult<number> {
  return {
    inferenceId: "infer.rent",
    targetField: "inferredRent",
    sourceFields: ["rentSource"],
    inferredValue: 850,
    confidenceModifier: -5,
    overwriteAllowed: true,
    reasonCodes: ["rent-inferred"],
    evidenceReferences: ["guided-flow-test-2026"],
    value: {
      inferenceId: "infer.rent",
      targetFieldId: "inferredRent",
      value: 850,
      inputReferences: [{ fieldId: "rentSource", answerState: "known" }],
      method: "domain-adapter",
      confidence,
      evidence: {
        evidenceId: "infer.rent.evidence",
        ruleIds: [],
        sourceReferences: [sourceReference],
        reasonCodes: ["rent-inferred"],
      },
      overridable: true,
      reasonCodes: ["rent-inferred"],
    },
  };
}

describe("guided regulation question flow", () => {
  it("offers multiple alternative paths and selects the highest priority route by default", () => {
    const flow = buildQuestionFlow({
      definition: definition(),
      answers: [answer({ state: "unknown", fieldId: "income", reasonCodes: ["unknown.income"] })],
      unknownResolutions: [incomeUnknown()],
    });

    const income = flow.questions.find((item) => item.questionId === "q.income");

    expect(income?.completed).toBe(false);
    expect(income?.alternativeQuestionIds).toEqual(["q.salary", "q.benefit", "q.business"]);
    expect(flow.decision.nextQuestionId).toBe("q.salary");
    expect(flow.decision.completionState).toBe("unresolved");
    expect(flow.summary.unresolvedQuestionIds).toEqual(["q.income"]);
    expect(flow.summary.alternativeRouteIds).toEqual([
      "income.salary",
      "income.benefit",
      "income.business",
    ]);
  });

  it("honours selected alternative paths and dependency chains", () => {
    const flow = buildQuestionFlow({
      definition: definition(),
      answers: [
        answer({ state: "unknown", fieldId: "income", reasonCodes: ["unknown.income"] }),
        answer({ state: "known", fieldId: "partner", value: true }),
      ],
      unknownResolutions: [incomeUnknown()],
      flowState: {
        selectedAlternativeRouteIds: ["income.business"],
        visitedQuestionIds: ["q.income", "q.partner"],
      },
    });

    expect(flow.decision.nextQuestionId).toBe("q.business");
    expect(flow.questions.find((item) => item.questionId === "q.partner-income")?.relevant).toBe(true);
    expect(flow.navigation).toMatchObject({
      currentQuestionId: "q.business",
      previousQuestionId: "q.partner",
      canGoBack: true,
    });
  });

  it("tracks inferred answers that still need confirmation", () => {
    const flow = buildQuestionFlow({
      definition: definition(),
      answers: [
        answer({ state: "known", fieldId: "rentSource", value: 850 }),
        answer({ state: "inferred", fieldId: "inferredRent", value: 850, inferenceId: "infer.rent", overridable: true }),
      ],
      inferences: [inferredRent()],
      flowState: {
        requireInferredConfirmation: true,
      },
    });

    expect(flow.questions.find((item) => item.fieldId === "inferredRent")?.confirmationRequired).toBe(true);
    expect(flow.questions.find((item) => item.fieldId === "inferredRent")?.completed).toBe(false);
    expect(flow.summary.pendingConfirmationQuestionIds).toContain("q.inferred-rent");
    expect(flow.decision.completionState).toBe("unresolved");
  });

  it("marks inferred answers complete after confirmation", () => {
    const flow = buildQuestionFlow({
      definition: definition(),
      answers: [
        answer({ state: "known", fieldId: "rentSource", value: 850 }),
        answer({ state: "inferred", fieldId: "inferredRent", value: 850, inferenceId: "infer.rent", overridable: true }),
      ],
      inferences: [inferredRent()],
      flowState: {
        requireInferredConfirmation: true,
        confirmedInferenceIds: ["infer.rent"],
      },
    });

    expect(flow.questions.find((item) => item.fieldId === "inferredRent")?.confirmed).toBe(true);
    expect(flow.summary.pendingConfirmationQuestionIds).toEqual([]);
  });

  it("supports skipping where the unknown strategy allows it", () => {
    const flow = buildQuestionFlow({
      definition: definition(),
      answers: [answer({ state: "unknown", fieldId: "skipAllowed", reasonCodes: ["unknown.skip"] })],
      unknownResolutions: [{
        fieldId: "skipAllowed",
        resolutionType: "non-blocking",
        known: false,
        unknown: true,
        inferable: false,
        requiresOfficialSource: false,
        alternativeQuestion: false,
        blocking: false,
        reasonCodes: ["unknown.skip"],
        confidenceImpact: -5,
        skipAllowed: true,
        confirmationRequired: false,
        alternativeQuestionCandidates: [],
        requiredSources: [],
      }],
      flowState: {
        skippedQuestionIds: ["q.skip-allowed"],
      },
    });

    expect(flow.questions.find((item) => item.questionId === "q.skip-allowed")?.status).toBe("skipped");
    expect(flow.summary.skippedQuestionIds).toContain("q.skip-allowed");
  });

  it("detects circular dependency chains", () => {
    const cyclicDefinition = definition({
      questionDefinitions: [
        question("q.a", "income", 0, { dependsOn: ["salary"] }),
        question("q.b", "salary", 1, { dependsOn: ["income"] }),
      ],
    });
    const flow = buildQuestionFlow({ definition: cyclicDefinition });

    expect(flow.integrity.ok).toBe(false);
    expect(flow.integrity.issues[0]).toMatchObject({
      code: "question-flow.circular-dependency",
      questionIds: ["q.a", "q.b", "q.a"],
    });
  });

  it("returns blocked and unresolved completion states without calculation knowledge", () => {
    const blocked = buildQuestionFlow({
      definition: definition(),
      answers: [answer({ state: "unknown", fieldId: "income", reasonCodes: ["missing"] })],
      unknownResolutions: [{ ...incomeUnknown(), blocking: true, resolutionType: "blocking" }],
    });
    const unresolved = buildQuestionFlow({
      definition: definition(),
      answers: [answer({ state: "unknown", fieldId: "income", reasonCodes: ["missing"] })],
      unknownResolutions: [incomeUnknown()],
      flowState: { selectedAlternativeRouteIds: ["income.salary"] },
    });

    expect(blocked.decision.completionState).toBe("blocked");
    expect(unresolved.decision.completionState).toBe("unresolved");
    expect(unresolved.summary.unresolvedQuestionIds).toEqual(["q.income"]);
  });

  it("is deterministic and immutable", () => {
    const input = {
      definition: definition(),
      answers: [answer({ state: "unknown", fieldId: "income", reasonCodes: ["unknown.income"] })],
      unknownResolutions: [incomeUnknown()],
      flowState: { selectedAlternativeRouteIds: ["income.benefit"] },
    };
    const first = buildQuestionFlow(input);
    const second = buildQuestionFlow(input);

    expect(first).toEqual(second);
    expect(Object.isFrozen(first)).toBe(true);
    expect(Object.isFrozen(first.questions)).toBe(true);
    expect(Object.isFrozen(first.questions[0].alternativeQuestions)).toBe(true);
  });
});
