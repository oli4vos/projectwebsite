import { describe, expect, it } from "vitest";

import { calculateChildBudget2026 } from "@/lib/allowances/child-budget";
import type { ChildBudgetInput } from "@/lib/allowances/child-budget";

const singleParentInput: ChildBudgetInput = {
  calculationYear: 2026,
  hasPartner: false,
  assessmentIncome: 29_736,
  applicantAssets: 10_000,
  residenceCountry: "NL",
  children: [{ age: 8, receivesChildBenefitOrMeetsMaintenanceCondition: true }],
};

describe("calculateChildBudget2026", () => {
  it("matches the official single parent example", () => {
    const result = calculateChildBudget2026({
      ...singleParentInput,
      assessmentIncome: 30_000,
    });

    expect(result.eligibilityStatus).toBe("calculated");
    expect(result.maximumYearlyAmount).toBe(5_996);
    expect(result.incomeReduction).toBe(20.06);
    expect(result.yearlyAmount).toBe(5_975.94);
    expect(result.monthlyAmount).toBe(497);
    expect(result.singleParentSupplement).toBe(3_416);
  });

  it("calculates one, two, three and older-child amounts", () => {
    expect(calculateChildBudget2026(singleParentInput).monthlyAmount).toBe(499);
    expect(calculateChildBudget2026({
      ...singleParentInput,
      children: [
        { age: 8, receivesChildBenefitOrMeetsMaintenanceCondition: true },
        { age: 9, receivesChildBenefitOrMeetsMaintenanceCondition: true },
      ],
    }).maximumYearlyAmount).toBe(8_576);
    expect(calculateChildBudget2026({
      ...singleParentInput,
      children: [
        { age: 8, receivesChildBenefitOrMeetsMaintenanceCondition: true },
        { age: 9, receivesChildBenefitOrMeetsMaintenanceCondition: true },
        { age: 10, receivesChildBenefitOrMeetsMaintenanceCondition: true },
      ],
    }).maximumYearlyAmount).toBe(11_156);
    expect(calculateChildBudget2026({
      ...singleParentInput,
      children: [
        { age: 12, receivesChildBenefitOrMeetsMaintenanceCondition: true },
        { age: 16, receivesChildBenefitOrMeetsMaintenanceCondition: true },
      ],
    }).olderChildSupplements).toBe(1_688);
  });

  it("matches official partner examples with income reduction and age supplements", () => {
    const twoYoungChildren = calculateChildBudget2026({
      ...singleParentInput,
      hasPartner: true,
      assessmentIncome: 45_000,
      partnerAssets: 0,
      children: [
        { age: 8, receivesChildBenefitOrMeetsMaintenanceCondition: true },
        { age: 9, receivesChildBenefitOrMeetsMaintenanceCondition: true },
      ],
    });
    const olderChildren = calculateChildBudget2026({
      ...singleParentInput,
      hasPartner: true,
      assessmentIncome: 45_000,
      partnerAssets: 0,
      children: [
        { age: 13, receivesChildBenefitOrMeetsMaintenanceCondition: true },
        { age: 16, receivesChildBenefitOrMeetsMaintenanceCondition: true },
      ],
    });

    expect(twoYoungChildren.monthlyAmount).toBe(392);
    expect(olderChildren.monthlyAmount).toBe(533);
  });

  it("does not treat 29.736 and 39.141 as absolute income limits", () => {
    const oneEuroAbove = calculateChildBudget2026({
      ...singleParentInput,
      assessmentIncome: 29_737,
    });
    const partnerThreshold = calculateChildBudget2026({
      ...singleParentInput,
      hasPartner: true,
      partnerAssets: 0,
      assessmentIncome: 39_141,
    });

    expect(oneEuroAbove.eligibilityStatus).toBe("calculated");
    expect(oneEuroAbove.incomeReduction).toBe(0.08);
    expect(partnerThreshold.incomeReduction).toBe(0);
    expect(partnerThreshold.monthlyAmount).toBe(215);
  });

  it("reduces high income to zero without negative amounts", () => {
    const result = calculateChildBudget2026({
      ...singleParentInput,
      assessmentIncome: 200_000,
    });

    expect(result.eligibilityStatus).toBe("ineligible");
    expect(result.yearlyAmount).toBe(0);
    expect(result.monthlyAmount).toBe(0);
    expect(result.reasonCodes).toContain("child-budget-zero-after-income-reduction");
  });

  it("allows assets exactly at the boundary and blocks one euro above", () => {
    expect(calculateChildBudget2026({
      ...singleParentInput,
      applicantAssets: 146_011,
    }).eligibilityStatus).toBe("calculated");

    const blocked = calculateChildBudget2026({
      ...singleParentInput,
      applicantAssets: 146_012,
    });
    expect(blocked.eligibilityStatus).toBe("ineligible");
    expect(blocked.reasonCodes).toContain("child-budget-assets-above-limit");
  });

  it("requires a qualifying child under 18", () => {
    expect(calculateChildBudget2026({
      ...singleParentInput,
      children: [{ age: 18, receivesChildBenefitOrMeetsMaintenanceCondition: true }],
    }).reasonCodes).toContain("child-budget-no-qualifying-children");
    expect(calculateChildBudget2026({
      ...singleParentInput,
      children: [{ age: 8, receivesChildBenefitOrMeetsMaintenanceCondition: false }],
    }).reasonCodes).toContain("child-budget-no-qualifying-children");
  });

  it("applies the Netherlands residence factor and blocks foreign factors", () => {
    const domestic = calculateChildBudget2026(singleParentInput);
    const foreign = calculateChildBudget2026({
      ...singleParentInput,
      residenceCountry: "other",
    });

    expect(domestic.reasonCodes).toContain("child-budget-domestic-residence-factor-applied");
    expect(foreign.eligibilityStatus).toBe("unsupported");
    expect(foreign.reasonCodes).toContain("unsupported-foreign-residence-factor");
  });

  it("blocks co-parenting and partial-year age changes explicitly", () => {
    expect(calculateChildBudget2026({
      ...singleParentInput,
      specialSituations: ["co-parenting"],
    }).reasonCodes).toContain("unsupported-co-parenting");
    expect(calculateChildBudget2026({
      ...singleParentInput,
      specialSituations: ["age-change-during-year"],
    }).reasonCodes).toContain("partial-year-not-supported");
  });

  it("is deterministic, immutable and rejects invalid input", () => {
    const input = structuredClone(singleParentInput);
    const original = structuredClone(input);
    const first = calculateChildBudget2026(input);
    const second = calculateChildBudget2026(input);

    expect(first).toEqual(second);
    expect(input).toEqual(original);
    expect(Object.isFrozen(first)).toBe(true);
    expect(calculateChildBudget2026({ ...input, calculationYear: 2027 }).eligibilityStatus).toBe("unsupported");
    expect(calculateChildBudget2026({
      ...input,
      children: [{ age: -1, receivesChildBenefitOrMeetsMaintenanceCondition: true }],
    }).reasonCodes).toContain("invalid-child-0-age");
  });
});
