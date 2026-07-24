import { describe, expect, it } from "vitest";

import { calculateChildcareBenefit2026, type ChildcareBenefitInput } from "@/lib/allowances/childcare-benefit";

const baseInput: ChildcareBenefitInput = {
  calculationYear: 2026,
  hasPartner: false,
  assessmentIncome: 60_000,
  hasChildren: true,
  usesChildcare: true,
  childrenLivingWithApplicant: true,
  isLrkRegistered: true,
  paysOwnContribution: true,
  applicantHasQualifyingActivity: true,
  partnerHasQualifyingActivity: "not-applicable",
  contracts: [
    {
      childId: "child-1",
      careType: "daycare",
      hoursPerMonth: 122,
      hourlyRate: 10.5,
    },
  ],
};

describe("childcare benefit 2026", () => {
  it("calculates the official one-child daycare example", () => {
    const result = calculateChildcareBenefit2026(baseInput);

    expect(result.eligibilityStatus).toBe("calculated");
    expect(result.monthlyAmount).toBe(1_202);
    expect(result.yearlyAmount).toBe(14_424);
    expect(result.components.firstChildReimbursementPercentage).toBe(93.9);
    expect(result.contracts[0]).toMatchObject({
      cappedHours: 122,
      cappedHourlyRate: 10.5,
      isFirstChild: true,
    });
    expect(Object.isFrozen(result)).toBe(true);
  });

  it("calculates the official two-child example with first-child selection", () => {
    const result = calculateChildcareBenefit2026({
      ...baseInput,
      hasPartner: true,
      assessmentIncome: 120_000,
      partnerHasQualifyingActivity: true,
      contracts: [
        { childId: "youngest", careType: "daycare", hoursPerMonth: 87, hourlyRate: 12.45 },
        { childId: "oldest", careType: "out-of-school-care", hoursPerMonth: 65, hourlyRate: 10.1 },
      ],
    });

    expect(result.monthlyAmount).toBe(1_162);
    expect(result.firstChildId).toBe("youngest");
    expect(result.components.firstChildReimbursementPercentage).toBe(60.6);
    expect(result.components.nextChildReimbursementPercentage).toBe(87.9);
    expect(result.reasonCodes).toContain("childcare-multiple-contracts-calculated");
  });

  it("caps childminder hours for the official hour-cap example", () => {
    const result = calculateChildcareBenefit2026({
      ...baseInput,
      assessmentIncome: 40_000,
      contracts: [
        { childId: "child-1", careType: "childminder-care", hoursPerMonth: 240, hourlyRate: 8.25 },
      ],
    });

    expect(result.monthlyAmount).toBe(1_821);
    expect(result.contracts[0]?.cappedHours).toBe(230);
    expect(result.reasonCodes).toContain("childcare-hours-or-rate-capped");
  });

  it("caps childminder hourly rate for the official rate-cap example", () => {
    const result = calculateChildcareBenefit2026({
      ...baseInput,
      assessmentIncome: 50_000,
      contracts: [
        { childId: "child-1", careType: "childminder-care", hoursPerMonth: 108, hourlyRate: 9.52 },
      ],
    });

    expect(result.monthlyAmount).toBe(880);
    expect(result.contracts[0]?.cappedHourlyRate).toBe(8.49);
  });

  it("returns zero for hard no-entitlement childcare conditions", () => {
    expect(calculateChildcareBenefit2026({
      ...baseInput,
      usesChildcare: false,
    })).toMatchObject({
      eligibilityStatus: "ineligible",
      monthlyAmount: 0,
      reasonCodes: ["childcare-no-care"],
    });
    expect(calculateChildcareBenefit2026({
      ...baseInput,
      hasPartner: true,
      partnerHasQualifyingActivity: false,
    })).toMatchObject({
      eligibilityStatus: "ineligible",
      monthlyAmount: 0,
      reasonCodes: ["childcare-partner-no-qualifying-activity"],
    });
  });

  it("keeps missing and unsupported situations amountless", () => {
    const incomplete = calculateChildcareBenefit2026({
      ...baseInput,
      contracts: [],
    });
    expect(incomplete).toMatchObject({
      eligibilityStatus: "incomplete",
      reasonCodes: ["missing-childcare-contracts"],
    });
    expect(incomplete.monthlyAmount).toBeUndefined();
    const unsupported = calculateChildcareBenefit2026({
      ...baseInput,
      specialSituations: ["variable-hours"],
    });
    expect(unsupported).toMatchObject({
      eligibilityStatus: "unsupported",
      warnings: ["manual-review-required"],
    });
    expect(unsupported.monthlyAmount).toBeUndefined();
  });

  it("does not mutate the input contract objects", () => {
    const input = {
      ...baseInput,
      contracts: [
        { childId: "child-1", careType: "daycare" as const, hoursPerMonth: 240, hourlyRate: 12 },
      ],
    };
    const before = structuredClone(input);

    calculateChildcareBenefit2026(input);

    expect(input).toEqual(before);
  });
});
