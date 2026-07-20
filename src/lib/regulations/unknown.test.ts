import { describe, expect, it } from "vitest";

import { createKnownAnswer, createUnknownAnswer, overrideInferredAnswer } from "@/lib/regulations/answers";
import type { RegulationDefinition } from "@/lib/regulations/definition";
import {
  collectInferenceEvidence,
  filterBlockingUnknowns,
  mergeResolvedAnswers,
  resolveRegulationInputs,
  resolveUnknownFields,
  runInference,
} from "@/lib/regulations/unknown";
import type { AnswerState } from "@/lib/regulations/types";
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
  methodology: "Testbron voor unknown en inference engine.",
  methodologyType: "official-norm",
  freshnessStatus: "fresh",
  datasetId: "test-regulation-2026",
  version: "1.0.0",
};

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
    reviewPolicy: { cadence: "annual", reasonCodes: ["annual-review"] },
    inputDefinitions: [
      {
        fieldId: "knownField",
        datatype: "string",
        required: true,
        optional: false,
        nullable: false,
        supportsUnknown: false,
        supportsInference: false,
        validationType: "none",
        explanationCode: "known-field",
      },
      {
        fieldId: "inferableField",
        datatype: "string",
        required: true,
        optional: false,
        nullable: false,
        supportsUnknown: true,
        supportsInference: true,
        validationType: "none",
        explanationCode: "inferable-field",
        unknownStrategy: {
          allowed: true,
          inferable: true,
          officialSourceAvailable: true,
          confidenceImpact: -10,
          followUpPossible: true,
          reasonCodes: ["inferable-unknown"],
        },
        inference: {
          inferable: true,
          preferredSources: ["knownField"],
          overwritePolicy: "allow-with-warning",
          confidenceModifier: -5,
          reasonCodes: ["generic-inference"],
        },
      },
      {
        fieldId: "blockingField",
        datatype: "boolean",
        required: true,
        optional: false,
        nullable: false,
        supportsUnknown: false,
        supportsInference: false,
        validationType: "none",
        explanationCode: "blocking-field",
        unknownStrategy: {
          allowed: false,
          inferable: false,
          officialSourceAvailable: false,
          confidenceImpact: -30,
          followUpPossible: false,
          reasonCodes: ["blocking-unknown"],
        },
      },
      {
        fieldId: "nonBlockingField",
        datatype: "number",
        required: false,
        optional: true,
        nullable: true,
        supportsUnknown: true,
        supportsInference: false,
        validationType: "none",
        explanationCode: "non-blocking-field",
        unknownStrategy: {
          allowed: true,
          inferable: false,
          officialSourceAvailable: false,
          confidenceImpact: -2,
          followUpPossible: false,
          reasonCodes: ["non-blocking-unknown"],
        },
      },
      {
        fieldId: "officialField",
        datatype: "date",
        required: true,
        optional: false,
        nullable: false,
        supportsUnknown: true,
        supportsInference: false,
        validationType: "date",
        explanationCode: "official-field",
        unknownStrategy: {
          allowed: true,
          inferable: false,
          officialSourceAvailable: true,
          confidenceImpact: -20,
          followUpPossible: false,
          reasonCodes: ["official-source-needed"],
        },
      },
      {
        fieldId: "alternativeField",
        datatype: "enum",
        required: true,
        optional: false,
        nullable: false,
        supportsUnknown: true,
        supportsInference: false,
        validationType: "enum",
        explanationCode: "alternative-field",
        unknownStrategy: {
          allowed: true,
          inferable: false,
          officialSourceAvailable: false,
          confidenceImpact: -8,
          followUpPossible: true,
          reasonCodes: ["alternative-question-needed"],
        },
      },
    ],
    questionDefinitions: [
      {
        questionId: "question.alternative",
        fieldId: "alternativeField",
        titleKey: "alternative.title",
        descriptionKey: "alternative.description",
        dependsOn: [],
        requiredWhen: "always",
        confidenceImpact: 8,
        evidenceContribution: ["alternative-answer"],
      },
    ],
    evidenceStrategy: {
      expectedRuleIds: [],
      expectedSourceReferenceIds: ["test-regulation-2026"],
      requiredInputFields: ["knownField"],
      reasonCodes: ["evidence-metadata"],
    },
    recommendationStrategy: {
      enabled: false,
      expectedActionTypes: [],
      reasonCodes: ["recommendation-not-implemented"],
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
      relatedTools: [],
    },
  };
}

const answers: Record<string, AnswerState> = {
  knownField: createKnownAnswer("knownField", "known-value"),
  inferableField: createUnknownAnswer("inferableField", ["missing-inferable"]),
};

describe("unknown resolution and inference engine", () => {
  it("keeps known answers known", () => {
    const resolutions = resolveUnknownFields(definition(), answers);
    const known = resolutions.find((resolution) => resolution.fieldId === "knownField");

    expect(known).toMatchObject({
      resolutionType: "known",
      known: true,
      unknown: false,
      blocking: false,
    });
  });

  it("keeps ordinary unknowns unknown and non-blocking when metadata allows it", () => {
    const resolutions = resolveUnknownFields(definition(), answers);
    const unknown = resolutions.find((resolution) => resolution.fieldId === "nonBlockingField");

    expect(unknown).toMatchObject({
      resolutionType: "non-blocking",
      known: false,
      unknown: true,
      blocking: false,
      confidenceImpact: -2,
      reasonCodes: ["non-blocking-unknown"],
    });
  });

  it("marks inferable fields without executing domain rules", () => {
    const resolutions = resolveUnknownFields(definition(), answers);
    const inferable = resolutions.find((resolution) => resolution.fieldId === "inferableField");

    expect(inferable).toMatchObject({
      resolutionType: "inferable",
      inferable: true,
      requiredSources: ["knownField"],
      confidenceImpact: -15,
    });
    expect(inferable?.reasonCodes).toEqual(
      expect.arrayContaining(["missing-inferable", "inferable-unknown", "generic-inference"]),
    );
  });

  it("marks blocking unknowns", () => {
    const blocking = filterBlockingUnknowns(resolveUnknownFields(definition(), answers));

    expect(blocking).toHaveLength(1);
    expect(blocking[0]).toMatchObject({
      fieldId: "blockingField",
      resolutionType: "blocking",
      blocking: true,
    });
  });

  it("marks official source requirements", () => {
    const resolutions = resolveUnknownFields(definition(), answers);
    const official = resolutions.find((resolution) => resolution.fieldId === "officialField");

    expect(official).toMatchObject({
      resolutionType: "requires-official-source",
      requiresOfficialSource: true,
      blocking: false,
      reasonCodes: ["official-source-needed"],
    });
  });

  it("marks alternative question candidates", () => {
    const resolutions = resolveUnknownFields(definition(), answers);
    const alternative = resolutions.find((resolution) => resolution.fieldId === "alternativeField");

    expect(alternative).toMatchObject({
      resolutionType: "alternative-question",
      alternativeQuestion: true,
      nextQuestionCandidate: "question.alternative",
    });
  });

  it("runs generic inference with provenance and confidence modifier", () => {
    const result = runInference(definition(), answers, [
      {
        inferenceId: "infer.generic",
        targetFieldId: "inferableField",
        sourceFieldIds: ["knownField"],
        inferredValue: "derived-value",
        reasonCodes: ["candidate-provided"],
        evidenceReferences: ["test-regulation-2026"],
      },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value).toHaveLength(1);
    expect(result.value[0]).toMatchObject({
      inferenceId: "infer.generic",
      targetField: "inferableField",
      sourceFields: ["knownField"],
      inferredValue: "derived-value",
      confidenceModifier: -5,
      overwriteAllowed: true,
      evidenceReferences: ["test-regulation-2026"],
    });
    expect(result.value[0].value.inputReferences).toEqual([
      { fieldId: "knownField", answerState: "known" },
    ]);
    expect(result.value[0].value.evidence.sourceReferences).toEqual([sourceReference]);
  });

  it("supports overriding inferred answers through existing answer helper", () => {
    const result = runInference(definition(), answers, [
      {
        inferenceId: "infer.generic",
        targetFieldId: "inferableField",
        sourceFieldIds: ["knownField"],
        inferredValue: "derived-value",
        reasonCodes: ["candidate-provided"],
      },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const merged = mergeResolvedAnswers(answers, result.value);
    const overridden = overrideInferredAnswer(merged.inferableField, "user-value");

    expect(merged.inferableField).toMatchObject({
      state: "inferred",
      value: "derived-value",
      overridable: true,
    });
    expect(overridden).toEqual({
      state: "known",
      fieldId: "inferableField",
      value: "user-value",
      source: "user",
    });
  });

  it("runs multiple inferences and collects evidence", () => {
    const extendedDefinition = {
      ...definition(),
      inputDefinitions: [
        ...definition().inputDefinitions,
        {
          ...definition().inputDefinitions[1],
          fieldId: "secondInferableField",
        },
      ],
    };
    const result = runInference(extendedDefinition, answers, [
      {
        inferenceId: "infer.first",
        targetFieldId: "inferableField",
        sourceFieldIds: ["knownField"],
        inferredValue: "first",
        reasonCodes: ["first"],
      },
      {
        inferenceId: "infer.second",
        targetFieldId: "secondInferableField",
        sourceFieldIds: ["knownField"],
        inferredValue: "second",
        reasonCodes: ["second"],
      },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.map((inference) => inference.inferenceId)).toEqual([
      "infer.first",
      "infer.second",
    ]);
    expect(collectInferenceEvidence(result.value).map((evidence) => evidence.evidenceId)).toEqual([
      "infer.first.evidence",
      "infer.second.evidence",
    ]);
  });

  it("fails inference when a source field is not known", () => {
    const result = runInference(definition(), answers, [
      {
        inferenceId: "infer.missing-source",
        targetFieldId: "inferableField",
        sourceFieldIds: ["missingSource"],
        inferredValue: "derived-value",
        reasonCodes: ["candidate-provided"],
      },
    ]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toEqual([
        "inference-source-not-known:infer.missing-source:missingSource",
      ]);
    }
  });

  it("runs the resolution pipeline deterministically and returns immutable output", () => {
    const input = {
      definition: definition(),
      answers,
      inferenceCandidates: [
        {
          inferenceId: "infer.generic",
          targetFieldId: "inferableField",
          sourceFieldIds: ["knownField"],
          inferredValue: "derived-value",
          reasonCodes: ["candidate-provided"],
        },
      ],
    };
    const first = resolveRegulationInputs(input);
    const second = resolveRegulationInputs(input);

    expect(first).toEqual(second);
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    expect(first.value.answers.inferableField).toMatchObject({
      state: "inferred",
      value: "derived-value",
    });
    expect(first.value.blockingUnknowns.map((unknown) => unknown.fieldId)).toEqual([
      "blockingField",
    ]);
    expect(Object.isFrozen(first.value)).toBe(true);
    expect(Object.isFrozen(first.value.answers)).toBe(true);
    expect(Object.isFrozen(first.value.unknownResolutions)).toBe(true);
    expect(Object.isFrozen(first.value.inferences)).toBe(true);
  });
});
