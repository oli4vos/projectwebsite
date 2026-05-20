import { describe, expect, it } from "vitest";
import {
  getDisclaimerTypeLabel,
  getDuoSituationLabel,
  getEmploymentTypeLabel,
  getGlossaryExplanation,
  getGlossaryLabel,
  getOutputTypeLabel,
  getRepaymentRuleLabel,
  getRiskLevelLabel,
} from "@/lib/copy-glossary";

describe("copy glossary labels", () => {
  it("returns disclaimer labels in user-friendly Dutch", () => {
    expect(getDisclaimerTypeLabel("taxIndicative")).toBe(
      "Indicatieve belastingberekening",
    );
    expect(getDisclaimerTypeLabel("mortgageIndicative")).toBe(
      "Indicatieve hypotheekberekening",
    );
    expect(getDisclaimerTypeLabel("duoIndicative")).toBe(
      "Indicatieve DUO-berekening",
    );
    expect(getDisclaimerTypeLabel("financialEducation")).toBe(
      "Educatieve keuzehulp",
    );
  });

  it("returns output type labels in user-friendly Dutch", () => {
    expect(getOutputTypeLabel("scenarioComparison")).toBe("Vergelijk scenario's");
    expect(getOutputTypeLabel("singleResult")).toBe("Eén hoofdresultaat");
    expect(getOutputTypeLabel("timeline")).toBe("Tijdlijn");
  });

  it("returns risk level labels in user-friendly Dutch", () => {
    expect(getRiskLevelLabel("low")).toBe("Laag");
    expect(getRiskLevelLabel("medium")).toBe("Gemiddeld");
    expect(getRiskLevelLabel("high")).toBe("Hoog");
  });

  it("returns DUO repayment rule labels", () => {
    expect(getRepaymentRuleLabel("SF35")).toBe("SF35");
    expect(getRepaymentRuleLabel("SF15_OLD")).toBe("SF15 oude regeling");
    expect(getRepaymentRuleLabel("UNKNOWN")).toBe("Weet ik niet");
  });

  it("returns DUO situation labels", () => {
    expect(getDuoSituationLabel("incomeBasedReduction")).toBe(
      "Verlaagd door draagkracht",
    );
    expect(getDuoSituationLabel("paymentPause")).toBe("Aflossingsvrije periode");
    expect(getDuoSituationLabel("unknown")).toBe("Weet ik niet");
  });

  it("returns employment type labels", () => {
    expect(getEmploymentTypeLabel("employee")).toBe("In loondienst");
    expect(getEmploymentTypeLabel("selfEmployed")).toBe("ZZP / ondernemer");
    expect(getEmploymentTypeLabel("unknown")).toBe(
      "Onbekend / nog niet ingevuld",
    );
  });
});

describe("copy glossary fallbacks and explanations", () => {
  it("handles unknown values with safe fallbacks", () => {
    expect(getDisclaimerTypeLabel(undefined)).toBe("Onbekend");
    expect(getOutputTypeLabel(undefined)).toBe("Onbekend");
    expect(getRiskLevelLabel(undefined)).toBe("Onbekend");
    expect(getRepaymentRuleLabel("invalid-value")).toBe("Onbekend");
    expect(getDuoSituationLabel("invalid-value")).toBe("Onbekend");
    expect(getEmploymentTypeLabel("invalid-value")).toBe("Onbekend");
  });

  it("returns glossary labels and non-empty explanations", () => {
    expect(getGlossaryLabel("box3")).toBe("Box 3");
    expect(getGlossaryLabel("jaarlijksOpnamepercentage")).toBe(
      "Jaarlijks opnamepercentage",
    );

    const terms = [
      "box3",
      "jaarruimte",
      "brutering",
      "wettelijkDuoBedrag",
      "draagkracht",
      "aflossingsvrijePeriode",
      "fiscalePartner",
      "jaarlijksOpnamepercentage",
      "indicatieveBerekening",
    ] as const;

    for (const term of terms) {
      expect(getGlossaryExplanation(term).trim().length).toBeGreaterThan(0);
    }
  });
});
