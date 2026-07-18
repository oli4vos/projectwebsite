import { describe, expect, it } from "vitest";

import {
  signalChildBudgetAllowance,
  signalChildcareAllowance,
  signalHealthcareAllowance,
  signalRentAllowance,
} from "@/lib/allowances/signaling";
import type { AllowanceSignalDataset } from "@/lib/allowances/signaling";

const dataset: AllowanceSignalDataset = {
  year: 2026,
  healthcare: {
    minimumAge: 18,
    maxIncomeSingle: 40_000,
    maxIncomeWithPartner: 50_000,
    maxAssetsSingle: 140_213,
    maxAssetsWithPartner: 177_301,
    officialCalculationUrl: "https://www.belastingdienst.nl/toeslagen",
  },
  rent: {
    maxAssetsPerResident: 38_479,
    maxAssetsPartnersTogether: 76_958,
    cappedRentThreshold: 900.07,
    cappedRentThresholdAllUnder21: 477.20,
    officialCalculationUrl: "https://www.belastingdienst.nl/toeslagen",
  },
  childBudget: {
    maxAssetsSingle: 140_213,
    maxAssetsWithPartner: 177_301,
    officialCalculationUrl: "https://www.belastingdienst.nl/toeslagen",
  },
  childcare: {
    maxHoursPerMonth: 230,
    officialCalculationUrl: "https://www.belastingdienst.nl/toeslagen",
  },
};

const context = {
  datasetId: "allowance-signal-rules-test-2026",
  freshnessStatus: "fresh" as const,
};

describe("allowance signaling domain", () => {
  it("signals healthcare allowance as possible when hard conditions pass", () => {
    const result = signalHealthcareAllowance(
      {
        year: 2026,
        age: 24,
        hasAllowancePartner: false,
        assessmentIncome: 32_000,
        assets: 10_000,
        hasDutchHealthInsurance: true,
      },
      dataset,
      context,
    );

    expect(result.status).toBe("possible");
    expect(result.reasonCodes).toEqual(["hard-conditions-pass"]);
  });

  it("rejects healthcare allowance on hard age and insurance boundaries", () => {
    expect(
      signalHealthcareAllowance(
        {
          year: 2026,
          age: 17,
          hasAllowancePartner: false,
          assessmentIncome: 20_000,
          assets: 0,
          hasDutchHealthInsurance: true,
        },
        dataset,
        context,
      ).reasonCodes,
    ).toContain("age-under-18");

    expect(
      signalHealthcareAllowance(
        {
          year: 2026,
          age: 18,
          hasAllowancePartner: false,
          assessmentIncome: 20_000,
          assets: 0,
          hasDutchHealthInsurance: false,
        },
        dataset,
        context,
      ).reasonCodes,
    ).toContain("no-dutch-health-insurance");
  });

  it("returns insufficient information instead of calculating incomplete rent allowance", () => {
    const result = signalRentAllowance(
      {
        year: 2026,
        housing: { tenure: "rent" },
      },
      dataset,
      context,
    );

    expect(result.status).toBe("insufficient-information");
    expect(result.missingFields).toEqual(
      expect.arrayContaining([
        "housing.independentHome",
        "housing.basicRent",
        "assets",
        "hasAllowancePartner",
        "housing.householdMemberCount",
      ]),
    );
  });

  it("rejects rent allowance on ownership, non-independent homes and asset limits", () => {
    const common = {
      year: 2026,
      hasAllowancePartner: false,
      assets: 10_000,
      housing: {
        tenure: "rent" as const,
        independentHome: true,
        basicRent: 800,
        householdMemberCount: 1,
      },
    };

    expect(
      signalRentAllowance(
        { ...common, housing: { ...common.housing, tenure: "owner" } },
        dataset,
        context,
      ).reasonCodes,
    ).toContain("not-renting");
    expect(
      signalRentAllowance(
        { ...common, housing: { ...common.housing, independentHome: false } },
        dataset,
        context,
      ).reasonCodes,
    ).toContain("not-independent-home");
    expect(
      signalRentAllowance({ ...common, assets: 100_000 }, dataset, context)
        .reasonCodes,
    ).toContain("assets-above-hard-threshold");
  });

  it("keeps child budget as signal-only because amount tables are not implemented", () => {
    const result = signalChildBudgetAllowance(
      {
        year: 2026,
        hasAllowancePartner: false,
        assessmentIncome: 30_000,
        assets: 20_000,
        children: [{ age: 7 }],
      },
      dataset,
      context,
    );

    expect(result.status).toBe("official-calculation-recommended");
    expect(result.uncertainties).toContain("income-table-not-implemented");
  });

  it("rejects child budget without a child under 18 or above assets", () => {
    expect(
      signalChildBudgetAllowance(
        {
          year: 2026,
          hasAllowancePartner: false,
          assessmentIncome: 30_000,
          assets: 20_000,
          children: [{ age: 18 }],
        },
        dataset,
        context,
      ).reasonCodes,
    ).toContain("no-child-under-18");

    expect(
      signalChildBudgetAllowance(
        {
          year: 2026,
          hasAllowancePartner: false,
          assessmentIncome: 30_000,
          assets: 200_000,
          children: [{ age: 5 }],
        },
        dataset,
        context,
      ).reasonCodes,
    ).toContain("assets-above-hard-threshold");
  });

  it("checks childcare registration and qualifying activity before recommending official calculation", () => {
    const possible = signalChildcareAllowance(
      {
        year: 2026,
        hasAllowancePartner: true,
        children: [{ age: 4 }],
        childcare: {
          registeredChildcare: true,
          hoursPerMonth: 80,
          parentHasQualifyingActivity: true,
          partnerHasQualifyingActivity: true,
        },
      },
      dataset,
      context,
    );

    expect(possible.status).toBe("official-calculation-recommended");
    expect(possible.reasonCodes).toContain("complex-rules-official-calculation");

    expect(
      signalChildcareAllowance(
        {
          year: 2026,
          children: [{ age: 4 }],
          childcare: {
            registeredChildcare: false,
            hoursPerMonth: 80,
            parentHasQualifyingActivity: true,
          },
        },
        dataset,
        context,
      ).reasonCodes,
    ).toContain("no-registered-childcare");
  });
});
