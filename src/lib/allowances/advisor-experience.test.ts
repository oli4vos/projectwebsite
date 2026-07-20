import { describe, expect, it } from "vitest";

import {
  ALLOWANCE_ADVISOR_APPLICATION_GUIDANCE,
  ALLOWANCE_ADVISOR_EXPLANATION_PATTERN,
  ALLOWANCE_ADVISOR_INTAKE_STEPS,
  ALLOWANCE_ADVISOR_RESULT_MODELS,
  ALLOWANCE_UNKNOWN_RESOLUTION_MATRIX,
} from "@/lib/allowances/advisor-experience";

describe("allowance advisor experience contract", () => {
  it("covers the guided intake structure", () => {
    expect(ALLOWANCE_ADVISOR_INTAKE_STEPS.map((step) => step.stepId)).toEqual([
      "calculation-year",
      "age",
      "residence-and-insurance",
      "household",
      "allowance-partner",
      "children",
      "housing-and-rent",
      "income",
      "assets",
      "childcare",
    ]);
    expect(ALLOWANCE_ADVISOR_INTAKE_STEPS.every((step) => step.fields.length > 0)).toBe(true);
    expect(ALLOWANCE_ADVISOR_INTAKE_STEPS.every((step) => step.progressiveDisclosure.length > 0)).toBe(true);
  });

  it("defines every required unknown-resolution topic with follow-up behavior", () => {
    expect(ALLOWANCE_UNKNOWN_RESOLUTION_MATRIX.map((item) => item.topic)).toEqual([
      "allowance-partner",
      "assessment-income",
      "assets",
      "housing-type",
      "independent-home",
      "basic-rent",
      "service-costs-calculation-rent",
      "co-residents",
      "childcare-registration",
      "childcare-hours",
      "childcare-hourly-rate",
    ]);

    for (const topic of ALLOWANCE_UNKNOWN_RESOLUTION_MATRIX) {
      expect(topic.alternativeQuestions.length).toBeGreaterThan(0);
      expect(topic.order.length).toBeGreaterThan(0);
      expect(topic.whyNeeded).not.toEqual("");
      expect(topic.whereToFind.length).toBeGreaterThan(0);
      expect(topic.unresolvedOutcome).not.toEqual("");
      expect(topic.blocking).not.toBe("never");
    }
  });

  it("keeps result models explicit without legal entitlement wording in contract titles", () => {
    expect(ALLOWANCE_ADVISOR_RESULT_MODELS.map((model) => model.status)).toEqual([
      "likely-eligible-with-indication",
      "likely-not-eligible",
      "not-determinable-yet",
      "special-situation",
    ]);
    expect(ALLOWANCE_ADVISOR_RESULT_MODELS.find((model) => model.amountIndicationAllowed)?.amountIndication?.estimateRangeRequired).toBe(true);
    expect(JSON.stringify(ALLOWANCE_ADVISOR_RESULT_MODELS).toLowerCase()).not.toContain("je hebt recht");
  });

  it("defines explanation and application patterns for all allowances", () => {
    expect(ALLOWANCE_ADVISOR_EXPLANATION_PATTERN.whereToFind.length).toBeGreaterThan(0);
    expect(ALLOWANCE_ADVISOR_EXPLANATION_PATTERN.officialSources.length).toBeGreaterThan(0);
    expect(ALLOWANCE_ADVISOR_APPLICATION_GUIDANCE.map((item) => item.allowanceKind)).toEqual([
      "healthcare",
      "rent",
      "child-budget",
      "childcare",
    ]);
    expect(ALLOWANCE_ADVISOR_APPLICATION_GUIDANCE.every((item) => item.primaryCta.target === "mijn-toeslagen")).toBe(true);
  });
});
