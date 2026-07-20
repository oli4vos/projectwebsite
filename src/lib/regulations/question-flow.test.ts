import { describe, expect, it } from "vitest";

import type { SourceReference } from "@/lib/financial-constants";
import {
  buildQuestionFlow,
  determineBlockingQuestions,
  determineCompletedQuestions,
  determineNextQuestion,
  determineProgress,
  determineRemainingQuestions,
  determineSkippedQuestions,
} from "@/lib/regulations/question-flow";
import type { RegulationDefinition } from "@/lib/regulations/definition";
import type { RecommendationResult } from "@/lib/regulations/recommendations";
import type {
  AnswerState,
  ConfidenceAssessment,
  RegulationEvaluationResult,
} from "@/lib/regulations/types";
import type { InferenceResult, UnknownResolution } from "@/lib/regulations/unknown";

const sourceReference: SourceReference = {
  label: "Testregeling voorwaarden",
  sourceName: "Testuitvoerder",
  sourceUrl: "https://example.com/regulation",
  sourceType: "official-execution",
  referenceDate: "2026-07-20",
  year: 2026,
  effectiveFrom: "2026-01-01",
  effectiveTo: "2026-12-31",
  methodology: "Testbron voor generieke vraagflow.",
  methodologyType: "official-norm",
  freshnessStatus: "fresh",
  datasetId: "test-regulation-2026",
  version: "1.0.0",
};

const confidence: ConfidenceAssessment = {
  score: 70,
  label: "medium",
  factors: [],
  missingFields: [],
  uncertaintyCodes: ["confidence-uncertainty"],
  explanationCodes: ["confidence-explanation"],
};

function answer(state: AnswerState): AnswerState {
  return state;
}

function baseDefinition(): RegulationDefinition {
  return {
    regulationId: "allowance.question-flow",
    displayName: "Vraagflowregeling",
    shortDescription: "Declaratieve testregeling zonder bedraglogica.",
    category: "allowance",
    domain: "allowances",
    sourceReferences: [sourceReference],
    sourceYear: 2026,
    validFrom: "2026-01-01",
    reviewPolicy: {
      cadence: "annual",
      nextReviewAt: "2026-11-15",
      reasonCodes: ["annual-review"],
    },
    inputDefinitions: [
      field("household", "enum"),
      field("income", "currency"),
      field("partner", "boolean"),
      field("partnerIncome", "currency"),
      field("assets", "currency"),
      field("studentDebt", "currency"),
      field("careCosts", "currency"),
      field("optionalNote", "string", false),
      field("municipality", "string"),
      field("age", "number"),
      field("child", "boolean"),
    ],
    questionDefinitions: [
      question("q.household", "household", "start", 10),
      question("q.income", "income", "start", 12, {
        condition: { type: "known", fieldId: "household" },
        dependsOn: ["household"],
      }),
      question("q.partner", "partner", "household", 8, {
        condition: { type: "equals", fieldId: "household", value: "together" },
        dependsOn: ["household"],
      }),
      question("q.partner-income", "partnerIncome", "household", 7, {
        condition: {
          type: "all",
          conditions: [
            { type: "known", fieldId: "income" },
            { type: "equals", fieldId: "partner", value: true },
          ],
        },
        dependsOn: ["income", "partner"],
      }),
      question("q.assets", "assets", "wealth", 6, {
        condition: {
          type: "all",
          conditions: [
            { type: "known", fieldId: "household" },
            { type: "not-equals", fieldId: "household", value: "student" },
          ],
        },
        dependsOn: ["household"],
      }),
      question("q.student-debt", "studentDebt", "wealth", 5, {
        condition: { type: "in", fieldId: "household", values: ["student", "graduate"] },
        dependsOn: ["household"],
      }),
      question("q.care-costs", "careCosts", "care", 4, {
        condition: {
          type: "any",
          conditions: [
            { type: "unknown", fieldId: "income" },
            { type: "exists", fieldId: "partnerIncome" },
          ],
        },
        dependsOn: ["income", "partnerIncome"],
        requiredWhen: "never",
      }),
      question("q.optional-note", "optionalNote", "care", 0, {
        requiredWhen: "never",
      }),
      question("q.municipality", "municipality", "official", 3, {
        condition: { type: "not-applicable", fieldId: "studentDebt" },
        dependsOn: ["studentDebt"],
      }),
      question("q.age", "age", "official", 2),
      question("q.child", "child", "hidden", 1, {
        condition: { type: "equals", fieldId: "household", value: "family" },
        dependsOn: ["household"],
      }),
    ],
    evidenceStrategy: {
      expectedRuleIds: ["test.rule"],
      expectedSourceReferenceIds: ["test-regulation-2026"],
      requiredInputFields: ["household", "income"],
      reasonCodes: ["evidence-required"],
    },
    recommendationStrategy: {
      enabled: true,
      expectedActionTypes: ["collect-data"],
      reasonCodes: ["recommendation-strategy"],
    },
    estimateStrategy: {
      supported: false,
      estimateType: "signal-only",
      confidenceRequired: true,
      officialVerificationRequired: true,
      reasonCodes: ["no-estimate"],
    },
    adapter: {
      adapterId: "question-flow-test",
      adapterVersion: "0.1.0",
      supportedResultVersion: "regulation-evaluation-result.v1",
      relatedTools: ["toeslagen-scan"],
    },
  };
}

function field(fieldId: string, datatype: "string" | "number" | "boolean" | "enum" | "currency", required = true) {
  return {
    fieldId,
    datatype,
    required,
    optional: !required,
    nullable: false,
    supportsUnknown: true,
    supportsInference: fieldId === "partnerIncome",
    validationType: datatype === "currency" ? "currency" : datatype === "number" ? "positive-number" : "none",
    explanationCode: `${fieldId}.explanation`,
    unknownStrategy: {
      allowed: fieldId !== "age",
      inferable: fieldId === "partnerIncome",
      officialSourceAvailable: fieldId === "municipality",
      confidenceImpact: -10,
      followUpPossible: fieldId === "income",
      reasonCodes: [`unknown.${fieldId}`],
    },
    inference: {
      inferable: fieldId === "partnerIncome",
      preferredSources: ["profile"],
      overwritePolicy: fieldId === "partnerIncome" ? "allow-with-warning" : "not-applicable",
      confidenceModifier: fieldId === "partnerIncome" ? -5 : 0,
      reasonCodes: [`inference.${fieldId}`],
    },
  } as const;
}

function question(
  questionId: string,
  fieldId: string,
  groupId: string,
  confidenceImpact: number,
  overrides: Partial<RegulationDefinition["questionDefinitions"][number]> = {},
) {
  return {
    questionId,
    fieldId,
    groupId,
    groupLabel: `Group ${groupId}`,
    titleKey: `${questionId}.title`,
    descriptionKey: `${questionId}.description`,
    dependsOn: [],
    requiredWhen: "when-condition-true",
    confidenceImpact,
    evidenceContribution: [`evidence.${fieldId}`],
    ...overrides,
  } as const;
}

function blockingResolution(fieldId = "age"): UnknownResolution {
  return {
    fieldId,
    resolutionType: "blocking",
    known: false,
    unknown: true,
    inferable: false,
    requiresOfficialSource: false,
    alternativeQuestion: false,
    blocking: true,
    reasonCodes: [`blocking.${fieldId}`],
    confidenceImpact: -30,
    requiredSources: [],
  };
}

function nonBlockingResolution(fieldId = "income"): UnknownResolution {
  return {
    fieldId,
    resolutionType: "non-blocking",
    known: false,
    unknown: true,
    inferable: false,
    requiresOfficialSource: false,
    alternativeQuestion: true,
    blocking: false,
    reasonCodes: [`nonblocking.${fieldId}`],
    confidenceImpact: -10,
    nextQuestionCandidate: "q.care-costs",
    requiredSources: [],
  };
}

function officialResolution(fieldId = "municipality"): UnknownResolution {
  return {
    fieldId,
    resolutionType: "requires-official-source",
    known: false,
    unknown: true,
    inferable: false,
    requiresOfficialSource: true,
    alternativeQuestion: false,
    blocking: false,
    reasonCodes: [`official.${fieldId}`],
    confidenceImpact: -15,
    requiredSources: ["Mijn overheid"],
  };
}

function inferenceResult(): InferenceResult<number> {
  return {
    inferenceId: "partner-income.profile",
    targetField: "partnerIncome",
    sourceFields: ["partner"],
    inferredValue: 12000,
    confidenceModifier: -5,
    overwriteAllowed: true,
    reasonCodes: ["partner-income-inferred"],
    evidenceReferences: ["test-regulation-2026"],
    value: {
      inferenceId: "partner-income.profile",
      targetFieldId: "partnerIncome",
      value: 12000,
      inputReferences: [{ fieldId: "partner", answerState: "known" }],
      method: "domain-adapter",
      confidence,
      evidence: {
        evidenceId: "partner-income.profile.evidence",
        ruleIds: [],
        sourceReferences: [sourceReference],
        reasonCodes: ["profile-evidence"],
      },
      overridable: true,
      reasonCodes: ["partner-income-inferred"],
    },
  };
}

function recommendation(): RecommendationResult {
  return {
    recommendationId: "allowance.question-flow.collect-data",
    priority: 10,
    urgency: "high",
    type: "collect-data",
    titleCode: "collect-data.title",
    explanationCode: "collect-data.explanation",
    reasonCodes: ["collect-partner-income"],
    sourceReferences: [sourceReference],
    relatedFields: ["partnerIncome"],
    relatedTools: ["toeslagen-scan"],
    dependsOn: ["q.partner-income"],
    confidenceImpact: -4,
    suppressed: false,
  };
}

function evaluation(): RegulationEvaluationResult {
  return {
    regulationId: "allowance.question-flow",
    status: "insufficient-data",
    signal: "insufficient-information",
    confidence,
    uncertainties: [],
    evidence: {
      usedRuleIds: ["test.rule"],
      sourceReferences: [sourceReference],
      inputFieldIds: ["household", "income"],
      inferredValueIds: ["partner-income.profile"],
      assumptions: ["screen-assumption"],
      excludedRuleIds: [],
      missingFieldIds: ["age"],
      confidenceFactorIds: [],
      uncertaintyCodes: ["evidence-uncertainty"],
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
      reasonCodes: ["official-check-needed"],
      sourceReferences: [sourceReference],
    },
  };
}

describe("regulation question flow", () => {
  it("handles an empty flow as complete and deterministic", () => {
    const definition = { ...baseDefinition(), questionDefinitions: [] };
    const first = buildQuestionFlow({ definition });
    const second = buildQuestionFlow({ definition });

    expect(first.decision.reason).toBe("empty");
    expect(first.progress).toEqual({
      totalRelevant: 0,
      completed: 0,
      answered: 0,
      inferred: 0,
      skipped: 0,
      blocked: 0,
      remaining: 0,
      percentage: 100,
    });
    expect(second).toEqual(first);
  });

  it("marks the first, next and last questions using declarative order", () => {
    const definition = baseDefinition();
    const start = buildQuestionFlow({ definition });

    expect(start.decision).toMatchObject({
      nextQuestionId: "q.household",
      nextFieldId: "household",
      reason: "next-pending",
    });
    expect(start.questions[0].status).toBe("active");

    const middle = buildQuestionFlow({
      definition,
      answers: [
        answer({ state: "known", fieldId: "household", value: "student" }),
        answer({ state: "known", fieldId: "income", value: 18000 }),
        answer({ state: "known", fieldId: "assets", value: 2000 }),
        answer({ state: "known", fieldId: "studentDebt", value: 5000 }),
        answer({ state: "known", fieldId: "age", value: 24 }),
      ],
    });
    expect(middle.decision.nextQuestionId).toBe("q.optional-note");

    const complete = buildQuestionFlow({
      definition,
      answers: [
        answer({ state: "known", fieldId: "household", value: "student" }),
        answer({ state: "known", fieldId: "income", value: 18000 }),
        answer({ state: "known", fieldId: "assets", value: 2000 }),
        answer({ state: "known", fieldId: "studentDebt", value: 5000 }),
        answer({ state: "skipped", fieldId: "optionalNote", reasonCodes: ["user-skipped"] }),
        answer({ state: "known", fieldId: "age", value: 24 }),
      ],
    });
    expect(complete.decision.reason).toBe("complete");
  });

  it("supports every dependency operator without domain-specific prioritization", () => {
    const flow = buildQuestionFlow({
      definition: baseDefinition(),
      answers: [
        answer({ state: "known", fieldId: "household", value: "together" }),
        answer({ state: "known", fieldId: "income", value: 40000 }),
        answer({ state: "known", fieldId: "partner", value: true }),
        answer({ state: "known", fieldId: "partnerIncome", value: 20000 }),
        answer({ state: "not-applicable", fieldId: "studentDebt", reasonCodes: ["not-student"] }),
      ],
    });

    expect(flow.questions.find((item) => item.questionId === "q.income")?.status).toBe("answered");
    expect(flow.questions.find((item) => item.questionId === "q.partner")?.status).toBe("answered");
    expect(flow.questions.find((item) => item.questionId === "q.partner-income")?.status).toBe("answered");
    expect(flow.questions.find((item) => item.questionId === "q.assets")?.status).toBe("active");
    expect(flow.questions.find((item) => item.questionId === "q.care-costs")?.status).toBe("pending");
    expect(flow.questions.find((item) => item.questionId === "q.municipality")?.status).toBe("pending");
    expect(flow.questions.map((item) => item.questionId)).toEqual(baseDefinition().questionDefinitions.map((item) => item.questionId));
  });

  it("preserves inferred, blocking unknown, non-blocking unknown and official-source metadata", () => {
    const flow = buildQuestionFlow({
      definition: baseDefinition(),
      answers: [
        answer({ state: "known", fieldId: "household", value: "together" }),
        answer({ state: "known", fieldId: "income", value: 40000 }),
        answer({ state: "known", fieldId: "partner", value: true }),
        answer({ state: "unknown", fieldId: "age", reasonCodes: ["age-unknown-by-user"] }),
        answer({ state: "unknown", fieldId: "municipality", reasonCodes: ["municipality-unknown"] }),
      ],
      unknownResolutions: [
        nonBlockingResolution("careCosts"),
        blockingResolution("age"),
        officialResolution("municipality"),
      ],
      inferences: [inferenceResult()],
      recommendations: [recommendation()],
    });

    const income = flow.questions.find((item) => item.questionId === "q.income");
    const partnerIncome = flow.questions.find((item) => item.questionId === "q.partner-income");
    const age = flow.questions.find((item) => item.questionId === "q.age");
    const municipality = flow.questions.find((item) => item.questionId === "q.municipality");

    expect(income?.status).toBe("answered");
    expect(flow.questions.find((item) => item.questionId === "q.care-costs")?.alternativeQuestionIds).toEqual(["q.care-costs"]);
    expect(partnerIncome?.status).toBe("inferred");
    expect(partnerIncome?.recommendations.map((item) => item.recommendationId)).toEqual([
      "allowance.question-flow.collect-data",
    ]);
    expect(age?.status).toBe("blocked");
    expect(municipality?.officialSourceRequired).toBe(true);
    expect(flow.summary.missingBlockingFieldIds).toEqual(["age"]);
    expect(flow.summary.reasonCodes).toContain("collect-partner-income");
  });

  it("computes completed, remaining, skipped, blocked and percentage consistently", () => {
    const flow = buildQuestionFlow({
      definition: baseDefinition(),
      answers: [
        answer({ state: "known", fieldId: "household", value: "student" }),
        answer({ state: "known", fieldId: "income", value: 10000 }),
        answer({ state: "skipped", fieldId: "optionalNote", reasonCodes: ["not-needed-now"] }),
        answer({ state: "unknown", fieldId: "age", reasonCodes: ["age-unknown"] }),
      ],
      unknownResolutions: [blockingResolution("age")],
    });

    expect(determineCompletedQuestions(flow.questions).map((item) => item.questionId)).toEqual([
      "q.household",
      "q.income",
      "q.partner",
      "q.partner-income",
      "q.assets",
      "q.care-costs",
      "q.optional-note",
      "q.municipality",
      "q.child",
    ]);
    expect(determineSkippedQuestions(flow.questions).map((item) => item.questionId)).toContain("q.partner");
    expect(determineBlockingQuestions(flow.questions).map((item) => item.questionId)).toEqual(["q.age"]);
    expect(determineRemainingQuestions(flow.questions).map((item) => item.questionId)).toEqual([
      "q.student-debt",
      "q.age",
    ]);
    expect(determineNextQuestion(flow.questions)?.questionId).toBe("q.student-debt");
    expect(determineProgress(flow.questions)).toEqual(flow.progress);
    expect(flow.progress).toMatchObject({
      totalRelevant: 5,
      completed: 3,
      answered: 2,
      blocked: 1,
      remaining: 2,
      percentage: 60,
    });
  });

  it("builds multiple groups and keeps hidden groups out of relevance counts", () => {
    const flow = buildQuestionFlow({
      definition: baseDefinition(),
      answers: [answer({ state: "known", fieldId: "household", value: "student" })],
    });

    expect(flow.groups.map((group) => group.groupId)).toEqual([
      "start",
      "household",
      "wealth",
      "care",
      "official",
      "hidden",
    ]);
    expect(flow.groups.find((group) => group.groupId === "hidden")?.relevantQuestionIds).toEqual([]);
    expect(flow.groups.find((group) => group.groupId === "start")?.activeQuestionId).toBe("q.income");
  });

  it("exposes reporting/PDF metadata without rendering or recalculating", () => {
    const flow = buildQuestionFlow({
      definition: baseDefinition(),
      answers: [
        answer({ state: "known", fieldId: "household", value: "together" }),
        answer({ state: "known", fieldId: "income", value: 40000 }),
        answer({ state: "known", fieldId: "partner", value: true }),
      ],
      inferences: [inferenceResult()],
      evaluation: evaluation(),
      recommendations: [recommendation()],
    });

    expect(flow.summary.askedQuestionIds).toContain("q.partner-income");
    expect(flow.summary.inferredQuestionIds).toEqual(["q.partner-income"]);
    expect(flow.summary.recommendationIds).toEqual(["allowance.question-flow.collect-data"]);
    expect(flow.summary.reasonCodes).toEqual(expect.arrayContaining([
      "confidence-explanation",
      "evidence-uncertainty",
      "partner-income-inferred",
      "screen-assumption",
    ]));
    expect(flow.summary.sourceReferences).toEqual([sourceReference]);
  });

  it("returns immutable output and does not mutate inputs between repeated runs", () => {
    const definition = baseDefinition();
    const answers = [answer({ state: "known", fieldId: "household", value: "student" })];
    const flow = buildQuestionFlow({ definition, answers });

    expect(Object.isFrozen(flow)).toBe(true);
    expect(Object.isFrozen(flow.questions)).toBe(true);
    expect(() => {
      (flow.questions as unknown as unknown[]).push({ questionId: "mutated" });
    }).toThrow();

    const rerun = buildQuestionFlow({ definition, answers });
    expect(rerun).toEqual(flow);
    expect(definition.questionDefinitions[0].questionId).toBe("q.household");
    expect(answers).toHaveLength(1);
  });

  it("keeps existing definitions without group metadata backward compatible", () => {
    const definition = {
      ...baseDefinition(),
      questionDefinitions: baseDefinition().questionDefinitions.map((questionDefinition) => ({
        questionId: questionDefinition.questionId,
        fieldId: questionDefinition.fieldId,
        titleKey: questionDefinition.titleKey,
        descriptionKey: questionDefinition.descriptionKey,
        dependsOn: questionDefinition.dependsOn,
        condition: questionDefinition.condition,
        requiredWhen: questionDefinition.requiredWhen,
        confidenceImpact: questionDefinition.confidenceImpact,
        evidenceContribution: questionDefinition.evidenceContribution,
      })),
    };
    const flow = buildQuestionFlow({ definition });

    expect(flow.groups).toHaveLength(1);
    expect(flow.groups[0].groupId).toBe("default");
    expect(flow.questions.every((question) => question.groupId === "default")).toBe(true);
  });
});
