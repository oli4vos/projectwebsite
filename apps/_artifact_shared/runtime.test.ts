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
  "loan_amortization_schedule",
  "revolving_credit_comparison",
  "loan_total_cost",
  "loan_amount_from_payment",
  "installment_purchase_cost",
  "financial_lease_payment",
  "loan_remaining_balance_after_period",
  "loan_term_months",
  "loan_monthly_payment",
  "max_loan_from_budget",
  "personal_loan_comparison",
  "loan_interest_rate",
  "financial_lease_interest_rate",
  "financial_lease_remaining_balance",
  "loan_remaining_balance",
  "student_loan_repayment",
  "debt_growth",
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

  it("builds pensioen/aow fixture with logical fields by slug", () => {
    const fixture = getProfileFixture(
      "generic_contract",
      "artifact-pensioen-aow-aow-leeftijd",
    );
    expect(fixture.input).toMatchObject({ geboorteJaar: expect.any(Number) });
    const result = executeProfile("generic_contract", fixture.input);
    expect(result.isValid).toBe(true);
    expect(result.outputs.modelUsed).toBe("aow_leeftijd_indicatie");
  });

  it("builds hypotheek fixture with logical fields by slug", () => {
    const fixture = getProfileFixture(
      "generic_contract",
      "artifact-hypotheek-wonen-huren-of-kopen",
    );
    expect(fixture.input).toMatchObject({ huurPerMaand: expect.any(Number) });
    const result = executeProfile("generic_contract", fixture.input);
    expect(result.isValid).toBe(true);
    expect(result.outputs.modelUsed).toBe("huren_kopen_indicatie");
  });

  it("builds pensioen jaarruimte fixture with dedicated model", () => {
    const fixture = getProfileFixture(
      "generic_contract",
      "artifact-pensioen-aow-jaarruimte-belastingteruggave",
    );
    const result = executeProfile("generic_contract", fixture.input);
    expect(result.isValid).toBe(true);
    expect(result.outputs.modelUsed).toBe("pensioen_jaarruimte_indicatie");
    expect(typeof result.outputs.modelExplanation).toBe("string");
  });

  it("builds gezin indexering fixture with dedicated model", () => {
    const fixture = getProfileFixture(
      "generic_contract",
      "artifact-gezin-relatie-indexering-alimentatie",
    );
    const result = executeProfile("generic_contract", fixture.input);
    expect(result.isValid).toBe(true);
    expect(result.outputs.modelUsed).toBe("alimentatie_indexering_indicatie");
  });

  it("builds hypotheek overdrachtsbelasting fixture with dedicated model", () => {
    const fixture = getProfileFixture(
      "generic_contract",
      "artifact-hypotheek-wonen-overdrachtsbelasting",
    );
    const result = executeProfile("generic_contract", fixture.input);
    expect(result.isValid).toBe(true);
    expect(result.outputs.modelUsed).toBe("overdrachtsbelasting_indicatie");
  });

  it("builds hypotheek kosten koper fixture with dedicated model", () => {
    const fixture = getProfileFixture(
      "generic_contract",
      "artifact-hypotheek-wonen-kosten-koper",
    );
    const result = executeProfile("generic_contract", fixture.input);
    expect(result.isValid).toBe(true);
    expect(result.outputs.modelUsed).toBe("kosten_koper_indicatie");
  });

  it("builds hypotheek rentevergelijking fixture with dedicated model", () => {
    const fixture = getProfileFixture(
      "generic_contract",
      "artifact-hypotheek-wonen-hypotheek-oversluiten",
    );
    const result = executeProfile("generic_contract", fixture.input);
    expect(result.isValid).toBe(true);
    expect(result.outputs.modelUsed).toBe("hypotheek_rentevergelijking_indicatie");
  });

  it("builds hypotheek aflossen fixture with dedicated model", () => {
    const fixture = getProfileFixture(
      "generic_contract",
      "artifact-hypotheek-wonen-hypotheek-extra-aflossen",
    );
    const result = executeProfile("generic_contract", fixture.input);
    expect(result.isValid).toBe(true);
    expect(result.outputs.modelUsed).toBe("hypotheek_aflossen_indicatie");
  });

  it("builds hypotheek maximale hypotheek fixture with dedicated model", () => {
    const fixture = getProfileFixture(
      "generic_contract",
      "artifact-hypotheek-wonen-maximale-hypotheek",
    );
    const result = executeProfile("generic_contract", fixture.input);
    expect(result.isValid).toBe(true);
    expect(result.outputs.modelUsed).toBe("maximale_hypotheek_indicatie");
  });

  it("builds woning prijsontwikkeling fixture with dedicated model", () => {
    const fixture = getProfileFixture(
      "generic_contract",
      "artifact-hypotheek-wonen-prijsontwikkeling-huizenprijzen",
    );
    const result = executeProfile("generic_contract", fixture.input);
    expect(result.isValid).toBe(true);
    expect(result.outputs.modelUsed).toBe("woningwaarde_groei_indicatie");
  });
});
