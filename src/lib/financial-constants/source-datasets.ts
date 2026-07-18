import { DUO_RATE_HISTORY_BY_YEAR, DUO_RATE_YEAR_METADATA_BY_YEAR } from "@/lib/financial-constants/duo-rate-history";
import { MORTGAGE_FINANCING_LOAD_DATA } from "@/lib/financial-constants/mortgage-financing-load-data";
import type {
  AssumptionMeta,
  AnnualFinancialConstants,
  MortgageAfmTestRate,
  SourceDataset,
  SourceDatasetFamily,
  SourceDatasetMeta,
  SourceDatasetMethodologyType,
  SourceDatasetSourceType,
  SourceFreshness,
  SourceReference,
} from "@/lib/financial-constants/types";
import { FINANCIAL_CONSTANTS_BY_YEAR } from "@/lib/financial-constants/years";

export const SOURCE_DATA_REFERENCE_DATE = "2026-07-18";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type SourceValidationSeverity = "error" | "warning";

export type SourceValidationIssue = {
  severity: SourceValidationSeverity;
  datasetId?: string;
  message: string;
};

export type SourceValidationResult = {
  ok: boolean;
  errors: SourceValidationIssue[];
  warnings: SourceValidationIssue[];
};

type SourceReviewPolicy = {
  maxAgeDays: number;
  warningLeadDays: number;
};

const REVIEW_POLICIES: Record<SourceDatasetSourceType, SourceReviewPolicy> = {
  law: { maxAgeDays: 395, warningLeadDays: 45 },
  "official-execution": { maxAgeDays: 395, warningLeadDays: 45 },
  supervisor: { maxAgeDays: 100, warningLeadDays: 21 },
  "norm-publication": { maxAgeDays: 395, warningLeadDays: 45 },
  "provider-data": { maxAgeDays: 7, warningLeadDays: 2 },
  "secondary-source": { maxAgeDays: 90, warningLeadDays: 14 },
  "project-assumption": { maxAgeDays: 365, warningLeadDays: 30 },
};

const SOURCE_TYPES = new Set<SourceDatasetSourceType>([
  "law",
  "official-execution",
  "supervisor",
  "norm-publication",
  "provider-data",
  "secondary-source",
  "project-assumption",
]);

const METHODOLOGY_TYPES = new Set<SourceDatasetMethodologyType>([
  "official-norm",
  "provider-value",
  "secondary-source",
  "project-assumption",
]);

const DATASET_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SEMVER_PATTERN = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/;
const CHECKSUM_PATTERN = /^(?:sha256:)?[a-fA-F0-9]{16,}$/;
const QUARTER_PATTERN = /^\d{4}-Q[1-4]$/;

function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return undefined;
  }

  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp)) {
    return undefined;
  }

  return new Date(timestamp);
}

function compareDate(left: string, right: string) {
  const leftDate = parseDate(left);
  const rightDate = parseDate(right);

  if (!leftDate || !rightDate) {
    return 0;
  }

  return leftDate.getTime() - rightDate.getTime();
}

function daysBetween(left: string, right: string) {
  const leftDate = parseDate(left);
  const rightDate = parseDate(right);

  if (!leftDate || !rightDate) {
    return 0;
  }

  return Math.round((rightDate.getTime() - leftDate.getTime()) / DAY_IN_MS);
}

function isWithinEffectivePeriod(meta: SourceDatasetMeta, asOf: string) {
  const startsOnOrBefore = compareDate(meta.effectiveFrom, asOf) <= 0;
  const endsAfter = meta.effectiveTo === undefined || compareDate(asOf, meta.effectiveTo) <= 0;

  return startsOnOrBefore && endsAfter;
}

function sourceTypeFromTier(sourceTier: AssumptionMeta["sourceTier"]): SourceDatasetSourceType {
  switch (sourceTier) {
    case "wet":
      return "law";
    case "toezicht":
      return "supervisor";
    case "normadvies":
      return "norm-publication";
    case "overheidsuitleg":
      return "official-execution";
    case "praktijk":
      return "secondary-source";
    case "indicatieve-benadering":
    case "projectaanname":
      return "project-assumption";
  }
}

function methodologyTypeFromMeta(meta: AssumptionMeta): SourceDatasetMethodologyType {
  if (meta.ruleType === "projectaanname" || meta.sourceTier === "projectaanname" || meta.sourceTier === "indicatieve-benadering") {
    return "project-assumption";
  }

  if (meta.sourceTier === "praktijk") {
    return "secondary-source";
  }

  return "official-norm";
}

function datasetMetaFromAssumption(input: {
  id: string;
  title: string;
  year?: number;
  version: string;
  meta: AssumptionMeta;
  effectiveFrom?: string;
  effectiveTo?: string;
  retrievedAt?: string;
  nextReviewAt: string;
  sourceName?: string;
  methodology?: string;
  notes?: string;
  status?: SourceDatasetMeta["status"];
}): SourceDatasetMeta {
  return {
    recordType: "dataset",
    id: input.id,
    title: input.title,
    year: input.year,
    version: input.version,
    effectiveFrom: input.effectiveFrom ?? input.meta.validFrom ?? `${input.year ?? 2026}-01-01`,
    effectiveTo: input.effectiveTo ?? input.meta.validUntil,
    publishedAt: input.meta.publishedAt,
    retrievedAt: input.retrievedAt ?? input.meta.lastChecked,
    lastVerifiedAt: input.meta.lastChecked,
    nextReviewAt: input.nextReviewAt,
    sourceName: input.sourceName ?? input.meta.sourceLabel,
    sourceUrl: input.meta.sourceUrl ?? "",
    sourceType: sourceTypeFromTier(input.meta.sourceTier),
    methodology:
      input.methodology ??
      input.meta.appliesTo ??
      input.meta.notes ??
      "Centrale projectdataset op basis van de genoemde bron.",
    methodologyType: methodologyTypeFromMeta(input.meta),
    notes: input.notes ?? input.meta.uncertainties ?? input.meta.notes,
    status: input.status ?? (input.meta.status === "definitief" ? "active" : "active"),
  };
}

function validateFinancingLoadData(data: typeof MORTGAGE_FINANCING_LOAD_DATA) {
  const issues: string[] = [];

  if (data.normYear < 2000 || data.normYear > 2100) {
    issues.push("Financieringslasttabel heeft een ongeldig normjaar.");
  }

  const rateBandCount = data.rateBands.length as number;
  if (rateBandCount === 0) {
    issues.push("Financieringslasttabel mist rentekolommen.");
  }

  for (const group of ["beforeAow", "fromAow"] as const) {
    for (const row of data[group]) {
      if (row.minIncome < 0) {
        issues.push(`Financieringslasttabel bevat negatief inkomen in ${group}.`);
      }
      if (row.percentages.length !== rateBandCount) {
        issues.push(`Financieringslasttabelrij ${row.minIncome} in ${group} matcht rentekolommen niet.`);
      }
      for (const percentage of row.percentages) {
        if (percentage < 0 || percentage > 100) {
          issues.push(`Financieringslastpercentage ${percentage} is onmogelijk.`);
        }
      }
    }
  }

  return issues;
}

function validateDatasetSpecificBounds(dataset: SourceDataset) {
  const issues: string[] = [];

  switch (dataset.family) {
    case "mortgage-financing-load":
      return validateFinancingLoadData(dataset.data as typeof MORTGAGE_FINANCING_LOAD_DATA);
    case "mortgage-nhg": {
      const data = dataset.data as AnnualFinancialConstants["mortgage"]["nhg"];
      if (data.standardLimit <= 0 || data.withEnergyMeasuresLimit < data.standardLimit) {
        issues.push("NHG-grenzen zijn negatief of onderling inconsistent.");
      }
      if (data.guaranteeFeePercent < 0 || data.guaranteeFeePercent > 5) {
        issues.push("NHG-borgtochtprovisie valt buiten de verwachte bandbreedte.");
      }
      break;
    }
    case "mortgage-ltv": {
      const data = dataset.data as AnnualFinancialConstants["mortgage"]["ltv"];
      if (data.baseMaxLtvPercent <= 0 || data.energySavingMeasuresMaxLtvPercent < data.baseMaxLtvPercent) {
        issues.push("LTV-percentages zijn negatief of onderling inconsistent.");
      }
      if (data.energySavingMeasuresAllowanceCapRatio < 0 || data.energySavingMeasuresAllowanceCapRatio > 1) {
        issues.push("LTV-EBV capratio valt buiten 0 tot 1.");
      }
      break;
    }
    case "mortgage-energy-loan-space": {
      const data = dataset.data as AnnualFinancialConstants["mortgage"]["energy"];
      for (const value of Object.values(data.purchaseAllowances)) {
        if (value < 0) {
          issues.push("Energielabelbedragen mogen niet negatief zijn.");
        }
      }
      for (const value of Object.values(data.energySavingMeasureAllowances)) {
        if (value < 0) {
          issues.push("EBV-bedragen mogen niet negatief zijn.");
        }
      }
      break;
    }
    case "mortgage-afm-test-rate": {
      const data = dataset.data as MortgageAfmTestRate;
      if (!QUARTER_PATTERN.test(data.quarter)) {
        issues.push("AFM-toetsrente heeft een ongeldig kwartaal.");
      }
      if (data.rate < 0 || data.rate > 20) {
        issues.push("AFM-toetsrente valt buiten de verwachte bandbreedte.");
      }
      break;
    }
    case "duo-rate-year": {
      const rates = dataset.data as Record<string, number>;
      for (const rate of Object.values(rates)) {
        if (rate < 0 || rate > 20) {
          issues.push("DUO-rente valt buiten de verwachte bandbreedte.");
        }
      }
      break;
    }
    case "duo-borrowing-limits": {
      const data = dataset.data as AnnualFinancialConstants["duo"]["borrowingLimits"];
      if (data.monthlyLoanAmountMax < 0 || data.monthlyLoanAmountStep <= 0) {
        issues.push("DUO-leengrens of sliderstap is ongeldig.");
      }
      break;
    }
    case "allowance-signal-rules":
    case "mortgage-provider-rate":
      break;
  }

  return issues;
}

function createValidationIssue(severity: SourceValidationSeverity, datasetId: string | undefined, message: string): SourceValidationIssue {
  return { severity, datasetId, message };
}

export function validateSourceDatasetMeta(meta: SourceDatasetMeta, asOf = SOURCE_DATA_REFERENCE_DATE): SourceValidationIssue[] {
  const issues: SourceValidationIssue[] = [];
  const addError = (message: string) => issues.push(createValidationIssue("error", meta.id, message));
  const addWarning = (message: string) => issues.push(createValidationIssue("warning", meta.id, message));

  if (!DATASET_ID_PATTERN.test(meta.id)) {
    addError("Dataset-id moet een niet-lege slug zijn.");
  }
  if (meta.title.trim().length === 0) {
    addError("Dataset mist een titel.");
  }
  if (meta.year !== undefined && (!Number.isInteger(meta.year) || meta.year < 2000 || meta.year > 2100)) {
    addError("Datasetjaar valt buiten 2000-2100.");
  }
  if (!SEMVER_PATTERN.test(meta.version)) {
    addError("Datasetversie moet semver zijn.");
  }
  for (const field of ["effectiveFrom", "retrievedAt", "lastVerifiedAt", "nextReviewAt", "publishedAt", "effectiveTo"] as const) {
    const value = meta[field];
    if (value !== undefined && !parseDate(value)) {
      addError(`${field} moet een geldige ISO-datum zijn.`);
    }
  }
  if (meta.sourceUrl.trim().length === 0 || !meta.sourceUrl.startsWith("https://")) {
    addError("Dataset mist een verplichte https-bron-URL.");
  }
  if (!SOURCE_TYPES.has(meta.sourceType)) {
    addError("Dataset heeft een onbekend sourceType.");
  }
  if (!METHODOLOGY_TYPES.has(meta.methodologyType)) {
    addError("Dataset heeft een onbekend methodologyType.");
  }
  if (meta.methodology.trim().length === 0) {
    addError("Dataset mist methodologietekst.");
  } else if (meta.methodology.trim().length < 20) {
    addWarning("Methodologietekst is kort; controleer of de broninterpretatie duidelijk genoeg is.");
  }
  if (meta.effectiveTo && compareDate(meta.effectiveFrom, meta.effectiveTo) >= 0) {
    addError("effectiveTo moet na effectiveFrom liggen.");
  }
  if (meta.publishedAt && compareDate(meta.publishedAt, meta.retrievedAt) > 0) {
    addError("publishedAt mag niet na retrievedAt liggen.");
  }
  if (compareDate(meta.lastVerifiedAt, meta.retrievedAt) < 0) {
    addError("lastVerifiedAt mag niet voor retrievedAt liggen.");
  }
  if (compareDate(meta.lastVerifiedAt, meta.nextReviewAt) >= 0) {
    addError("nextReviewAt moet na lastVerifiedAt liggen.");
  }
  if (meta.status === "active" && meta.effectiveTo && compareDate(meta.effectiveTo, asOf) < 0) {
    addError("Actieve dataset is verlopen.");
  }
  if (meta.status === "future" && compareDate(meta.effectiveFrom, asOf) <= 0) {
    addError("Future dataset moet in de toekomst beginnen.");
  }
  if (meta.status === "archived" && isWithinEffectivePeriod(meta, asOf)) {
    addWarning("Archived dataset valt nog binnen de peildatum; controleer of selectie dit uitsluit.");
  }
  if (meta.checksum !== undefined && !CHECKSUM_PATTERN.test(meta.checksum)) {
    addError("Checksum heeft een ongeldig formaat.");
  }
  if (meta.sourceType === "secondary-source") {
    addWarning("Secundaire bron mag alleen aanvullend zijn naast primaire bronvalidatie.");
  }
  if (meta.checksum === undefined && meta.id.includes("financing-load")) {
    addWarning("Generated dataset mist optionele checksum.");
  }

  const freshness = getDatasetFreshness({ meta } as SourceDataset, asOf);
  if (freshness.status === "review-due" || freshness.status === "stale") {
    addWarning(freshness.message ?? "Dataset moet opnieuw worden gecontroleerd.");
  }

  return issues;
}

export function getDatasetFreshness(dataset: SourceDataset, asOf = SOURCE_DATA_REFERENCE_DATE): SourceFreshness {
  const meta = dataset.meta;

  if (meta.status === "archived") {
    return { status: "archived", checkedAt: asOf, message: "Dataset is gearchiveerd." };
  }
  if (meta.status === "future" || compareDate(meta.effectiveFrom, asOf) > 0) {
    return { status: "future", checkedAt: asOf, message: "Dataset is nog niet geldig." };
  }
  if (meta.status === "expired" || (meta.effectiveTo && compareDate(meta.effectiveTo, asOf) < 0)) {
    return { status: "expired", checkedAt: asOf, message: "Dataset is verlopen." };
  }

  const policy = REVIEW_POLICIES[meta.sourceType];
  const daysUntilReview = daysBetween(asOf, meta.nextReviewAt);
  const daysSinceLastVerified = daysBetween(meta.lastVerifiedAt, asOf);

  if (daysUntilReview < 0 || daysSinceLastVerified > policy.maxAgeDays) {
    return {
      status: "stale",
      checkedAt: asOf,
      daysUntilReview,
      daysSinceLastVerified,
      message: "Dataset is juridisch mogelijk nog geldig, maar operationeel over de reviewtermijn.",
    };
  }

  if (daysUntilReview <= policy.warningLeadDays) {
    return {
      status: "review-due",
      checkedAt: asOf,
      daysUntilReview,
      daysSinceLastVerified,
      message: "Dataset nadert de volgende reviewdatum.",
    };
  }

  return { status: "fresh", checkedAt: asOf, daysUntilReview, daysSinceLastVerified };
}

export function listDatasets(registry: readonly SourceDataset[] = SOURCE_DATASET_REGISTRY) {
  return [...registry].sort((left, right) => left.meta.id.localeCompare(right.meta.id));
}

export function getDatasetForDate(
  family: SourceDatasetFamily,
  asOf = SOURCE_DATA_REFERENCE_DATE,
  options: { scenario?: string; registry?: readonly SourceDataset[] } = {},
) {
  const registry = options.registry ?? SOURCE_DATASET_REGISTRY;
  const matches = registry.filter((dataset) => {
    if (dataset.family !== family) {
      return false;
    }
    if (options.scenario !== undefined && dataset.scenario !== options.scenario) {
      return false;
    }

    return dataset.meta.status === "active" && isWithinEffectivePeriod(dataset.meta, asOf);
  });

  if (matches.length === 0) {
    throw new Error(`Geen actieve brondata gevonden voor ${family} op ${asOf}.`);
  }
  if (matches.length > 1) {
    throw new Error(`Meerdere actieve brondata gevonden voor ${family} op ${asOf}.`);
  }

  return matches[0];
}

export function getActiveDataset(family: SourceDatasetFamily, options: { scenario?: string; asOf?: string } = {}) {
  return getDatasetForDate(family, options.asOf, { scenario: options.scenario });
}

export function getSourceReferences(
  family: SourceDatasetFamily,
  options: { scenario?: string; asOf?: string; registry?: readonly SourceDataset[] } = {},
): SourceReference[] {
  const dataset = getDatasetForDate(family, options.asOf, {
    scenario: options.scenario,
    registry: options.registry,
  });
  const freshness = getDatasetFreshness(dataset, options.asOf);

  return [
    {
      label: dataset.meta.title,
      sourceName: dataset.meta.sourceName,
      sourceUrl: dataset.meta.sourceUrl,
      sourceType: dataset.meta.sourceType,
      referenceDate: dataset.meta.lastVerifiedAt,
      year: dataset.meta.year,
      effectiveFrom: dataset.meta.effectiveFrom,
      effectiveTo: dataset.meta.effectiveTo,
      methodology: dataset.meta.methodology,
      methodologyType: dataset.meta.methodologyType,
      freshnessStatus: freshness.status,
      warning: freshness.status === "fresh" ? undefined : freshness.message,
      datasetId: dataset.meta.id,
      version: dataset.meta.version,
    },
  ];
}

export function validateDatasetRegistry(
  registry: readonly SourceDataset[] = SOURCE_DATASET_REGISTRY,
  asOf = SOURCE_DATA_REFERENCE_DATE,
): SourceValidationResult {
  const issues: SourceValidationIssue[] = [];
  const seenIds = new Set<string>();
  const supersedesIds = new Set(registry.map((dataset) => dataset.meta.id));

  for (const dataset of registry) {
    if (seenIds.has(dataset.meta.id)) {
      issues.push(createValidationIssue("error", dataset.meta.id, "Dataset-id is dubbel geregistreerd."));
    }
    seenIds.add(dataset.meta.id);

    issues.push(...validateSourceDatasetMeta(dataset.meta, asOf));

    if (dataset.meta.supersedes && !supersedesIds.has(dataset.meta.supersedes)) {
      issues.push(createValidationIssue("error", dataset.meta.id, "supersedes verwijst naar een onbekende dataset."));
    }

    for (const message of validateDatasetSpecificBounds(dataset)) {
      issues.push(createValidationIssue("error", dataset.meta.id, message));
    }
  }

  const activeGroups = new Map<string, SourceDataset[]>();
  for (const dataset of registry) {
    if (dataset.meta.status !== "active" || !isWithinEffectivePeriod(dataset.meta, asOf)) {
      continue;
    }

    const key = `${dataset.family}:${dataset.scenario}`;
    activeGroups.set(key, [...(activeGroups.get(key) ?? []), dataset]);
  }

  for (const [key, datasets] of activeGroups) {
    if (datasets.length > 1) {
      issues.push(
        createValidationIssue(
          "error",
          key,
          `Meerdere actieve datasets voor dezelfde familie en scenario: ${datasets.map((dataset) => dataset.meta.id).join(", ")}.`,
        ),
      );
    }
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  return { ok: errors.length === 0, errors, warnings };
}

const constants2026 = FINANCIAL_CONSTANTS_BY_YEAR[2026];

export const SOURCE_DATASET_REGISTRY: readonly SourceDataset[] = [
  {
    family: "mortgage-financing-load",
    scenario: "before-and-from-aow",
    meta: {
      recordType: "dataset",
      id: "mortgage-financing-load-2026",
      title: "Financieringslastpercentages hypotheek 2026",
      year: 2026,
      version: "1.0.0",
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-12-31",
      publishedAt: "2025-10-31",
      retrievedAt: MORTGAGE_FINANCING_LOAD_DATA.lastChecked,
      lastVerifiedAt: "2026-07-18",
      nextReviewAt: "2026-11-15",
      sourceName: MORTGAGE_FINANCING_LOAD_DATA.sourceLabel,
      sourceUrl: MORTGAGE_FINANCING_LOAD_DATA.sourceUrl,
      sourceType: "law",
      methodology: "Gegenereerde tabel uit de Staatscourantregeling; lookup gebeurt centraal per inkomen, rente en AOW-groep.",
      methodologyType: "official-norm",
      notes: "Bronbestand blijft gegenereerd via update-mortgage-financing-load-table en wordt niet handmatig aangepast.",
      status: "active",
    },
    data: MORTGAGE_FINANCING_LOAD_DATA,
    usedBy: ["artifact-hypotheek-wonen-maximale-hypotheek"],
  },
  {
    family: "mortgage-nhg",
    scenario: "standard-and-energy-measures",
    meta: datasetMetaFromAssumption({
      id: "mortgage-nhg-2026",
      title: "NHG-grenzen en borgtochtprovisie 2026",
      year: 2026,
      version: "1.0.0",
      meta: constants2026.mortgage.nhg.meta,
      nextReviewAt: "2026-11-15",
      sourceName: "NHG",
    }),
    data: constants2026.mortgage.nhg,
    usedBy: ["artifact-hypotheek-wonen-maximale-hypotheek"],
  },
  {
    family: "mortgage-ltv",
    scenario: "base-and-energy-saving-measures",
    meta: datasetMetaFromAssumption({
      id: "mortgage-ltv-2026",
      title: "LTV en energiebesparende voorzieningen 2026",
      year: 2026,
      version: "1.0.0",
      meta: constants2026.mortgage.ltv.meta,
      nextReviewAt: "2026-11-15",
      sourceName: "Volkshuisvesting Nederland",
    }),
    data: constants2026.mortgage.ltv,
    usedBy: ["artifact-hypotheek-wonen-maximale-hypotheek"],
  },
  {
    family: "mortgage-energy-loan-space",
    scenario: "income-space-by-energy-label",
    meta: datasetMetaFromAssumption({
      id: "mortgage-energy-loan-space-2026",
      title: "Energielabelbedragen hypotheeknormen 2026",
      year: 2026,
      version: "1.0.0",
      meta: constants2026.mortgage.energy.meta,
      nextReviewAt: "2026-11-15",
      sourceName: "Staatscourant",
    }),
    data: constants2026.mortgage.energy,
    usedBy: ["artifact-hypotheek-wonen-maximale-hypotheek"],
  },
  {
    family: "mortgage-afm-test-rate",
    scenario: "short-fixed-rate-2026-q3",
    meta: datasetMetaFromAssumption({
      id: "mortgage-afm-test-rate-2026-q3",
      title: "AFM-toetsrente Q3 2026",
      year: 2026,
      version: "1.0.0",
      meta: constants2026.mortgage.afmTestRates[0].meta,
      nextReviewAt: "2026-09-15",
      sourceName: "Autoriteit Financiele Markten",
    }),
    data: constants2026.mortgage.afmTestRates[0],
    usedBy: ["artifact-hypotheek-wonen-maximale-hypotheek"],
  },
  {
    family: "duo-rate-year",
    scenario: "sf35-sf15-sf15-old-lllk",
    meta: {
      recordType: "dataset",
      id: "duo-rate-year-2026",
      title: "DUO-rentejaar 2026",
      year: 2026,
      version: "1.0.0",
      effectiveFrom: DUO_RATE_YEAR_METADATA_BY_YEAR[2026].validFrom,
      effectiveTo: DUO_RATE_YEAR_METADATA_BY_YEAR[2026].validUntil,
      publishedAt: DUO_RATE_YEAR_METADATA_BY_YEAR[2026].publishedAt,
      retrievedAt: DUO_RATE_YEAR_METADATA_BY_YEAR[2026].lastChecked,
      lastVerifiedAt: DUO_RATE_YEAR_METADATA_BY_YEAR[2026].lastChecked,
      nextReviewAt: "2026-10-15",
      sourceName: "DUO",
      sourceUrl: DUO_RATE_YEAR_METADATA_BY_YEAR[2026].sourceUrl,
      sourceType: "official-execution",
      methodology: DUO_RATE_YEAR_METADATA_BY_YEAR[2026].appliesWhen,
      methodologyType: "official-norm",
      notes: DUO_RATE_YEAR_METADATA_BY_YEAR[2026].notes,
      status: "active",
    },
    data: DUO_RATE_HISTORY_BY_YEAR[2026],
    usedBy: [
      "duo-maandbedrag",
      "duo-extra-aflossen",
      "duo-leenbedrag-impact",
      "duo-schuld-bij-starten-lenen",
      "duo-stoppen-kosten-prestatiebeurs",
      "hypotheek-impact-studieschuld",
      "familiehulp-eerste-woning",
    ],
  },
  {
    family: "duo-borrowing-limits",
    scenario: "monthly-loan-slider",
    meta: {
      recordType: "dataset",
      id: "duo-borrowing-limits-2026",
      title: "DUO-leengrens reguliere lening 2026",
      year: 2026,
      version: "1.0.0",
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-12-31",
      retrievedAt: "2026-07-18",
      lastVerifiedAt: "2026-07-18",
      nextReviewAt: "2026-11-15",
      sourceName: "DUO",
      sourceUrl: constants2026.duo.borrowingLimits.sourceUrl,
      sourceType: "official-execution",
      methodology: "Reguliere maandelijkse leninglimiet voor de leenfase; collegegeldkrediet blijft apart van deze sliderlimiet.",
      methodologyType: "official-norm",
      notes: constants2026.duo.borrowingLimits.notes,
      status: "active",
    },
    data: constants2026.duo.borrowingLimits,
    usedBy: ["duo-leenbedrag-impact", "duo-schuld-bij-starten-lenen"],
  },
];
