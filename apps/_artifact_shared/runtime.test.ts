import { describe, expect, it } from "vitest";
import { executeProfile, getProfileFixture, type ToolProfile } from "./runtime";

const profiles: ToolProfile[] = [
  "annuity_payment",
  "annuity_principal",
  "annuity_term",
  "present_value",
  "present_value_annuity",
  "future_value",
  "compound_interest",
  "simple_interest",
  "effective_rate",
  "nominal_rate",
  "weighted_average_rate",
  "percentage_of_total",
  "value_from_percentage",
  "linear_loan",
  "indexed_amount",
  "fraction_calculation",
  "required_grade",
  "average_grade",
  "roman_numerals",
  "dcf_valuation",
  "percentage_composition",
  "generic_contract",
];

describe("staging runtime profiles", () => {
  for (const profile of profiles) {
    it(`handles fixture for ${profile}`, () => {
      const fixture = getProfileFixture(profile);
      const result = executeProfile(profile, fixture.input);
      expect(result.isValid).toBe(fixture.expectValid);
      expect(result.profile).toBe(profile);
    });
  }

  it("returns invalid result for empty input", () => {
    const result = executeProfile("generic_contract", {});
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
