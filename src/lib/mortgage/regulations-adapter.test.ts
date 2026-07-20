import { describe, expect, it } from "vitest";

import { calculateIndicativeMaxMortgage } from "@/lib/mortgage/max-mortgage";
import {
  adaptMortgageToRegulationAssessment,
  mapMortgageInputToRegulationAnswers,
  MORTGAGE_REGULATION_DEFINITION,
  MORTGAGE_REGULATION_MIGRATION_INVENTORY,
  type MortgageRegulationToolId,
} from "@/lib/mortgage/regulations-adapter";
import type { MortgageMaxMortgageInput } from "@/lib/mortgage/types";
import { buildQuestionFlow } from "@/lib/regulations/question-flow";

const completeInput: MortgageMaxMortgageInput = {
  grossAnnualHouseholdIncome: 80_000,
  grossAnnualPartnerIncome: 0,
  annualMortgageRate: 4.5,
  fixedRatePeriodMonths: 120,
  mortgageTermYears: 30,
  ownFunds: 30_000,
  monthlyDebtPayments: 0,
  studentLoan: {
    hasStudentLoan: true,
    status: "repaying",
    actualMonthlyPayment: 165,
  },
  property: {
    purchasePrice: 350_000,
    marketValue: 350_000,
    nhgRequested: true,
    energyLabel: "A",
    energySavingMeasuresAmount: 0,
    renovationAmount: 0,
  },
  afmStressAnnualRate: 5,
};

function unwrap(input = completeInput, toolId: MortgageRegulationToolId = "artifact-hypotheek-wonen-maximale-hypotheek") {
  const result = calculateIndicativeMaxMortgage(input);
  const assessment = adaptMortgageToRegulationAssessment({
    toolId,
    mortgageInput: input,
    result,
  });

  if (!assessment.ok) {
    throw new Error(assessment.errors.join(", "));
  }

  return { result, assessment: assessment.value };
}

describe("mortgage regulations adapter", () => {
  it("documents the shared mortgage migration surface without touching tools", () => {
    expect(MORTGAGE_REGULATION_MIGRATION_INVENTORY.activeMortgageTools).toEqual([
      "artifact-hypotheek-wonen-maximale-hypotheek",
      "hypotheek-impact-studieschuld",
      "familiehulp-eerste-woning",
    ]);
    expect(MORTGAGE_REGULATION_MIGRATION_INVENTORY.sharedInputFields).toEqual(
      MORTGAGE_REGULATION_DEFINITION.inputDefinitions.map((field) => field.fieldId),
    );
    expect(MORTGAGE_REGULATION_MIGRATION_INVENTORY.sharedQuestionGroups).toContain("student-loan");
    expect(MORTGAGE_REGULATION_MIGRATION_INVENTORY.sharedRecommendations).toContain("verify-officially");
    expect(MORTGAGE_REGULATION_MIGRATION_INVENTORY.sharedReportingCapabilities.join(" ")).toContain(
      "buildMortgagePdfReport",
    );
  });

  it("maps existing mortgage input to central answer states", () => {
    const answers = mapMortgageInputToRegulationAnswers(completeInput);

    expect(answers.grossAnnualHouseholdIncome).toMatchObject({
      state: "known",
      value: 80_000,
      source: "adapter",
    });
    expect(answers.hasStudentLoan).toMatchObject({ state: "known", value: true });
    expect(answers.studentLoanActualMonthlyPayment).toMatchObject({
      state: "known",
      value: 165,
    });
    expect(answers.studentLoanStatutoryMonthlyPayment).toMatchObject({
      state: "not-applicable",
    });
    expect(Object.isFrozen(answers)).toBe(true);
  });

  it("keeps the existing mortgage result unchanged while adding regulation context", () => {
    const before = calculateIndicativeMaxMortgage(completeInput);
    const { result, assessment } = unwrap();
    const after = calculateIndicativeMaxMortgage(completeInput);

    expect(result).toEqual(before);
    expect(after).toEqual(before);
    expect(assessment.regulationId).toBe("mortgage.max-borrowing-power.integration");
    expect(assessment.evaluation.status).toBe("official-verification-required");
    expect(assessment.estimate.availability).toBe("signal-only");
    expect(assessment.estimate.range).toBeUndefined();
    expect(assessment.reporting).toMatchObject({
      available: true,
      source: "mortgage-pdf-report-viewmodel",
    });
  });

  it("feeds the central question flow without duplicating calculation logic", () => {
    const { assessment } = unwrap();
    const flow = buildQuestionFlow({
      definition: assessment.definition,
      answers: assessment.answers,
      unknownResolutions: assessment.unknownResolutions,
      evaluation: assessment.evaluation,
      recommendations: assessment.recommendations,
    });

    expect(flow.regulationId).toBe(assessment.regulationId);
    expect(flow.progress.totalRelevant).toBeGreaterThan(0);
    expect(flow.progress.percentage).toBeGreaterThan(80);
    expect(flow.summary.recommendationIds).toContain(
      "mortgage.max-borrowing-power.integration.verify-officially",
    );
    expect(flow.questions.find((question) => question.fieldId === "studentLoanStatutoryMonthlyPayment")?.status)
      .toBe("not-applicable");
  });

  it("keeps missing input as unknowns for later form migration", () => {
    const assessment = adaptMortgageToRegulationAssessment({
      toolId: "hypotheek-impact-studieschuld",
      mortgageInput: {
        ...completeInput,
        grossAnnualHouseholdIncome: 0,
        annualMortgageRate: undefined,
        property: {
          ...completeInput.property,
          purchasePrice: undefined,
          marketValue: undefined,
        },
      },
    });

    if (!assessment.ok) {
      throw new Error(assessment.errors.join(", "));
    }

    expect(assessment.value.evaluation.status).toBe("insufficient-data");
    expect(assessment.value.unknownResolutions.map((item) => item.fieldId)).toEqual(
      expect.arrayContaining([
        "grossAnnualHouseholdIncome",
        "annualMortgageRate",
        "purchasePrice",
        "marketValue",
      ]),
    );
    expect(assessment.value.recommendations.map((item) => item.type)).toContain("collect-data");
  });

  it("returns immutable deterministic output for all active mortgage integration targets", () => {
    for (const toolId of MORTGAGE_REGULATION_MIGRATION_INVENTORY.activeMortgageTools) {
      const first = unwrap(completeInput, toolId).assessment;
      const second = unwrap(completeInput, toolId).assessment;

      expect(first.toolId).toBe(toolId);
      expect(first).toEqual(second);
      expect(Object.isFrozen(first)).toBe(true);
      expect(Object.isFrozen(first.recommendations)).toBe(true);
    }
  });
});
