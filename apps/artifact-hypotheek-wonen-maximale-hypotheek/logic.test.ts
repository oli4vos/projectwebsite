import { describe, expect, it } from "vitest";

import {
  buildMortgageCalculationInput,
  calculateMortgageScenario,
  validateMortgageForm,
  exampleValues,
} from "./logic";

describe("maximale hypotheek app logic", () => {
  it("maps form values to the central mortgage input", () => {
    const input = buildMortgageCalculationInput(exampleValues);

    expect(input.grossAnnualHouseholdIncome).toBe(80000);
    expect(input.annualMortgageRate).toBe(4.5);
    expect(input.fixedRatePeriodMonths).toBe(120);
    expect(input.property?.purchasePrice).toBe(350000);
    expect(input.studentLoan?.hasStudentLoan).toBe(true);
  });

  it("validates missing required fields", () => {
    const result = validateMortgageForm({
      ...exampleValues,
      grossAnnualHouseholdIncome: "",
      purchasePrice: "",
    });

    expect(result.parsed).toBeNull();
    expect(result.errors.grossAnnualHouseholdIncome).toBeDefined();
    expect(result.errors.purchasePrice).toBeDefined();
  });

  it("calculates a scenario with the shared mortgage engine", () => {
    const result = calculateMortgageScenario(exampleValues);

    expect(result.maxMortgageFinal).toBeGreaterThan(0);
    expect(result.breakdown.marketValue).toBe(350000);
    expect(result.warnings.some((warning) => warning.code === "INDICATIVE_ONLY")).toBe(true);
  });
});
