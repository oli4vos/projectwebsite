import { describe, expect, it } from "vitest";

import { calculateRentBenefit2026 } from "@/lib/allowances/rent-benefit";
import type { RentBenefitInput } from "@/lib/allowances/rent-benefit";

const singleInput: RentBenefitInput = {
  calculationYear: 2026,
  applicantAge: 30,
  hasPartner: false,
  isIndependentHome: true,
  basicRent: 600,
  householdIncome: 22_000,
  applicantAssets: 10_000,
};

describe("calculateRentBenefit2026", () => {
  it("matches the official single-person example", () => {
    const result = calculateRentBenefit2026({
      ...singleInput,
      applicantAge: 20,
    });

    expect(result.eligibilityStatus).toBe("calculated");
    expect(result.monthlyAmount).toBe(295);
    expect(result.yearlyAmount).toBe(3_540);
    expect(result.components).toMatchObject({
      qualityDiscountPart: 295.68,
      cappingBandPart: 0,
      aboveCappingPart: 0,
      incomeCorrection: 0,
    });
  });

  it("matches the official partner-with-child example", () => {
    const result = calculateRentBenefit2026({
      calculationYear: 2026,
      applicantAge: 34,
      hasPartner: true,
      partnerAge: 34,
      coResidents: [{ age: 5, assets: 0, income: 0, isChildOfApplicantOrPartner: true }],
      isIndependentHome: true,
      basicRent: 1_200,
      householdIncome: 34_000,
      applicantAssets: 0,
      partnerAssets: 0,
    });

    expect(result.monthlyAmount).toBe(492);
    expect(result.cappedCalculationRent).toBe(932.93);
    expect(result.components).toMatchObject({
      qualityDiscountPart: 297.49,
      cappingBandPart: 172.86,
      aboveCappingPart: 67.52,
      incomeCorrection: 45.83,
    });
  });

  it("matches the official AOW-age example through the standard 2026 formula", () => {
    const result = calculateRentBenefit2026({
      ...singleInput,
      applicantAge: 67,
      basicRent: 710,
      householdIncome: 29_000,
    });

    expect(result.monthlyAmount).toBe(307);
    expect(result.components.incomeCorrection).toBe(125.44);
  });

  it("caps high rent and ignores service costs", () => {
    const withoutServiceCosts = calculateRentBenefit2026({
      ...singleInput,
      basicRent: 1_200,
    });
    const withServiceCosts = calculateRentBenefit2026({
      ...singleInput,
      basicRent: 1_200,
      serviceCosts: 150,
    });

    expect(withServiceCosts.cappedCalculationRent).toBe(932.93);
    expect(withServiceCosts.monthlyAmount).toBe(withoutServiceCosts.monthlyAmount);
    expect(withServiceCosts.reasonCodes).toContain("rent-service-costs-ignored-2026");
    expect(withServiceCosts.reasonCodes).toContain("rent-calculation-rent-capped");
  });

  it("applies the under-21 cap and skips capping bands without an exception", () => {
    const result = calculateRentBenefit2026({
      ...singleInput,
      applicantAge: 20,
      basicRent: 900,
    });

    expect(result.cappedCalculationRent).toBe(498.2);
    expect(result.components.cappingBandPart).toBe(0);
    expect(result.components.aboveCappingPart).toBe(0);
    expect(result.monthlyAmount).toBe(295);
    expect(result.reasonCodes).toContain("rent-under-21-cap-applied");
  });

  it("uses the regular cap when an under-21 exception is explicit", () => {
    const result = calculateRentBenefit2026({
      ...singleInput,
      applicantAge: 20,
      basicRent: 900,
      hasChildOrDisabilityExceptionWhenUnder21: true,
    });

    expect(result.cappedCalculationRent).toBe(900);
    expect(result.components.cappingBandPart).toBeGreaterThan(0);
  });

  it("allows assets exactly at the boundary and blocks one euro above", () => {
    expect(calculateRentBenefit2026({
      ...singleInput,
      applicantAssets: 38_479,
    }).eligibilityStatus).toBe("calculated");

    const blocked = calculateRentBenefit2026({
      ...singleInput,
      applicantAssets: 38_480,
    });
    expect(blocked.eligibilityStatus).toBe("ineligible");
    expect(blocked.monthlyAmount).toBe(0);
    expect(blocked.reasonCodes).toContain("rent-assets-above-limit");
  });

  it("uses co-resident asset limits and child income exemption when member incomes are provided", () => {
    const result = calculateRentBenefit2026({
      ...singleInput,
      householdIncome: undefined,
      applicantIncome: 20_000,
      coResidents: [
        { age: 20, income: 7_000, assets: 1_000, isChildOfApplicantOrPartner: true },
        { age: 24, income: 4_000, assets: 1_000 },
      ],
    });

    expect(result.householdIncomeUsed).toBe(24_782);
    expect(result.eligibilityStatus).toBe("calculated");

    const blocked = calculateRentBenefit2026({
      ...singleInput,
      coResidents: [{ age: 30, assets: 38_480 }],
    });
    expect(blocked.reasonCodes).toContain("rent-co-resident-assets-above-limit");
  });

  it("returns zero through income correction at high income", () => {
    const result = calculateRentBenefit2026({
      ...singleInput,
      householdIncome: 80_000,
    });

    expect(result.eligibilityStatus).toBe("ineligible");
    expect(result.monthlyAmount).toBe(0);
    expect(result.reasonCodes).toContain("rent-benefit-zero-after-income-correction");
  });

  it("blocks non-independent and special housing situations explicitly", () => {
    expect(calculateRentBenefit2026({
      ...singleInput,
      isIndependentHome: false,
    }).reasonCodes).toContain("unsupported-non-independent-home");

    expect(calculateRentBenefit2026({
      ...singleInput,
      specialSituations: ["special-housing-situation"],
    }).reasonCodes).toContain("unsupported-special-housing-situation");
  });

  it("handles rounding boundaries deterministically and immutably", () => {
    const input = structuredClone({
      ...singleInput,
      householdIncome: 23_426,
    });
    const original = structuredClone(input);
    const first = calculateRentBenefit2026(input);
    const second = calculateRentBenefit2026(input);

    expect(first.monthlyAmount).toBe(361);
    expect(first.components.incomeCorrection).toBe(0.02);
    expect(first).toEqual(second);
    expect(input).toEqual(original);
    expect(Object.isFrozen(first)).toBe(true);
  });

  it("rejects invalid numbers and unsupported years without calculating", () => {
    expect(calculateRentBenefit2026({
      ...singleInput,
      calculationYear: 2027,
    }).eligibilityStatus).toBe("unsupported");

    const invalid = calculateRentBenefit2026({
      ...singleInput,
      basicRent: -1,
    });
    expect(invalid.eligibilityStatus).toBe("incomplete");
    expect(invalid.reasonCodes).toContain("invalid-basicRent");
  });
});
