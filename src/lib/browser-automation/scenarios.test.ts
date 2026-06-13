import { describe, expect, it } from "vitest";

import { buildMortgageComparisonScenarios } from "@/lib/browser-automation/scenarios";

describe("browser automation scenarios", () => {
  it("builds a hundred reproducible comparison scenarios", () => {
    const scenarios = buildMortgageComparisonScenarios();

    expect(scenarios).toHaveLength(100);
    expect(scenarios[0]?.input.grossAnnualHouseholdIncome).toBe(45_000);
    expect(scenarios[99]?.input.grossAnnualHouseholdIncome).toBe(85_000);
  });
});
