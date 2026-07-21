import { describe, expect, it } from "vitest";

import { calculateChildBudget2026 } from "@/lib/allowances/child-budget";
import { calculateRentBenefit2026 } from "@/lib/allowances/rent-benefit";
import {
  adapterIssuesToScanResult,
  mapChildBudgetResultToScanResult,
  mapRentBenefitResultToScanResult,
  mapScanInputToChildBudgetInput,
  mapScanInputToRentBenefitInput,
} from "@/lib/allowances/scan-adapters";
import { amountContributesToTotal, type PublicAllowanceScanInput } from "@/lib/allowances/scan-types";

const baseInput: PublicAllowanceScanInput = {
  calculationYear: 2026,
  applicant: {
    age: 20,
    assessmentIncome: 22_000,
    assets: 10_000,
    hasDutchHealthInsurance: true,
  },
  household: {
    hasPartner: false,
    householdIncome: 22_000,
    householdMembers: [],
  },
  children: [
    {
      id: "child-1",
      age: 8,
      receivesChildBenefitOrMeetsMaintenanceCondition: true,
      livesWithApplicant: true,
    },
  ],
  assets: {
    applicant: 10_000,
    householdMembers: [],
  },
  housing: {
    tenure: "rent",
    residenceCountry: "NL",
  },
  rent: {
    isIndependentHome: true,
    basicRent: 600,
    serviceCosts: 125,
    specialSituations: [],
  },
  childcare: {
    usesChildcare: false,
    contracts: [],
    partnerHasQualifyingActivity: "not-applicable",
  },
  calculationPeriod: {
    kind: "full-year",
  },
  unsupportedSituations: [],
};

describe("allowance scan adapters", () => {
  it("maps complete rent input without mixing service costs into basic rent", () => {
    const mapped = mapScanInputToRentBenefitInput(baseInput);

    expect(mapped.ok).toBe(true);
    if (!mapped.ok) return;
    expect(mapped.value.basicRent).toBe(600);
    expect(mapped.value.serviceCosts).toBe(125);

    const result = mapRentBenefitResultToScanResult(calculateRentBenefit2026(mapped.value));
    expect(result.status).toBe("calculated");
    expect(result.monthlyAmount).toBe(295);
    expect(result.yearlyAmount).toBe(3_540);
    expect(result.reasonCodes).toContain("rent-service-costs-ignored-2026");
  });

  it("maps partner and co-resident rent data", () => {
    const mapped = mapScanInputToRentBenefitInput({
      ...baseInput,
      applicant: { ...baseInput.applicant, age: 34, assessmentIncome: 20_000, assets: 0 },
      partner: { age: 34, assessmentIncome: 14_000, assets: 0 },
      household: {
        hasPartner: true,
        householdIncome: 34_000,
        householdMembers: [
          { id: "co-resident-1", age: 5, income: 0, assets: 0, isChildOfApplicantOrPartner: true },
        ],
      },
      assets: {
        applicant: 0,
        partner: 0,
        householdMembers: [{ memberId: "co-resident-1", assets: 0 }],
      },
      rent: { isIndependentHome: true, basicRent: 1_200, specialSituations: [] },
    });

    expect(mapped.ok).toBe(true);
    if (!mapped.ok) return;
    const result = calculateRentBenefit2026(mapped.value);
    expect(result.monthlyAmount).toBe(492);
  });

  it("does not infer missing required rent fields", () => {
    const mapped = mapScanInputToRentBenefitInput({
      ...baseInput,
      applicant: { ...baseInput.applicant, age: undefined },
    });

    expect(mapped.ok).toBe(false);
    if (mapped.ok) return;
    expect(mapped.issues.map((issue) => issue.code)).toContain("missing-age");
  });

  it("maps complete child budget input and official example amounts", () => {
    const mapped = mapScanInputToChildBudgetInput({
      ...baseInput,
      applicant: { ...baseInput.applicant, assessmentIncome: 45_000 },
      partner: { age: 34, assessmentIncome: 45_000, assets: 0 },
      household: { ...baseInput.household, hasPartner: true },
      assets: { applicant: 0, partner: 0, householdMembers: [] },
      children: [
        { id: "child-1", age: 8, receivesChildBenefitOrMeetsMaintenanceCondition: true, livesWithApplicant: true },
        { id: "child-2", age: 9, receivesChildBenefitOrMeetsMaintenanceCondition: true, livesWithApplicant: true },
      ],
    });

    expect(mapped.ok).toBe(true);
    if (!mapped.ok) return;
    const result = mapChildBudgetResultToScanResult(calculateChildBudget2026(mapped.value));
    expect(result.status).toBe("calculated");
    expect(result.monthlyAmount).toBe(392);
  });

  it("keeps unsupported child budget situations amountless", () => {
    const mapped = mapScanInputToChildBudgetInput({
      ...baseInput,
      children: [
        {
          id: "child-1",
          age: 8,
          receivesChildBenefitOrMeetsMaintenanceCondition: true,
          livesWithApplicant: true,
          coParenting: true,
        },
      ],
    });

    expect(mapped.ok).toBe(false);
    if (mapped.ok) return;
    const result = adapterIssuesToScanResult("child-budget", mapped.issues);
    expect(result.status).toBe("unsupported");
    expect(result.monthlyAmount).toBeUndefined();
    expect(result.yearlyAmount).toBeUndefined();
  });

  it("does not calculate child budget for children who do not live with the applicant", () => {
    const mapped = mapScanInputToChildBudgetInput({
      ...baseInput,
      children: [
        {
          id: "child-1",
          age: 8,
          receivesChildBenefitOrMeetsMaintenanceCondition: true,
          livesWithApplicant: false,
        },
      ],
    });

    expect(mapped.ok).toBe(false);
    if (mapped.ok) return;
    expect(mapped.issues.map((issue) => issue.code)).toContain("child-budget-child-residence-excluded");
    const result = adapterIssuesToScanResult("child-budget", mapped.issues);
    expect(result.monthlyAmount).toBeUndefined();
    expect(amountContributesToTotal(result)).toBe(false);
  });

  it("distinguishes true zero outcomes from blockers in totals", () => {
    const zero = mapChildBudgetResultToScanResult(calculateChildBudget2026({
      calculationYear: 2026,
      hasPartner: false,
      assessmentIncome: 200_000,
      applicantAssets: 10_000,
      residenceCountry: "NL",
      children: [{ age: 8, receivesChildBenefitOrMeetsMaintenanceCondition: true }],
    }));
    const unsupported = adapterIssuesToScanResult("child-budget", [
      { code: "unsupported-co-parenting", field: "children.coParenting" },
    ]);

    expect(zero.status).toBe("no-entitlement");
    expect(zero.monthlyAmount).toBe(0);
    expect(amountContributesToTotal(zero)).toBe(true);
    expect(unsupported.monthlyAmount).toBeUndefined();
    expect(amountContributesToTotal(unsupported)).toBe(false);
  });
});
