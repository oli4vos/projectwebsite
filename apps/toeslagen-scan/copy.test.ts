import { describe, expect, it } from "vitest";
import type {
  AllowanceMissingField,
  AllowanceReasonCode,
  AllowanceUncertaintyCode,
} from "@/lib/allowances/signaling";
import {
  getMissingFieldCopy,
  getPublicResultStatusLabel,
  getReasonCodeCopy,
  getReliabilityDescription,
  getReliabilityLabel,
  getUncertaintyCopy,
  missingFieldCopy,
  publicResultStatusLabels,
  reliabilityDescriptions,
  reliabilityLabels,
  reasonCodeCopy,
  statusSummaries,
  uncertaintyCopy,
} from "./copy";

const activeReasonCodes: AllowanceReasonCode[] = [
  "missing-age",
  "missing-partner-status",
  "missing-income",
  "missing-joint-income",
  "missing-assets",
  "missing-joint-assets",
  "missing-household-income",
  "missing-household-assets",
  "missing-child-ages",
  "invalid-rule-year",
  "invalid-negative-input",
  "invalid-non-finite-input",
  "complex-exception",
  "official-calculation-required",
  "healthcare-under-minimum-age",
  "healthcare-no-dutch-insurance",
  "healthcare-missing-insurance",
  "healthcare-income-above-limit",
  "healthcare-assets-above-limit",
  "healthcare-possible",
  "rent-missing-tenure",
  "rent-missing-independent-home",
  "rent-missing-basic-rent",
  "rent-missing-co-residents",
  "rent-not-renting",
  "rent-not-independent-home",
  "rent-assets-above-limit",
  "rent-household-complex",
  "rent-subsidiable-rent-uncertain",
  "rent-possible",
  "child-budget-missing-children",
  "child-budget-missing-child-benefit",
  "child-budget-missing-child-residence",
  "child-budget-no-children",
  "child-budget-no-child-under-18",
  "child-budget-no-child-benefit",
  "child-budget-assets-above-limit",
  "child-budget-child-residence-excluded",
  "child-budget-family-complex",
  "child-budget-possible",
  "childcare-missing-children",
  "childcare-missing-care-use",
  "childcare-missing-care-registration",
  "childcare-missing-own-contribution",
  "childcare-missing-child-residence",
  "childcare-missing-applicant-activity",
  "childcare-missing-partner-activity",
  "childcare-missing-hours",
  "childcare-no-children",
  "childcare-no-care",
  "childcare-care-not-registered",
  "childcare-no-own-contribution",
  "childcare-no-qualifying-activity",
  "childcare-partner-no-qualifying-activity",
  "childcare-child-residence-excluded",
  "childcare-situation-complex",
  "childcare-possible",
];

const activeMissingFields: AllowanceMissingField[] = [
  "year",
  "age",
  "partnerStatus",
  "assessmentIncome",
  "jointAssessmentIncome",
  "assets",
  "jointAssets",
  "householdIncome",
  "householdAssets",
  "healthcare.hasDutchHealthInsurance",
  "rent.tenure",
  "rent.independentHome",
  "rent.basicRent",
  "rent.hasCoResidents",
  "children.hasChildren",
  "children.childAges",
  "children.receivesChildBenefit",
  "children.childLivesWithApplicant",
  "childcare.usesChildcare",
  "childcare.registeredChildcare",
  "childcare.paysOwnContribution",
  "childcare.childLivesWithApplicant",
  "childcare.applicantHasQualifyingActivity",
  "childcare.partnerHasQualifyingActivity",
  "childcare.hoursPerMonth",
];

const activeUncertaintyCodes: AllowanceUncertaintyCode[] = [
  "foreign-or-residence-status",
  "special-assets",
  "assessment-income-uncertain",
  "part-year-partner",
  "rent-income-table-not-implemented",
  "rent-household-income-not-fully-modeled",
  "special-housing",
  "special-income",
  "disabled-household-member",
  "income-table-not-implemented",
  "co-parenting",
  "composite-family",
  "foreign-child-or-parent",
  "child-benefit-exception",
  "childcare-amount-engine-not-implemented",
  "education-recognition-uncertain",
  "trajectory-uncertain",
  "variable-childcare-hours",
  "multiple-childcare-types",
  "lrk-registration-uncertain",
  "dataset-not-fresh",
];

describe("toeslagen-scan copy mapping", () => {
  it("translates all active central reason, missing and uncertainty codes", () => {
    expect(Object.keys(reasonCodeCopy).sort()).toEqual(activeReasonCodes.sort());
    expect(Object.keys(missingFieldCopy).sort()).toEqual(activeMissingFields.sort());
    expect(Object.keys(uncertaintyCopy).sort()).toEqual(activeUncertaintyCodes.sort());
  });

  it("has safe fallbacks for unknown codes", () => {
    expect(getReasonCodeCopy("new-code")).toContain("officiële controle");
    expect(getMissingFieldCopy("new-field")).toBe("Aanvullende informatie");
    expect(getUncertaintyCopy("new-uncertainty")).toContain("officiële controle");
  });

  it("translates public result and reliability machine values before rendering", () => {
    expect(publicResultStatusLabels).toEqual({
      "eligible-estimate": "Geschatte toeslag",
      ineligible: "Waarschijnlijk geen recht",
      incomplete: "Aanvullende gegevens nodig",
      "special-case": "Bijzondere situatie",
      unavailable: "Nog geen bedrag beschikbaar",
    });
    expect(getPublicResultStatusLabel("eligible-estimate")).toBe("Geschatte toeslag");
    expect(getReliabilityLabel("redelijke-indicatie")).toBe("Redelijke indicatie");
    expect(getReliabilityDescription("voorlopige-indicatie")).toContain("ontbreken");

    const publicCopy = [
      ...Object.values(publicResultStatusLabels),
      ...Object.values(reliabilityLabels),
      ...Object.values(reliabilityDescriptions),
    ].join(" ");

    for (const machineValue of [
      "eligible-estimate",
      "ineligible",
      "incomplete",
      "special-case",
      "unavailable",
      "sterke-indicatie",
      "redelijke-indicatie",
      "voorlopige-indicatie",
    ]) {
      expect(publicCopy).not.toContain(machineValue);
    }
  });

  it("does not expose raw codes or entitlement promises", () => {
    const allCopy = [
      ...Object.values(reasonCodeCopy),
      ...Object.values(missingFieldCopy),
      ...Object.values(uncertaintyCopy),
      ...Object.values(statusSummaries),
    ].join(" ");

    for (const code of [
      ...activeReasonCodes,
      ...activeMissingFields,
      ...activeUncertaintyCodes,
    ].filter((code) => code.includes("-") || code.includes("."))) {
      expect(allCopy).not.toContain(code);
    }
    expect(allCopy.toLowerCase()).not.toContain("je hebt recht");
    expect(allCopy.toLowerCase()).not.toContain("je ontvangt");
    expect(allCopy.toLowerCase()).not.toContain("je krijgt");
  });
});
