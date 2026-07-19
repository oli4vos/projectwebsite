import { describe, expect, it } from "vitest";
import { evaluateAllowanceSignals } from "@/lib/allowances/signaling";
import {
  createAllowanceScanView,
  defaultValues,
  exampleValues,
  mapFormToAllowanceScanInput,
  validateAllowanceScanForm,
} from "./logic";

describe("toeslagen-scan adapter", () => {
  it("maps a complete form state to the central allowance scan input", () => {
    const input = mapFormToAllowanceScanInput(exampleValues);

    expect(input).toMatchObject({
      year: 2026,
      age: 34,
      partnerStatus: "no",
      assessmentIncome: 30000,
      assets: 12000,
      healthcare: { hasDutchHealthInsurance: true },
      rent: {
        tenure: "rent",
        independentHome: true,
        basicRent: 850,
        hasCoResidents: false,
      },
      childBudget: {
        hasChildren: true,
        childAges: [6],
        receivesChildBenefit: true,
        childLivesWithApplicant: true,
      },
      childcare: {
        hasChildren: true,
        usesChildcare: true,
        registeredChildcare: true,
        paysOwnContribution: true,
        hoursPerMonth: 80,
        applicantHasQualifyingActivity: true,
        partnerHasQualifyingActivity: "not-applicable",
      },
    });
  });

  it("ignores hidden stale rent, partner and childcare fields", () => {
    const input = mapFormToAllowanceScanInput({
      ...exampleValues,
      partnerStatus: "no",
      jointAssessmentIncome: "999999",
      jointAssets: "999999",
      tenure: "owner",
      basicRent: "850",
      hasCoResidents: "yes",
      householdIncome: "12345",
      householdAssets: "12345",
      hasChildren: "no",
      usesChildcare: "yes",
      registeredChildcare: "yes",
      paysOwnContribution: "yes",
      childcareHoursPerMonth: "80",
    });

    expect(input.jointAssessmentIncome).toBeUndefined();
    expect(input.jointAssets).toBeUndefined();
    expect(input.rent?.basicRent).toBe(0);
    expect(input.rent?.householdIncome).toBeUndefined();
    expect(input.childcare?.hasChildren).toBe(false);
    expect(input.childcare?.usesChildcare).toBe(false);
    expect(input.childcare?.registeredChildcare).toBe(false);
    expect(input.childcare?.hoursPerMonth).toBe(0);
  });

  it("does not validate hidden stale fields after progressive-disclosure changes", () => {
    const values = {
      ...exampleValues,
      partnerStatus: "no" as const,
      jointAssessmentIncome: "niet zichtbaar",
      jointAssets: "-1",
      tenure: "owner" as const,
      basicRent: "geen huur",
      hasCoResidents: "yes" as const,
      householdIncome: "ook verborgen",
      householdAssets: "-2",
      hasChildren: "no" as const,
      usesChildcare: "yes" as const,
      childcareHoursPerMonth: "veel",
    };
    const errors = validateAllowanceScanForm(values);
    const input = mapFormToAllowanceScanInput(values);

    expect(errors.jointAssessmentIncome).toBeUndefined();
    expect(errors.jointAssets).toBeUndefined();
    expect(errors.basicRent).toBeUndefined();
    expect(errors.householdIncome).toBeUndefined();
    expect(errors.householdAssets).toBeUndefined();
    expect(errors.childcareHoursPerMonth).toBeUndefined();
    expect(input.jointAssessmentIncome).toBeUndefined();
    expect(input.rent?.householdIncome).toBeUndefined();
    expect(input.childcare?.hoursPerMonth).toBe(0);
  });

  it("keeps unknown answers as insufficient-information signals instead of validation errors", () => {
    const errors = validateAllowanceScanForm(defaultValues);
    const view = createAllowanceScanView(defaultValues);

    expect(errors).toEqual({});
    expect(view.isValid).toBe(true);
    expect(view.result?.cards.some((card) => card.status === "insufficient-information")).toBe(true);
  });

  it("blocks technically invalid input without silently clamping", () => {
    const errors = validateAllowanceScanForm({
      ...defaultValues,
      age: "121",
      assessmentIncome: "-1",
      assets: "niet-getal",
      hasChildren: "yes",
      childAges: "6, oud",
    });

    expect(errors.age).toBeDefined();
    expect(errors.assessmentIncome).toBeDefined();
    expect(errors.assets).toBeDefined();
    expect(errors.childAges).toBeDefined();
  });

  it("preserves fixed result order, source links and absence of amount fields", () => {
    const view = createAllowanceScanView(exampleValues);

    expect(view.isValid).toBe(true);
    expect(view.result?.cards.map((card) => card.kind)).toEqual([
      "healthcare",
      "rent",
      "child-budget",
      "childcare",
    ]);
    for (const card of view.result?.cards ?? []) {
      expect(card.sourceLinks.length).toBeGreaterThan(0);
      expect(card.sourceLinks.every((link) => link.href.startsWith("https://www.belastingdienst.nl/"))).toBe(true);
      expect("amount" in card).toBe(false);
      expect(JSON.stringify(card).toLowerCase()).not.toContain("je hebt recht");
    }
  });

  it("matches the central engine entrypoint output metadata", () => {
    const input = mapFormToAllowanceScanInput(exampleValues);
    const direct = evaluateAllowanceSignals(input);
    const view = createAllowanceScanView(exampleValues);

    expect(view.result?.datasetId).toBe(direct.datasetId);
    expect(view.result?.datasetVersion).toBe(direct.datasetVersion);
    expect(view.result?.ruleYear).toBe(2026);
  });
});
