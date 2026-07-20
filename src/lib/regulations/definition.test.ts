import { describe, expect, it } from "vitest";

import { createRegulationDefinition } from "@/lib/regulations/definition";
import type { RegulationDefinition } from "@/lib/regulations/definition";
import type { SourceReference } from "@/lib/financial-constants";

const sourceReference: SourceReference = {
  label: "Testregeling voorwaarden",
  sourceName: "Testuitvoerder",
  sourceUrl: "https://example.com/regulation",
  sourceType: "official-execution",
  referenceDate: "2026-07-20",
  year: 2026,
  effectiveFrom: "2026-01-01",
  effectiveTo: "2026-12-31",
  methodology: "Testbron voor declaratieve RegulationDefinition.",
  methodologyType: "official-norm",
  freshnessStatus: "fresh",
  datasetId: "test-regulation-2026",
  version: "1.0.0",
};

function baseDefinition(): RegulationDefinition {
  return {
    regulationId: "allowance.test",
    displayName: "Testtoeslag",
    shortDescription: "Declaratieve testregeling zonder bedraglogica.",
    category: "allowance",
    domain: "allowances",
    sourceReferences: [sourceReference],
    sourceYear: 2026,
    validFrom: "2026-01-01",
    validUntil: "2026-12-31",
    reviewPolicy: {
      cadence: "annual",
      nextReviewAt: "2026-11-15",
      reasonCodes: ["annual-source-review"],
    },
    inputDefinitions: [
      {
        fieldId: "assessmentIncome",
        datatype: "currency",
        required: true,
        optional: false,
        nullable: false,
        supportsUnknown: true,
        supportsInference: false,
        validationType: "currency",
        explanationCode: "assessment-income-needed",
        unknownStrategy: {
          allowed: true,
          inferable: false,
          officialSourceAvailable: true,
          confidenceImpact: -20,
          followUpPossible: true,
          reasonCodes: ["unknown-assessment-income"],
        },
        inference: {
          inferable: false,
          preferredSources: ["official-tax-assessment"],
          overwritePolicy: "not-applicable",
          confidenceModifier: 0,
          reasonCodes: ["no-income-inference"],
        },
      },
      {
        fieldId: "partnerStatus",
        datatype: "enum",
        required: true,
        optional: false,
        nullable: false,
        supportsUnknown: true,
        supportsInference: true,
        validationType: "enum",
        explanationCode: "partner-status-needed",
        unknownStrategy: {
          allowed: true,
          inferable: true,
          officialSourceAvailable: true,
          confidenceImpact: -15,
          followUpPossible: true,
          reasonCodes: ["unknown-partner-status"],
        },
        inference: {
          inferable: true,
          preferredSources: ["profile", "official-registration"],
          overwritePolicy: "allow-with-warning",
          confidenceModifier: -10,
          reasonCodes: ["partner-status-can-be-inferred"],
        },
      },
    ],
    questionDefinitions: [
      {
        questionId: "question.assessment-income",
        fieldId: "assessmentIncome",
        titleKey: "regulations.allowance.test.assessmentIncome.title",
        descriptionKey: "regulations.allowance.test.assessmentIncome.description",
        dependsOn: [],
        requiredWhen: "always",
        confidenceImpact: 20,
        evidenceContribution: ["assessment-income-input"],
      },
      {
        questionId: "question.partner-status",
        fieldId: "partnerStatus",
        titleKey: "regulations.allowance.test.partnerStatus.title",
        descriptionKey: "regulations.allowance.test.partnerStatus.description",
        dependsOn: ["assessmentIncome"],
        condition: { type: "known", fieldId: "assessmentIncome" },
        requiredWhen: "when-condition-true",
        confidenceImpact: 15,
        evidenceContribution: ["partner-status-input"],
      },
    ],
    evidenceStrategy: {
      expectedRuleIds: ["allowance.test.signal"],
      expectedSourceReferenceIds: ["test-regulation-2026"],
      requiredInputFields: ["assessmentIncome", "partnerStatus"],
      reasonCodes: ["evidence-required-for-signal"],
    },
    recommendationStrategy: {
      enabled: true,
      expectedActionTypes: ["collect-data", "verify-officially"],
      reasonCodes: ["recommendation-metadata-only"],
    },
    estimateStrategy: {
      supported: false,
      estimateType: "signal-only",
      confidenceRequired: true,
      officialVerificationRequired: true,
      reasonCodes: ["no-estimate-engine-yet"],
    },
    adapter: {
      adapterId: "allowance-test-adapter",
      adapterVersion: "0.1.0",
      supportedResultVersion: "regulation-evaluation-result.v1",
      relatedTools: ["toeslagen-scan"],
    },
  };
}

function expectError(
  result: ReturnType<typeof createRegulationDefinition>,
  errorCode: string,
) {
  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.errors).toContain(errorCode);
  }
}

describe("regulation definition model", () => {
  it("creates a valid declarative definition object", () => {
    const result = createRegulationDefinition(baseDefinition());

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.regulationId).toBe("allowance.test");
    expect(result.value.displayName).toBe("Testtoeslag");
    expect(result.value.category).toBe("allowance");
    expect(result.value.domain).toBe("allowances");
    expect(result.value.sourceYear).toBe(2026);
    expect(result.value.sourceReferences).toEqual([sourceReference]);
    expect(result.value.inputDefinitions).toHaveLength(2);
    expect(result.value.questionDefinitions).toHaveLength(2);
  });

  it("rejects a missing regulationId", () => {
    expectError(
      createRegulationDefinition({ ...baseDefinition(), regulationId: "" }),
      "missing-regulation-id",
    );
  });

  it("rejects duplicate questionIds", () => {
    const definition = baseDefinition();

    expectError(
      createRegulationDefinition({
        ...definition,
        questionDefinitions: [
          definition.questionDefinitions[0],
          {
            ...definition.questionDefinitions[1],
            questionId: definition.questionDefinitions[0].questionId,
          },
        ],
      }),
      "duplicate-question-ids",
    );
  });

  it("rejects duplicate fieldIds", () => {
    const definition = baseDefinition();

    expectError(
      createRegulationDefinition({
        ...definition,
        inputDefinitions: [
          definition.inputDefinitions[0],
          {
            ...definition.inputDefinitions[1],
            fieldId: definition.inputDefinitions[0].fieldId,
          },
        ],
      }),
      "duplicate-field-ids",
    );
  });

  it("rejects missing source references", () => {
    expectError(
      createRegulationDefinition({ ...baseDefinition(), sourceReferences: [] }),
      "missing-source-references",
    );
  });

  it("returns an immutable cloned definition", () => {
    const input = baseDefinition();
    const result = createRegulationDefinition(input);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value).not.toBe(input);
    expect(Object.isFrozen(result.value)).toBe(true);
    expect(Object.isFrozen(result.value.inputDefinitions)).toBe(true);
    expect(Object.isFrozen(result.value.inputDefinitions[0].unknownStrategy)).toBe(true);
    expect(Object.isFrozen(result.value.questionDefinitions[1].condition)).toBe(true);
  });

  it("keeps dependency metadata declarative", () => {
    const result = createRegulationDefinition(baseDefinition());

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.questionDefinitions[1]).toMatchObject({
      questionId: "question.partner-status",
      fieldId: "partnerStatus",
      dependsOn: ["assessmentIncome"],
      requiredWhen: "when-condition-true",
      confidenceImpact: 15,
      evidenceContribution: ["partner-status-input"],
    });
    expect(result.value.questionDefinitions[1].condition).toEqual({
      type: "known",
      fieldId: "assessmentIncome",
    });
  });

  it("keeps unknown metadata without running an unknown engine", () => {
    const result = createRegulationDefinition(baseDefinition());

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.inputDefinitions[0].unknownStrategy).toEqual({
      allowed: true,
      inferable: false,
      officialSourceAvailable: true,
      confidenceImpact: -20,
      followUpPossible: true,
      reasonCodes: ["unknown-assessment-income"],
    });
  });

  it("keeps inference metadata without executing inference", () => {
    const result = createRegulationDefinition(baseDefinition());

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.inputDefinitions[1].inference).toEqual({
      inferable: true,
      preferredSources: ["profile", "official-registration"],
      overwritePolicy: "allow-with-warning",
      confidenceModifier: -10,
      reasonCodes: ["partner-status-can-be-inferred"],
    });
  });

  it("keeps estimate metadata without amount logic", () => {
    const result = createRegulationDefinition(baseDefinition());

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.estimateStrategy).toEqual({
      supported: false,
      estimateType: "signal-only",
      confidenceRequired: true,
      officialVerificationRequired: true,
      reasonCodes: ["no-estimate-engine-yet"],
    });
  });

  it("keeps adapter metadata for later registration without creating a registry", () => {
    const result = createRegulationDefinition(baseDefinition());

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.adapter).toEqual({
      adapterId: "allowance-test-adapter",
      adapterVersion: "0.1.0",
      supportedResultVersion: "regulation-evaluation-result.v1",
      relatedTools: ["toeslagen-scan"],
    });
  });

  it("builds deterministically", () => {
    const first = createRegulationDefinition(baseDefinition());
    const second = createRegulationDefinition(baseDefinition());

    expect(first).toEqual(second);
  });
});
