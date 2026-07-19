import { describe, expect, it } from "vitest";

import {
  evaluateAllowanceSignals,
  evaluateChildBudgetAllowance,
  evaluateChildcareAllowance,
  evaluateHealthcareAllowance,
  evaluateRentAllowance,
} from "@/lib/allowances/signaling";
import type { AllowanceScanInput, AllowanceSignalDataset } from "@/lib/allowances/signaling";
import {
  getDatasetForDate,
  getDatasetFreshness,
  SOURCE_DATASET_REGISTRY,
} from "@/lib/financial-constants/source-datasets";
import type { SourceDataset } from "@/lib/financial-constants";

const dataset = getDatasetForDate("allowance-signal-rules", "2026-07-19", {
  scenario: "general",
}) as SourceDataset<AllowanceSignalDataset>;

const completeInput: AllowanceScanInput = {
  year: 2026,
  age: 30,
  partnerStatus: "no",
  assessmentIncome: 30_000,
  assets: 10_000,
  healthcare: { hasDutchHealthInsurance: true },
  rent: {
    tenure: "rent",
    independentHome: true,
    basicRent: 1200,
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
    childLivesWithApplicant: true,
    paysOwnContribution: true,
    applicantHasQualifyingActivity: true,
    partnerHasQualifyingActivity: "not-applicable",
    hoursPerMonth: 80,
  },
};

function result(kind: string, input: AllowanceScanInput = completeInput) {
  return evaluateAllowanceSignals(input).results.find(
    (item) => item.allowanceKind === kind,
  );
}

describe("allowance signaling domain", () => {
  it("returns all four allowances in fixed order with dataset metadata and no amount field", () => {
    const input = structuredClone(completeInput);
    const original = structuredClone(input);
    const first = evaluateAllowanceSignals(input);
    const second = evaluateAllowanceSignals(input);

    expect(first.results.map((item) => item.allowanceKind)).toEqual([
      "healthcare",
      "rent",
      "child-budget",
      "childcare",
    ]);
    expect(first.ruleYear).toBe(2026);
    expect(first.datasetId).toBe("allowance-signal-rules-2026");
    expect(first.datasetVersion).toBe("1.0.0");
    expect(first).toEqual(second);
    expect(input).toEqual(original);
    for (const allowance of first.results) {
      expect("amount" in allowance).toBe(false);
      expect(allowance.sourceReferences.length).toBeGreaterThan(1);
      expect(allowance.sourceReferences.every((source) => source.sourceUrl.startsWith("https://"))).toBe(true);
    }
  });

  it("fails safely for missing, future and expired datasets", () => {
    expect(() =>
      evaluateAllowanceSignals(completeInput, { registry: [] }),
    ).toThrow("Geen actieve brondata");

    const futureDataset: SourceDataset<AllowanceSignalDataset> = {
      ...dataset,
      meta: { ...dataset.meta, id: "allowance-future", effectiveFrom: "2027-01-01" },
    };
    const expiredDataset: SourceDataset<AllowanceSignalDataset> = {
      ...dataset,
      meta: { ...dataset.meta, id: "allowance-expired", status: "expired" },
    };

    expect(getDatasetFreshness(futureDataset, "2026-07-19").status).toBe("future");
    expect(getDatasetFreshness(expiredDataset, "2026-07-19").status).toBe("expired");
    expect(() => evaluateAllowanceSignals(completeInput, { dataset: futureDataset })).toThrow("future");
    expect(() => evaluateAllowanceSignals(completeInput, { dataset: expiredDataset })).toThrow("expired");
  });

  it("applies status priority: missing information before hard exclusions, then complex cases", () => {
    const missingBeforeExclusion = evaluateHealthcareAllowance(
      {
        ...completeInput,
        age: 17,
        partnerStatus: "unknown",
      },
      dataset,
    );
    expect(missingBeforeExclusion.status).toBe("insufficient-information");
    expect(missingBeforeExclusion.hardExclusion).toBe(true);
    expect(missingBeforeExclusion.reasonCodes).toEqual(
      expect.arrayContaining(["missing-partner-status", "healthcare-under-minimum-age"]),
    );

    const complex = evaluateHealthcareAllowance(
      {
        ...completeInput,
        foreignOrResidenceSituation: true,
      },
      dataset,
    );
    expect(complex.status).toBe("official-calculation-recommended");
    expect(complex.uncertaintyCodes).toContain("foreign-or-residence-status");
  });

  it("does not silently clamp technically invalid numbers", () => {
    const healthcare = evaluateHealthcareAllowance(
      { ...completeInput, assessmentIncome: -1 },
      dataset,
    );
    const rent = evaluateRentAllowance(
      { ...completeInput, rent: { ...completeInput.rent, basicRent: Number.NaN } },
      dataset,
    );

    expect(healthcare.status).toBe("insufficient-information");
    expect(healthcare.reasonCodes).toContain("invalid-negative-input");
    expect(healthcare.missingFields).toContain("assessmentIncome");
    expect(rent.reasonCodes).toContain("invalid-non-finite-input");
    expect(rent.missingFields).toContain("rent.basicRent");
  });
});

describe("healthcare allowance 2026", () => {
  it("requires age, partner, income, assets and insurance status", () => {
    const healthcare = evaluateHealthcareAllowance({ year: 2026 }, dataset);

    expect(healthcare.status).toBe("insufficient-information");
    expect(healthcare.missingFields).toEqual(
      expect.arrayContaining([
        "age",
        "partnerStatus",
        "assessmentIncome",
        "assets",
        "healthcare.hasDutchHealthInsurance",
      ]),
    );
    expect(healthcare.reasonCodes).toContain("healthcare-missing-insurance");
  });

  it("handles age and insurance hard exclusions only when known", () => {
    expect(
      evaluateHealthcareAllowance({ ...completeInput, age: 17 }, dataset).reasonCodes,
    ).toContain("healthcare-under-minimum-age");
    expect(
      evaluateHealthcareAllowance(
        { ...completeInput, healthcare: { hasDutchHealthInsurance: false } },
        dataset,
      ).reasonCodes,
    ).toContain("healthcare-no-dutch-insurance");
    expect(
      evaluateHealthcareAllowance(
        { ...completeInput, healthcare: { hasDutchHealthInsurance: "unknown" } },
        dataset,
      ).status,
    ).toBe("insufficient-information");
  });

  it("uses exact 2026 single and partner income and asset boundaries", () => {
    expect(
      evaluateHealthcareAllowance(
        {
          ...completeInput,
          assessmentIncome: 40_857,
          assets: 146_011,
        },
        dataset,
      ).status,
    ).toBe("possible");
    expect(
      evaluateHealthcareAllowance(
        {
          ...completeInput,
          assessmentIncome: 40_858,
        },
        dataset,
      ).reasonCodes,
    ).toContain("healthcare-income-above-limit");
    expect(
      evaluateHealthcareAllowance(
        {
          ...completeInput,
          partnerStatus: "yes",
          jointAssessmentIncome: 51_142,
          jointAssets: 184_633,
        },
        dataset,
      ).status,
    ).toBe("possible");
    expect(
      evaluateHealthcareAllowance(
        {
          ...completeInput,
          partnerStatus: "yes",
          jointAssessmentIncome: 51_143,
          jointAssets: 184_634,
        },
        dataset,
      ).reasonCodes,
    ).toEqual(
      expect.arrayContaining([
        "healthcare-income-above-limit",
        "healthcare-assets-above-limit",
      ]),
    );
  });
});

describe("rent allowance 2026", () => {
  it("requires the cautious rent signal fields", () => {
    const rent = evaluateRentAllowance({ year: 2026 }, dataset);

    expect(rent.status).toBe("insufficient-information");
    expect(rent.missingFields).toEqual(
      expect.arrayContaining([
        "partnerStatus",
        "assessmentIncome",
        "assets",
        "rent.tenure",
        "rent.independentHome",
        "rent.basicRent",
        "rent.hasCoResidents",
      ]),
    );
  });

  it("rejects only clear hard exclusions and does not use high rent as hard negative", () => {
    expect(
      evaluateRentAllowance(
        { ...completeInput, rent: { ...completeInput.rent, tenure: "owner" } },
        dataset,
      ).reasonCodes,
    ).toContain("rent-not-renting");
    expect(
      evaluateRentAllowance(
        { ...completeInput, rent: { ...completeInput.rent, independentHome: false } },
        dataset,
      ).reasonCodes,
    ).toContain("rent-not-independent-home");

    const highRent = evaluateRentAllowance(
      { ...completeInput, rent: { ...completeInput.rent, basicRent: 2_000 } },
      dataset,
    );
    expect(highRent.hardExclusion).toBe(false);
    expect(highRent.reasonCodes).not.toContain("rent-assets-above-limit");
    expect(highRent.status).toBe("official-calculation-recommended");
  });

  it("checks rent asset limits and marks co-residents as complex", () => {
    expect(
      evaluateRentAllowance({ ...completeInput, assets: 38_480 }, dataset)
        .reasonCodes,
    ).toContain("rent-assets-above-limit");

    const coResidents = evaluateRentAllowance(
      {
        ...completeInput,
        rent: {
          ...completeInput.rent,
          hasCoResidents: true,
          householdIncome: 42_000,
          householdAssets: 20_000,
        },
      },
      dataset,
    );
    expect(coResidents.status).toBe("official-calculation-recommended");
    expect(coResidents.reasonCodes).toContain("rent-household-complex");
  });
});

describe("child budget 2026", () => {
  it("requires children, child benefit, residence, partner, income and assets", () => {
    const childBudget = evaluateChildBudgetAllowance({ year: 2026 }, dataset);

    expect(childBudget.status).toBe("insufficient-information");
    expect(childBudget.missingFields).toEqual(
      expect.arrayContaining([
        "children.hasChildren",
        "children.receivesChildBenefit",
        "children.childLivesWithApplicant",
        "partnerStatus",
        "assessmentIncome",
        "assets",
      ]),
    );
  });

  it("uses only hard child and asset exclusions", () => {
    expect(
      evaluateChildBudgetAllowance(
        { ...completeInput, childBudget: { ...completeInput.childBudget, hasChildren: false } },
        dataset,
      ).reasonCodes,
    ).toContain("child-budget-no-children");
    expect(
      evaluateChildBudgetAllowance(
        { ...completeInput, childBudget: { ...completeInput.childBudget, childAges: [18] } },
        dataset,
      ).reasonCodes,
    ).toContain("child-budget-no-child-under-18");
    expect(
      evaluateChildBudgetAllowance(
        { ...completeInput, childBudget: { ...completeInput.childBudget, receivesChildBenefit: false } },
        dataset,
      ).reasonCodes,
    ).toContain("child-budget-no-child-benefit");
    expect(
      evaluateChildBudgetAllowance({ ...completeInput, assets: 146_012 }, dataset)
        .reasonCodes,
    ).toContain("child-budget-assets-above-limit");
  });

  it("does not hard reject child benefit or residence exceptions that require official review", () => {
    const childBenefitException = evaluateChildBudgetAllowance(
      {
        ...completeInput,
        childBudget: {
          ...completeInput.childBudget,
          childAges: [16],
          receivesChildBenefit: false,
        },
      },
      dataset,
    );
    const residenceException = evaluateChildBudgetAllowance(
      {
        ...completeInput,
        childBudget: {
          ...completeInput.childBudget,
          childLivesWithApplicant: false,
        },
      },
      dataset,
    );

    expect(childBenefitException.hardExclusion).toBe(false);
    expect(childBenefitException.status).toBe("official-calculation-recommended");
    expect(childBenefitException.reasonCodes).toContain("child-budget-family-complex");
    expect(childBenefitException.uncertaintyCodes).toContain("child-benefit-exception");
    expect(residenceException.hardExclusion).toBe(false);
    expect(residenceException.status).toBe("official-calculation-recommended");
    expect(residenceException.reasonCodes).toContain("child-budget-child-residence-excluded");
    expect(residenceException.uncertaintyCodes).toContain("child-benefit-exception");
  });

  it("routes complete and complex child budget cases to official calculation", () => {
    const standard = evaluateChildBudgetAllowance(completeInput, dataset);
    const complex = evaluateChildBudgetAllowance(
      {
        ...completeInput,
        childBudget: { ...completeInput.childBudget, coParenting: true },
      },
      dataset,
    );

    expect(standard.status).toBe("official-calculation-recommended");
    expect(standard.reasonCodes).toContain("child-budget-possible");
    expect(complex.uncertaintyCodes).toContain("co-parenting");
    expect(complex.reasonCodes).toContain("child-budget-family-complex");
  });
});

describe("childcare allowance 2026", () => {
  it("requires all core childcare fields and conditional partner activity", () => {
    const childcare = evaluateChildcareAllowance(
      { year: 2026, partnerStatus: "yes" },
      dataset,
    );

    expect(childcare.status).toBe("insufficient-information");
    expect(childcare.missingFields).toEqual(
      expect.arrayContaining([
        "children.hasChildren",
        "childcare.usesChildcare",
        "childcare.registeredChildcare",
        "childcare.paysOwnContribution",
        "childcare.childLivesWithApplicant",
        "childcare.applicantHasQualifyingActivity",
        "childcare.partnerHasQualifyingActivity",
        "childcare.hoursPerMonth",
      ]),
    );
  });

  it("uses hard exclusions for childcare basics and activities", () => {
    expect(
      evaluateChildcareAllowance(
        { ...completeInput, childcare: { ...completeInput.childcare, hasChildren: false } },
        dataset,
      ).reasonCodes,
    ).toContain("childcare-no-children");
    expect(
      evaluateChildcareAllowance(
        { ...completeInput, childcare: { ...completeInput.childcare, usesChildcare: false } },
        dataset,
      ).reasonCodes,
    ).toContain("childcare-no-care");
    expect(
      evaluateChildcareAllowance(
        { ...completeInput, childcare: { ...completeInput.childcare, registeredChildcare: false } },
        dataset,
      ).reasonCodes,
    ).toContain("childcare-care-not-registered");
    expect(
      evaluateChildcareAllowance(
        { ...completeInput, childcare: { ...completeInput.childcare, paysOwnContribution: false } },
        dataset,
      ).reasonCodes,
    ).toContain("childcare-no-own-contribution");
    expect(
      evaluateChildcareAllowance(
        { ...completeInput, childcare: { ...completeInput.childcare, childLivesWithApplicant: false } },
        dataset,
      ).reasonCodes,
    ).toContain("childcare-child-residence-excluded");
    expect(
      evaluateChildcareAllowance(
        { ...completeInput, childcare: { ...completeInput.childcare, applicantHasQualifyingActivity: false } },
        dataset,
      ).reasonCodes,
    ).toContain("childcare-no-qualifying-activity");
  });

  it("checks partner activity and routes complete cases to official calculation", () => {
    const partnerNoActivity = evaluateChildcareAllowance(
      {
        ...completeInput,
        partnerStatus: "yes",
        childcare: {
          ...completeInput.childcare,
          partnerHasQualifyingActivity: false,
        },
      },
      dataset,
    );
    const possible = evaluateChildcareAllowance(completeInput, dataset);

    expect(partnerNoActivity.reasonCodes).toContain(
      "childcare-partner-no-qualifying-activity",
    );
    expect(possible.status).toBe("official-calculation-recommended");
    expect(possible.reasonCodes).toContain("childcare-possible");
    expect(possible.uncertaintyCodes).toContain(
      "childcare-amount-engine-not-implemented",
    );
  });
});

describe("allowance signal dataset", () => {
  it("is active, fresh and registered with official 2026 values", () => {
    expect(dataset.meta.id).toBe("allowance-signal-rules-2026");
    expect(dataset.meta.status).toBe("active");
    expect(dataset.meta.sourceType).toBe("official-execution");
    expect(dataset.data.healthcare.maxIncomeSingle).toBe(40_857);
    expect(dataset.data.healthcare.maxAssetsWithPartner).toBe(184_633);
    expect(dataset.data.rent.cappedRentThreshold).toBe(932.93);
    expect(dataset.data.childcare.maxHoursPerMonth).toBe(230);
    expect(getDatasetFreshness(dataset, "2026-07-19").status).toBe("fresh");
    expect(SOURCE_DATASET_REGISTRY.some((item) => item.meta.id === dataset.meta.id)).toBe(true);
  });

  it("deduplicates source references and exposes official links for future UI/PDF", () => {
    const healthcare = result("healthcare");

    expect(healthcare?.sourceReferences.map((source) => source.sourceUrl)).toEqual(
      Array.from(new Set(healthcare?.sourceReferences.map((source) => source.sourceUrl))),
    );
    expect(healthcare?.sourceReferences.map((source) => source.label)).toEqual(
      expect.arrayContaining([
        "Zorgtoeslag voorwaarden",
        "Zorgtoeslag inkomensgrenzen",
        "Officiele proefberekening",
        "Toeslag aanvragen",
      ]),
    );
  });
});
