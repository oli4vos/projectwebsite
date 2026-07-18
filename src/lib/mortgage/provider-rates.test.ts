import { describe, expect, it } from "vitest";

import {
  calculateMortgageProviderRateAverage,
  TEN_YEAR_ANNUITY_100_PERCENT_MARKET_VALUE_REFERENCE_SCENARIO,
} from "@/lib/mortgage/provider-rates";
import type {
  MortgageProviderRateDataset,
  MortgageProviderRateRecord,
} from "@/lib/mortgage/provider-rates";
import type { SourceDataset, SourceDatasetMeta } from "@/lib/financial-constants";

const baseMeta: SourceDatasetMeta = {
  recordType: "dataset",
  id: "mortgage-provider-rates-test-2026-07-18",
  title: "Test hypotheekrentes grootbanken 10 jaar annuitair 100 procent marktwaarde",
  year: 2026,
  version: "1.0.0",
  effectiveFrom: "2026-07-18",
  effectiveTo: "2026-07-24",
  retrievedAt: "2026-07-18",
  lastVerifiedAt: "2026-07-18",
  nextReviewAt: "2026-07-24",
  sourceName: "Test providerdata",
  sourceUrl: "https://example.com/provider-rates",
  sourceType: "provider-data",
  methodology:
    "Handmatig genormaliseerde testdataset voor vergelijkbare annuiteitenrentes zonder kortingen.",
  methodologyType: "provider-value",
  status: "active",
};

function provider(
  providerId: string,
  annualRatePercent: number | undefined,
  overrides: Partial<MortgageProviderRateRecord> = {},
): MortgageProviderRateRecord {
  return {
    providerId,
    providerName: providerId,
    annualRatePercent,
    mortgageType: "annuity",
    fixedRatePeriodYears: 10,
    ltvClass: "100-market-value",
    hasNhg: false,
    discounts: {
      temporaryAction: false,
      houseBank: false,
      sustainability: false,
      otherPersonal: false,
    },
    sourceUrl: `https://example.com/${providerId}`,
    retrievedAt: "2026-07-18",
    lastVerifiedAt: "2026-07-18",
    status: "valid",
    ...overrides,
  };
}

function dataset(
  providers: MortgageProviderRateRecord[],
  meta: SourceDatasetMeta = baseMeta,
): SourceDataset<MortgageProviderRateDataset> {
  return {
    family: "mortgage-provider-rate",
    scenario: "10y-annuity-100-market-value-no-nhg",
    meta,
    data: {
      referenceScenario:
        TEN_YEAR_ANNUITY_100_PERCENT_MARKET_VALUE_REFERENCE_SCENARIO,
      providers,
    },
    usedBy: ["mortgage-calculator"],
  };
}

describe("mortgage provider rate average", () => {
  it("calculates a complete average for comparable grootbank records", () => {
    const result = calculateMortgageProviderRateAverage(
      dataset([
        provider("abn-amro", 4.21),
        provider("ing", 4.27),
        provider("rabobank", 4.32),
      ]),
    );

    expect(result.status).toBe("complete");
    expect(result.averageAnnualRatePercent).toBeCloseTo(4.2667, 4);
    expect(result.precisionAnnualRatePercent).toBeCloseTo(4.2667, 4);
    expect(result.includedProviders).toEqual(["abn-amro", "ing", "rabobank"]);
    expect(result.sourceReferences[0].methodologyType).toBe("provider-value");
  });

  it("does not publish an average when a required provider is missing", () => {
    const result = calculateMortgageProviderRateAverage(
      dataset([provider("abn-amro", 4.21), provider("ing", 4.27)]),
    );

    expect(result.status).toBe("partial");
    expect(result.averageAnnualRatePercent).toBeNull();
    expect(result.precisionAnnualRatePercent).toBeCloseTo(4.24, 2);
    expect(result.missingProviders).toContain("rabobank");
    expect(result.warnings).toContain("too-few-provider-records");
  });

  it("excludes non-comparable NHG, LTV and discount scenarios", () => {
    const result = calculateMortgageProviderRateAverage(
      dataset([
        provider("abn-amro", 4.21),
        provider("ing", 4.27, { ltvClass: "nhg", hasNhg: true }),
        provider("rabobank", 4.32, {
          discounts: {
            temporaryAction: false,
            houseBank: true,
            sustainability: false,
            otherPersonal: false,
          },
        }),
      ]),
    );

    expect(result.status).toBe("partial");
    expect(result.includedProviders).toEqual(["abn-amro"]);
    expect(result.excludedProviders.map((item) => item.reason)).toEqual([
      "wrong-scenario",
      "wrong-scenario",
    ]);
  });

  it("keeps stale or expired provider records out of the reference average", () => {
    const result = calculateMortgageProviderRateAverage(
      dataset([
        provider("abn-amro", 4.21),
        provider("ing", 4.27, { status: "stale" }),
        provider("rabobank", undefined),
      ]),
    );

    expect(result.status).toBe("partial");
    expect(result.excludedProviders).toEqual([
      { providerId: "ing", reason: "stale" },
      { providerId: "rabobank", reason: "missing-rate" },
    ]);
  });

  it("marks legally current but review-overdue datasets as partial", () => {
    const staleMeta: SourceDatasetMeta = {
      ...baseMeta,
      id: "mortgage-provider-rates-stale-test",
      effectiveTo: "2026-12-31",
      retrievedAt: "2026-07-01",
      lastVerifiedAt: "2026-07-01",
      nextReviewAt: "2026-07-08",
    };

    const result = calculateMortgageProviderRateAverage(
      dataset(
        [
          provider("abn-amro", 4.21),
          provider("ing", 4.27),
          provider("rabobank", 4.32),
        ],
        staleMeta,
      ),
      { asOf: "2026-07-18" },
    );

    expect(result.status).toBe("partial");
    expect(result.averageAnnualRatePercent).toBeNull();
    expect(result.freshnessStatus).toBe("stale");
    expect(result.warnings).toContain("dataset-stale");
  });
});
