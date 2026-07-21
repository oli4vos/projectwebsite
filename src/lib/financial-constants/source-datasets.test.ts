import { describe, expect, it } from "vitest";
import { buildSourceDataOverviewMarkdown } from "../../../scripts/source-data-overview";
import {
  getActiveDataset,
  getDatasetForDate,
  getDatasetFreshness,
  getSourceReferences,
  SOURCE_DATASET_REGISTRY,
  validateDatasetRegistry,
  validateSourceDatasetMeta,
} from "@/lib/financial-constants/source-datasets";
import type { SourceDataset, SourceDatasetMeta } from "@/lib/financial-constants/types";
import {
  getDuoRateForRule,
  getMortgageAfmTestRateForQuarter,
  getMortgageFinancingLoadRatio,
  getMortgageNhgRules,
} from "@/lib/financial-constants";
import { calculateStatutoryDuoMonthlyPayment } from "@/lib/duo";
import { calculateIndicativeMaxMortgage } from "@/lib/mortgage";

const validMeta: SourceDatasetMeta = {
  recordType: "dataset",
  id: "test-official-dataset-2026",
  title: "Test officiële dataset 2026",
  year: 2026,
  version: "1.0.0",
  effectiveFrom: "2026-01-01",
  effectiveTo: "2026-12-31",
  publishedAt: "2025-10-31",
  retrievedAt: "2026-07-18",
  lastVerifiedAt: "2026-07-18",
  nextReviewAt: "2026-11-15",
  sourceName: "Testbron",
  sourceUrl: "https://example.com/source",
  sourceType: "law",
  methodology: "Officieel testrecord voor brondata-validatie zonder productiewaarden.",
  methodologyType: "official-norm",
  status: "active",
};

function withMeta(meta: SourceDatasetMeta): SourceDataset {
  return {
    family: "mortgage-nhg",
    scenario: "test",
    meta,
    data: {
      meta: {
        sourceLabel: "Test",
        lastChecked: "2026-07-18",
        status: "definitief",
        sourceUrl: "https://example.com/source",
        sourceTier: "overheidsuitleg",
      },
      standardLimit: 470_000,
      withEnergyMeasuresLimit: 498_200,
      guaranteeFeePercent: 0.4,
    },
    usedBy: ["test-tool"],
  };
}

describe("source dataset registry", () => {
  it("accepts a valid metadata record", () => {
    expect(validateSourceDatasetMeta(validMeta)).toEqual([]);
  });

  it("fails when sourceUrl is missing", () => {
    const issues = validateSourceDatasetMeta({ ...validMeta, sourceUrl: "" });

    expect(issues.some((issue) => issue.severity === "error" && issue.message.includes("bron-URL"))).toBe(true);
  });

  it("fails when effectiveFrom is missing or invalid", () => {
    const issues = validateSourceDatasetMeta({ ...validMeta, effectiveFrom: "" });

    expect(issues.some((issue) => issue.severity === "error" && issue.message.includes("effectiveFrom"))).toBe(true);
  });

  it("fails on invalid date order", () => {
    const issues = validateSourceDatasetMeta({
      ...validMeta,
      effectiveFrom: "2026-12-31",
      effectiveTo: "2026-01-01",
    });

    expect(issues.some((issue) => issue.message.includes("effectiveTo"))).toBe(true);
  });

  it("fails when two active datasets overlap for the same family and scenario", () => {
    const first = withMeta({ ...validMeta, id: "test-overlap-one" });
    const second = withMeta({ ...validMeta, id: "test-overlap-two" });
    const result = validateDatasetRegistry([first, second]);

    expect(result.ok).toBe(false);
    expect(result.errors.some((issue) => issue.message.includes("Meerdere actieve datasets"))).toBe(true);
  });

  it("selects the active year and peildatum for a registered dataset", () => {
    const dataset = getActiveDataset("mortgage-nhg", {
      scenario: "standard-and-energy-measures",
      asOf: "2026-07-18",
    });

    expect(dataset.meta.id).toBe("mortgage-nhg-2026");
    expect(dataset.meta.year).toBe(2026);
  });

  it("selects by peildatum and rejects missing active periods", () => {
    expect(
      getDatasetForDate("mortgage-afm-test-rate", "2026-07-18", {
        scenario: "short-fixed-rate-2026-q3",
      }).meta.id,
    ).toBe("mortgage-afm-test-rate-2026-q3");

    expect(() =>
      getDatasetForDate("mortgage-afm-test-rate", "2026-12-01", {
        scenario: "short-fixed-rate-2026-q3",
      }),
    ).toThrow("Geen actieve brondata");
  });

  it("handles future, expired and archived datasets distinctly", () => {
    const future = withMeta({
      ...validMeta,
      id: "test-future-dataset",
      effectiveFrom: "2027-01-01",
      effectiveTo: "2027-12-31",
      status: "future",
    });
    const expired = withMeta({
      ...validMeta,
      id: "test-expired-dataset",
      effectiveFrom: "2025-01-01",
      effectiveTo: "2025-12-31",
      status: "expired",
    });
    const archived = withMeta({
      ...validMeta,
      id: "test-archived-dataset",
      status: "archived",
    });

    expect(getDatasetFreshness(future).status).toBe("future");
    expect(getDatasetFreshness(expired).status).toBe("expired");
    expect(getDatasetFreshness(archived).status).toBe("archived");
  });

  it("reports review-due and stale freshness separately from legal validity", () => {
    const reviewDue = withMeta({
      ...validMeta,
      id: "test-review-due",
      nextReviewAt: "2026-07-25",
    });
    const stale = withMeta({
      ...validMeta,
      id: "test-stale",
      lastVerifiedAt: "2025-01-01",
      retrievedAt: "2025-01-01",
      nextReviewAt: "2025-11-15",
    });

    expect(getDatasetFreshness(reviewDue).status).toBe("review-due");
    expect(getDatasetFreshness(stale).status).toBe("stale");
  });

  it("fails dataset-specific validation for impossible bounds", () => {
    const invalidNhg = withMeta({ ...validMeta, id: "test-invalid-nhg" });
    invalidNhg.data = {
      ...(invalidNhg.data as Record<string, unknown>),
      standardLimit: 470_000,
      withEnergyMeasuresLimit: 460_000,
    };

    const result = validateDatasetRegistry([invalidNhg]);

    expect(result.ok).toBe(false);
    expect(result.errors.some((issue) => issue.message.includes("NHG"))).toBe(true);
  });

  it("validates mortgage provider-rate datasets before they can be registered", () => {
    const providerDataset: SourceDataset = {
      family: "mortgage-provider-rate",
      scenario: "10y-annuity-100-market-value-no-nhg",
      meta: {
        ...validMeta,
        id: "test-provider-rates",
        sourceType: "provider-data",
        methodologyType: "provider-value",
        nextReviewAt: "2026-07-24",
      },
      data: {
        providers: [
          {
            providerId: "abn-amro",
            annualRatePercent: 99,
            mortgageType: "unknown",
            fixedRatePeriodYears: 10,
            ltvClass: "unknown",
            hasNhg: false,
            sourceUrl: "http://example.com/provider",
            retrievedAt: "2026-07-18",
            lastVerifiedAt: "2026-07-18",
            status: "valid",
          },
        ],
      },
      usedBy: ["test-tool"],
    };

    const result = validateDatasetRegistry([providerDataset]);

    expect(result.ok).toBe(false);
    expect(result.errors.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        "Provider-rente valt buiten de verwachte bandbreedte.",
        "Provider-renterecord mist een https-bron-URL.",
        "Provider-renterecord is niet als vergelijkbaar scenario genormaliseerd.",
      ]),
    );
  });

  it("validates allowance signal datasets structurally while they remain signal-only", () => {
    const allowanceDataset: SourceDataset = {
      family: "allowance-signal-rules",
      scenario: "signal-only",
      meta: {
        ...validMeta,
        id: "test-allowance-signals",
        sourceType: "official-execution",
        methodologyType: "official-norm",
      },
      data: {
        year: 2026,
        healthcare: {
          maxIncomeSingle: 50_000,
          maxIncomeWithPartner: 40_000,
          officialCalculationUrl: "http://example.com/toeslagen",
        },
        rent: { officialCalculationUrl: "https://example.com/toeslagen" },
        childBudget: { officialCalculationUrl: "https://example.com/toeslagen" },
        childcare: { officialCalculationUrl: "https://example.com/toeslagen" },
      },
      usedBy: ["test-tool"],
    };

    const result = validateDatasetRegistry([allowanceDataset]);

    expect(result.ok).toBe(false);
    expect(result.errors.map((issue) => issue.message)).toEqual(
      expect.arrayContaining([
        "Toeslagensectie healthcare mist een https-URL voor officialCalculationUrl.",
        "Zorgtoeslag partner-inkomensgrens ligt onder de alleenstaande grens.",
      ]),
    );
  });

  it("registers prepared official 2026 allowance calculation rules without activating UI calculations", () => {
    const dataset = getActiveDataset("allowance-calculation-rules", {
      scenario: "official-2026-prepared",
      asOf: "2026-07-20",
    });
    const data = dataset.data as {
      year: number;
      healthcare: {
        maxIncomeSingle: { value: number; officialSourceUrl: string };
        monthlyTableSingle: Array<{ incomeUpTo: number; monthlyAmount: number }>;
        monthlyTableWithPartner: Array<{ incomeUpTo: number; monthlyAmount: number }>;
      };
      rent: { blockers: readonly string[] };
      childBudget: { blockers: readonly string[] };
      childcare: {
        maxHourlyRateDaycare: { value: number; officialSourceUrl: string };
        blockers: readonly string[];
      };
    };

    expect(dataset.meta.id).toBe("allowance-calculation-rules-2026");
    expect(dataset.meta.effectiveFrom).toBe("2026-01-01");
    expect(dataset.meta.effectiveTo).toBe("2026-12-31");
    expect(dataset.usedBy).toEqual(["allowances-calculation-guardian-preparation"]);
    expect(data.year).toBe(2026);
    expect(data.healthcare.maxIncomeSingle.value).toBe(40_857);
    expect(data.healthcare.maxIncomeSingle.officialSourceUrl).toContain("belastingdienst.nl");
    expect(data.healthcare.monthlyTableSingle[0]).toEqual({ incomeUpTo: 29_500, monthlyAmount: 129 });
    expect(data.healthcare.monthlyTableWithPartner.at(-1)).toEqual({ incomeUpTo: 51_500, monthlyAmount: 0 });
    expect(data.childcare.maxHourlyRateDaycare.value).toBe(11.23);
    expect(data.childcare.maxHourlyRateDaycare.officialSourceUrl).toContain("belastingdienst.nl");
    expect(data.rent.blockers.length).toBeGreaterThan(0);
    expect(data.childBudget.blockers.length).toBeGreaterThan(0);
    expect(data.childcare.blockers.length).toBeGreaterThan(0);
  });

  it("registers prepared official 2026 DUO additional grant rules without public integration", () => {
    const dataset = getActiveDataset("duo-additional-grant-rules", {
      scenario: "official-2026-prepared",
      asOf: "2026-07-20",
    });
    const data = dataset.data as {
      year: number;
      referenceYear: { standardReferenceYear: { value: number } };
      referenceYearChange: { minimumIncomeDropPercent: { value: number } };
      amounts: {
        mbo: {
          maximumLivingAtHome: { value: number; officialSourceUrl: string };
          maximumLivingAway: { value: number };
          parentalContributionTaperPercent: { value: number; verificationStatus: string };
        };
        hboUniversity: {
          maximum: { value: number; officialSourceUrl: string };
          maximumGrantParentIncomeThreshold: { value: number };
          parentalContributionTaperPercent: { value: number; verificationStatus: string };
        };
      };
      typedResultContract: { statuses: readonly string[] };
      testVectors: readonly unknown[];
      blockers: readonly string[];
    };

    expect(dataset.meta.id).toBe("duo-additional-grant-rules-2026");
    expect(dataset.usedBy).toEqual(["duo-additional-grant-scan-preparation"]);
    expect(data.year).toBe(2026);
    expect(data.referenceYear.standardReferenceYear.value).toBe(2024);
    expect(data.referenceYearChange.minimumIncomeDropPercent.value).toBe(15);
    expect(data.amounts.mbo.maximumLivingAtHome.value).toBe(438.08);
    expect(data.amounts.mbo.maximumLivingAway.value).toBe(466.4);
    expect(data.amounts.mbo.maximumLivingAtHome.officialSourceUrl).toContain("duo.nl");
    expect(data.amounts.mbo.parentalContributionTaperPercent.value).toBe(26);
    expect(data.amounts.mbo.parentalContributionTaperPercent.verificationStatus).toBe("verified");
    expect(data.amounts.hboUniversity.maximum.value).toBe(491.08);
    expect(data.amounts.hboUniversity.maximumGrantParentIncomeThreshold.value).toBe(41_500.6);
    expect(data.amounts.hboUniversity.parentalContributionTaperPercent.value).toBe(13.6);
    expect(data.typedResultContract.statuses).toContain("special-case");
    expect(data.testVectors.length).toBeGreaterThanOrEqual(6);
    expect(data.blockers.length).toBeGreaterThan(0);
  });

  it("generates a source inventory from the registry", () => {
    const markdown = buildSourceDataOverviewMarkdown(SOURCE_DATASET_REGISTRY);

    expect(markdown).toContain("| Dataset-id | Titel | Jaar |");
    expect(markdown).toContain("mortgage-financing-load-2026");
    expect(markdown).toContain("duo-rate-year-2026");
    expect(markdown).toContain("duo-additional-grant-rules-2026");
    expect(markdown).toContain("allowance-calculation-rules-2026");
  });

  it("exposes a UI-neutral source reference contract", () => {
    const [reference] = getSourceReferences("duo-rate-year", {
      scenario: "sf35-sf15-sf15-old-lllk",
    });

    expect(reference.datasetId).toBe("duo-rate-year-2026");
    expect(reference.sourceUrl).toContain("duo.nl");
    expect(reference.freshnessStatus).toBe("fresh");
  });

  it("validates the production registry without hard failures", () => {
    const result = validateDatasetRegistry();

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("keeps existing central constants values stable", () => {
    expect(getDuoRateForRule("SF35", 2026)).toBe(2.33);
    expect(getMortgageNhgRules(2026).standardLimit).toBe(470_000);
    expect(getMortgageAfmTestRateForQuarter("2026-Q3", 2026).rate).toBe(5);
    expect(
      getMortgageFinancingLoadRatio({
        annualIncome: 55_000,
        mortgageRate: 4.5,
      }),
    ).toBe(23.6);
  });

  it("does not change existing DUO or mortgage outcomes", () => {
    expect(
      calculateStatutoryDuoMonthlyPayment({
        repaymentRule: "SF35",
        remainingDebt: 30_000,
        annualInterestRate: 2.33,
        remainingTermYears: 35,
      }),
    ).toBeCloseTo(104.53, 2);

    const mortgage = calculateIndicativeMaxMortgage({
      grossAnnualHouseholdIncome: 55_000,
      annualMortgageRate: 4.5,
      fixedRatePeriodMonths: 120,
      mortgageTermYears: 30,
      property: {
        propertyValue: 350_000,
        marketValue: 350_000,
        purchasePrice: 350_000,
      },
      liabilities: [],
    });

    expect(mortgage.finalMaxMortgage).toBe(213_479.64);
  });
});
