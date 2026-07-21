import { describe, expect, it } from "vitest";

import { calculateDuoAdditionalGrant } from "@/lib/duo/additional-grant";
import type { DuoAdditionalGrantInput } from "@/lib/duo/additional-grant";

const hboBaseInput: DuoAdditionalGrantInput = {
  calculationYear: 2026,
  educationType: "hbo",
  residence: "living-at-home",
  familySituation: "two-parents",
  standardReferenceYearInput: {
    parent1Income: 20_750.30,
    parent2Income: 20_750.30,
  },
};

describe("DUO additional grant calculation 2026", () => {
  it("calculates maximum hbo/wo grant at the official maximum-threshold boundary", () => {
    const result = calculateDuoAdditionalGrant(hboBaseInput);

    expect(result.status).toBe("calculated");
    expect(result.standardReferenceYear).toBe(2024);
    expect(result.estimatedMonthlyGrant).toBe(491.08);
    expect(result.estimatedAnnualGrant).toBe(5_892.96);
    expect(result.appliedMaximumMonthlyGrant).toBe(491.08);
    expect(result.standardReferenceYearResult.parentalMonthlyContribution).toBe(0);
    expect(result.reasonCodes).toContain("duo-additional-grant-calculated");
    expect(result.sourceReferences.some((source) => source.year === 2026)).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.standardReferenceYearResult.parentContributions)).toBe(true);
  });

  it("calculates a partial hbo grant with the official 13.6 percent taper", () => {
    const result = calculateDuoAdditionalGrant({
      ...hboBaseInput,
      standardReferenceYearInput: {
        parent1Income: 25_000,
        parent2Income: 25_000,
      },
    });

    expect(result.status).toBe("calculated");
    expect(result.standardReferenceYearResult.parentalAnnualContribution).toBe(1_155.92);
    expect(result.standardReferenceYearResult.parentalMonthlyContribution).toBe(96.33);
    expect(result.estimatedMonthlyGrant).toBe(394.75);
    expect(result.estimatedAnnualGrant).toBe(4_737);
  });

  it("calculates nihil hbo grant when parental contribution exceeds the maximum", () => {
    const result = calculateDuoAdditionalGrant({
      ...hboBaseInput,
      standardReferenceYearInput: {
        parent1Income: 60_000,
        parent2Income: 60_000,
      },
    });

    expect(result.status).toBe("calculated");
    expect(result.estimatedMonthlyGrant).toBe(0);
    expect(result.estimatedAnnualGrant).toBe(0);
    expect(result.reasonCodes).toContain("duo-additional-grant-parental-contribution-at-or-above-maximum");
  });

  it("calculates mbo living-at-home and living-away maxima", () => {
    const livingAtHome = calculateDuoAdditionalGrant({
      calculationYear: 2026,
      educationType: "mbo-1-2",
      residence: "living-at-home",
      familySituation: "single-parent",
      calculationMonth: 7,
      standardReferenceYearInput: { parent1Income: 0 },
    });
    const livingAway = calculateDuoAdditionalGrant({
      calculationYear: 2026,
      educationType: "mbo-3-4",
      residence: "living-away",
      familySituation: "single-parent",
      calculationMonth: 7,
      standardReferenceYearInput: { parent1Income: 0 },
    });

    expect(livingAtHome.status).toBe("calculated");
    expect(livingAtHome.estimatedMonthlyGrant).toBe(438.08);
    expect(livingAway.status).toBe("calculated");
    expect(livingAway.estimatedMonthlyGrant).toBe(466.40);
  });

  it("uses sibling and parent repayment deductions in the same central formula", () => {
    const result = calculateDuoAdditionalGrant({
      ...hboBaseInput,
      standardReferenceYearInput: {
        parent1Income: 50_000,
        parent2Income: 50_000,
        parent1AnnualDuoRepaymentTerms: 1_200,
        parent2OtherQualifyingChildren: 2,
        parent1ChildrenWithAdditionalGrant: 2,
        parent2ChildrenWithAdditionalGrant: 2,
      },
    });

    expect(result.status).toBe("calculated");
    expect(result.standardReferenceYearResult.parentContributions[0]).toMatchObject({
      annualDuoRepaymentTerms: 1_200,
      childrenWithAdditionalGrant: 2,
      annualContributionPerChild: 1_388.98,
    });
    expect(result.standardReferenceYearResult.parentContributions[1]).toMatchObject({
      otherQualifyingChildren: 2,
      otherChildrenDeduction: 726,
      annualContributionPerChild: 1_625.98,
    });
    expect(result.estimatedMonthlyGrant).toBe(239.83);
  });

  it("supports regular one-parent calculations without treating them as missing two-parent input", () => {
    const result = calculateDuoAdditionalGrant({
      calculationYear: 2026,
      educationType: "university",
      residence: "living-away",
      familySituation: "single-parent",
      standardReferenceYearInput: {
        parent1Income: 40_000,
      },
    });

    expect(result.status).toBe("calculated");
    expect(result.standardReferenceYearResult.parentContributions).toHaveLength(1);
    expect(result.estimatedMonthlyGrant).toBe(335.69);
  });

  it("compares standard and alternative reference years using the same calculator", () => {
    const result = calculateDuoAdditionalGrant({
      ...hboBaseInput,
      standardReferenceYearInput: {
        parent1Income: 30_000,
        parent2Income: 30_000,
      },
      alternativeReferenceYear: 2025,
      alternativeReferenceYearInput: {
        parent1Income: 25_500,
        parent2Income: 25_500,
      },
    });

    expect(result.referenceYearComparison).toMatchObject({
      standardReferenceYear: 2024,
      alternativeReferenceYear: 2025,
      standardJointIncome: 60_000,
      alternativeJointIncome: 51_000,
      absoluteIncomeDrop: 9_000,
      incomeDropPercent: 15,
      meetsFifteenPercentCondition: true,
      referenceYearChangeLikelihood: "possible",
    });
    expect(result.referenceYearComparison.estimatedMonthlyBenefit).toBe(102);
    expect(result.referenceYearComparison.estimatedAnnualBenefit).toBe(1_224);
    expect(result.alternativeReferenceYearResult?.estimatedMonthlyGrant).toBe(383.42);
  });

  it("does not present a financially better alternative as valid when the drop is below 15 percent", () => {
    const result = calculateDuoAdditionalGrant({
      ...hboBaseInput,
      standardReferenceYearInput: {
        parent1Income: 25_000,
        parent2Income: 25_000,
      },
      alternativeReferenceYear: 2025,
      alternativeReferenceYearInput: {
        parent1Income: 21_500,
        parent2Income: 21_500,
      },
    });

    expect(result.referenceYearComparison.incomeDropPercent).toBe(14);
    expect(result.referenceYearComparison.meetsFifteenPercentCondition).toBe(false);
    expect(result.referenceYearComparison.referenceYearChangeLikelihood).toBe("unlikely");
    expect(result.referenceYearComparison.estimatedMonthlyBenefit).toBe(0);
  });

  it("flags estimated alternative income with official verification and repayment-risk provenance", () => {
    const result = calculateDuoAdditionalGrant({
      ...hboBaseInput,
      standardReferenceYearInput: {
        parent1Income: 30_000,
        parent2Income: 30_000,
      },
      alternativeReferenceYear: 2026,
      alternativeReferenceYearInput: {
        parent1Income: 25_000,
        parent2Income: 25_000,
        parent1IncomeReliability: "estimated",
      },
    });

    expect(result.alternativeReferenceYearResult?.status).toBe("official-verification-required");
    expect(result.referenceYearComparison.referenceYearChangeLikelihood).toBe("official-verification-required");
    expect(result.reasonCodes).toContain("duo-additional-grant-estimated-income-repayment-risk");
    expect(result.officialVerificationRequired).toBe(true);
  });

  it("returns guidance instead of calculating with missing concrete values", () => {
    const result = calculateDuoAdditionalGrant({
      calculationYear: 2026,
      educationType: "hbo",
      residence: "living-at-home",
      familySituation: "two-parents",
      standardReferenceYearInput: {
        parent1Income: 20_000,
      },
    });

    expect(result.status).toBe("incomplete");
    expect(result.estimatedMonthlyGrant).toBeUndefined();
    expect(result.missingInputs.map((item) => item.fieldId)).toContain("parent2ReferenceYearIncome");
    expect(result.missingInputs[0].guidance.explanation).not.toMatch(/ga naar|bekijk/i);
    expect(result.missingInputs[0].guidance.sourceReferences.length).toBeGreaterThan(0);
  });

  it("classifies special cases without silently using the regular formula", () => {
    const result = calculateDuoAdditionalGrant({
      ...hboBaseInput,
      specialCases: ["parent-deceased"],
    });

    expect(result.status).toBe("special-case");
    expect(result.estimatedMonthlyGrant).toBeUndefined();
    expect(result.reasonCodes).toContain("duo-additional-grant-special-case-parent-deceased");
    expect(result.officialVerificationRequired).toBe(true);
  });

  it("rejects unsupported years and invalid numeric fields safely", () => {
    expect(calculateDuoAdditionalGrant({ ...hboBaseInput, calculationYear: 2027 }).status).toBe("unsupported");
    const invalid = calculateDuoAdditionalGrant({
      ...hboBaseInput,
      standardReferenceYearInput: {
        parent1Income: 20_000,
        parent2Income: 20_000,
        parent1OtherQualifyingChildren: -1,
      },
    });

    expect(invalid.status).toBe("incomplete");
    expect(invalid.reasonCodes).toContain("invalid-parent1OtherQualifyingChildren");
  });

  it("is deterministic and does not mutate input", () => {
    const input = structuredClone(hboBaseInput);
    const original = structuredClone(input);
    const first = calculateDuoAdditionalGrant(input);
    const second = calculateDuoAdditionalGrant(input);

    expect(first).toEqual(second);
    expect(input).toEqual(original);
  });
});
