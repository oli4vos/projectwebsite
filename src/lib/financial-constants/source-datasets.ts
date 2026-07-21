import { DUO_RATE_HISTORY_BY_YEAR, DUO_RATE_YEAR_METADATA_BY_YEAR } from "@/lib/financial-constants/duo-rate-history";
import { DUO_ADDITIONAL_GRANT_RULES_2026 } from "@/lib/financial-constants/duo-additional-grant-rules-2026";
import { ALLOWANCE_CALCULATION_RULES_2026 } from "@/lib/financial-constants/allowance-calculation-rules-2026";
import { MORTGAGE_FINANCING_LOAD_DATA } from "@/lib/financial-constants/mortgage-financing-load-data";
import { DEBT_PRIORITY_RULES_2026 } from "@/lib/planning/debt-priority-rules";
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

export const SOURCE_DATA_REFERENCE_DATE = "2026-07-19";

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

function validateMortgageProviderRateDataset(data: unknown) {
  const issues: string[] = [];
  const candidate = data as {
    providers?: Array<{
      providerId?: string;
      annualRatePercent?: number;
      mortgageType?: string;
      fixedRatePeriodYears?: number;
      ltvClass?: string;
      hasNhg?: boolean;
      sourceUrl?: string;
      retrievedAt?: string;
      lastVerifiedAt?: string;
      status?: string;
    }>;
  };

  if (!Array.isArray(candidate.providers) || candidate.providers.length === 0) {
    issues.push("Provider-rentedataset mist providerrecords.");
    return issues;
  }

  for (const record of candidate.providers) {
    if (!record.providerId) {
      issues.push("Provider-renterecord mist providerId.");
    }
    if (record.annualRatePercent !== undefined && (record.annualRatePercent < 0 || record.annualRatePercent > 20)) {
      issues.push("Provider-rente valt buiten de verwachte bandbreedte.");
    }
    if (record.sourceUrl === undefined || !record.sourceUrl.startsWith("https://")) {
      issues.push("Provider-renterecord mist een https-bron-URL.");
    }
    if (record.retrievedAt !== undefined && !parseDate(record.retrievedAt)) {
      issues.push("Provider-renterecord heeft een ongeldige retrievedAt-datum.");
    }
    if (record.lastVerifiedAt !== undefined && !parseDate(record.lastVerifiedAt)) {
      issues.push("Provider-renterecord heeft een ongeldige lastVerifiedAt-datum.");
    }
    if (record.mortgageType === "unknown" || record.ltvClass === "unknown") {
      issues.push("Provider-renterecord is niet als vergelijkbaar scenario genormaliseerd.");
    }
    if (record.status === "valid" && record.annualRatePercent === undefined) {
      issues.push("Geldig provider-renterecord mist een rentepercentage.");
    }
  }

  return issues;
}

function validateAllowanceSignalRulesDataset(data: unknown) {
  const issues: string[] = [];
  const candidate = data as {
    year?: number;
    ruleVersion?: string;
    officialCalculationUrl?: string;
    applicationUrl?: string;
    healthcare?: Record<string, unknown>;
    rent?: Record<string, unknown>;
    childBudget?: Record<string, unknown>;
    childcare?: Record<string, unknown>;
  };

  if (!Number.isInteger(candidate.year) || (candidate.year as number) < 2000 || (candidate.year as number) > 2100) {
    issues.push("Toeslagensignaaldataset heeft een ongeldig jaar.");
  }
  if (typeof candidate.ruleVersion !== "string" || !SEMVER_PATTERN.test(candidate.ruleVersion)) {
    issues.push("Toeslagensignaaldataset mist een geldige ruleVersion.");
  }
  for (const [key, value] of Object.entries({
    officialCalculationUrl: candidate.officialCalculationUrl,
    applicationUrl: candidate.applicationUrl,
  })) {
    if (typeof value !== "string" || !value.startsWith("https://")) {
      issues.push(`Toeslagensignaaldataset mist een https-URL voor ${key}.`);
    }
  }

  for (const [sectionName, section] of Object.entries({
    healthcare: candidate.healthcare,
    rent: candidate.rent,
    childBudget: candidate.childBudget,
    childcare: candidate.childcare,
  })) {
    if (!section) {
      issues.push(`Toeslagensignaaldataset mist sectie ${sectionName}.`);
      continue;
    }

    for (const [key, value] of Object.entries(section)) {
      if (key.endsWith("Url")) {
        if (typeof value !== "string" || !value.startsWith("https://")) {
          issues.push(`Toeslagensectie ${sectionName} mist een https-URL voor ${key}.`);
        }
        continue;
      }
      if (typeof value === "number" && value < 0) {
        issues.push(`Toeslagensectie ${sectionName} bevat een negatieve grenswaarde.`);
      }
    }
  }

  const maxIncomeSingle = candidate.healthcare?.maxIncomeSingle;
  const maxIncomeWithPartner = candidate.healthcare?.maxIncomeWithPartner;
  if (
    typeof maxIncomeSingle === "number" &&
    typeof maxIncomeWithPartner === "number" &&
    maxIncomeWithPartner < maxIncomeSingle
  ) {
    issues.push("Zorgtoeslag partner-inkomensgrens ligt onder de alleenstaande grens.");
  }

  const healthcareAssetsSingle = candidate.healthcare?.maxAssetsSingle;
  const healthcareAssetsWithPartner = candidate.healthcare?.maxAssetsWithPartner;
  if (
    typeof healthcareAssetsSingle === "number" &&
    typeof healthcareAssetsWithPartner === "number" &&
    healthcareAssetsWithPartner < healthcareAssetsSingle
  ) {
    issues.push("Zorgtoeslag partner-vermogensgrens ligt onder de alleenstaande grens.");
  }

  return issues;
}

function validateDuoAdditionalGrantRulesDataset(data: unknown) {
  const issues: string[] = [];
  const candidate = data as {
    year?: number;
    ruleVersion?: string;
    referenceYear?: { standardReferenceYear?: { value?: unknown } };
    referenceYearChange?: { minimumIncomeDropPercent?: { value?: unknown } };
    amounts?: {
      mbo?: { maximumLivingAtHome?: { value?: unknown }; maximumLivingAway?: { value?: unknown } };
      hboUniversity?: { maximum?: { value?: unknown } };
    };
    typedInputContract?: unknown[];
    typedResultContract?: { statuses?: unknown[] };
    testVectors?: unknown[];
    blockers?: unknown[];
  };

  if (candidate.year !== 2026) {
    issues.push("DUO aanvullende-beursdataset moet berekeningsjaar 2026 hebben.");
  }
  if (typeof candidate.ruleVersion !== "string" || !SEMVER_PATTERN.test(candidate.ruleVersion)) {
    issues.push("DUO aanvullende-beursdataset mist een geldige ruleVersion.");
  }
  if (candidate.referenceYear?.standardReferenceYear?.value !== 2024) {
    issues.push("DUO aanvullende-beursdataset moet standaardpeiljaar 2024 voor berekeningsjaar 2026 vastleggen.");
  }
  if (candidate.referenceYearChange?.minimumIncomeDropPercent?.value !== 15) {
    issues.push("DUO peiljaarverlegging moet de 15 procent inkomensdalingsdrempel vastleggen.");
  }
  for (const [label, sourceValue] of Object.entries({
    "mbo thuiswonend": candidate.amounts?.mbo?.maximumLivingAtHome?.value,
    "mbo uitwonend": candidate.amounts?.mbo?.maximumLivingAway?.value,
    "hbo/wo": candidate.amounts?.hboUniversity?.maximum?.value,
  })) {
    if (typeof sourceValue !== "number" || sourceValue <= 0) {
      issues.push(`DUO aanvullende-beursdataset mist positief maximumbedrag voor ${label}.`);
    }
  }
  if (!Array.isArray(candidate.typedInputContract) || candidate.typedInputContract.length === 0) {
    issues.push("DUO aanvullende-beursdataset mist typed inputcontract.");
  }
  if (!Array.isArray(candidate.typedResultContract?.statuses) || candidate.typedResultContract.statuses.length === 0) {
    issues.push("DUO aanvullende-beursdataset mist typed resultaatstatussen.");
  }
  if (!Array.isArray(candidate.testVectors) || candidate.testVectors.length === 0) {
    issues.push("DUO aanvullende-beursdataset mist testvectors.");
  }
  if (!Array.isArray(candidate.blockers) || candidate.blockers.length === 0) {
    issues.push("DUO aanvullende-beursdataset mist expliciete blockers.");
  }

  for (const source of collectAllowanceValueSources(data)) {
    const record = source as Record<string, unknown>;
    if (
      typeof record.officialSourceUrl !== "string" ||
      (!record.officialSourceUrl.startsWith("https://duo.nl/") &&
        !record.officialSourceUrl.startsWith("https://www.duo.nl/"))
    ) {
      issues.push("DUO aanvullende-beursbronwaarde moet naar een officiele DUO-URL verwijzen.");
    }
    if (record.calculationYear !== 2026) {
      issues.push("DUO aanvullende-beursbronwaarde mist berekeningsjaar 2026.");
    }
    if (typeof record.value === "number" && record.value < 0) {
      issues.push("DUO aanvullende-beursbronwaarde mag niet negatief zijn.");
    }
  }

  return issues;
}

function collectAllowanceValueSources(data: unknown) {
  const sources: unknown[] = [];

  function visit(value: unknown) {
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    if (typeof value !== "object" || value === null) {
      return;
    }

    const candidate = value as Record<string, unknown>;
    if (
      typeof candidate.regulationId === "string" &&
      typeof candidate.officialSourceUrl === "string" &&
      typeof candidate.validFrom === "string"
    ) {
      sources.push(candidate);
    }

    for (const nested of Object.values(candidate)) {
      visit(nested);
    }
  }

  visit(data);
  return sources;
}

function validateAllowanceCalculationRulesDataset(data: unknown) {
  const issues: string[] = [];
  const candidate = data as {
    year?: number;
    ruleVersion?: string;
    healthcare?: { monthlyTableSingle?: unknown[]; monthlyTableWithPartner?: unknown[] };
    rent?: { blockers?: unknown[] };
    childBudget?: { blockers?: unknown[] };
    childcare?: { blockers?: unknown[] };
    officialTestVectors?: unknown[];
  };

  if (candidate.year !== 2026) {
    issues.push("Toeslagenberekeningsdataset moet expliciet berekeningsjaar 2026 hebben.");
  }
  if (typeof candidate.ruleVersion !== "string" || !SEMVER_PATTERN.test(candidate.ruleVersion)) {
    issues.push("Toeslagenberekeningsdataset mist een geldige ruleVersion.");
  }

  const valueSources = collectAllowanceValueSources(data);
  if (valueSources.length === 0) {
    issues.push("Toeslagenberekeningsdataset mist machineleesbare bronwaardes.");
  }

  for (const source of valueSources) {
    const record = source as Record<string, unknown>;
    for (const field of [
      "regulationId",
      "calculationYear",
      "value",
      "unit",
      "validFrom",
      "validUntil",
      "reviewedAt",
      "officialSourceTitle",
      "officialSourceUrl",
      "sourceSection",
      "verificationStatus",
      "interpretationNote",
    ] as const) {
      if (record[field] === undefined || record[field] === "") {
        issues.push(`Toeslagenbronwaarde mist ${field}.`);
      }
    }
    if (record.calculationYear !== 2026) {
      issues.push("Toeslagenbronwaarde heeft geen berekeningsjaar 2026.");
    }
    if (typeof record.officialSourceUrl !== "string" || !record.officialSourceUrl.startsWith("https://www.belastingdienst.nl/")) {
      issues.push("Toeslagenbronwaarde moet naar een officiele Belastingdienst/Dienst Toeslagen-URL verwijzen.");
    }
    if (typeof record.value === "number" && record.value < 0) {
      issues.push("Toeslagenbronwaarde mag niet negatief zijn.");
    }
  }

  if (!Array.isArray(candidate.healthcare?.monthlyTableSingle) || candidate.healthcare.monthlyTableSingle.length === 0) {
    issues.push("Zorgtoeslagtabel zonder partner ontbreekt.");
  }
  if (!Array.isArray(candidate.healthcare?.monthlyTableWithPartner) || candidate.healthcare.monthlyTableWithPartner.length === 0) {
    issues.push("Zorgtoeslagtabel met partner ontbreekt.");
  }
  for (const [section, blockers] of Object.entries({
    rent: candidate.rent?.blockers,
    childBudget: candidate.childBudget?.blockers,
    childcare: candidate.childcare?.blockers,
  })) {
    if (!Array.isArray(blockers) || blockers.length === 0) {
      issues.push(`Toeslagenberekeningsdataset mist expliciete blockers voor ${section}.`);
    }
  }
  if (!Array.isArray(candidate.officialTestVectors) || candidate.officialTestVectors.length === 0) {
    issues.push("Toeslagenberekeningsdataset mist officiele testvectors.");
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
    case "mortgage-project-assumptions": {
      const data = dataset.data as AnnualFinancialConstants["mortgage"];
      if (data.defaultMortgageRate < 0 || data.defaultMortgageRate > 20) {
        issues.push("Hypotheek-defaultrente valt buiten de verwachte bandbreedte.");
      }
      if (data.defaultMortgageTermYears <= 0 || data.defaultMortgageTermYears > 40) {
        issues.push("Hypotheek-defaultlooptijd valt buiten de verwachte bandbreedte.");
      }
      if (data.indicativeIncomeHousingCostRatio <= 0 || data.indicativeIncomeHousingCostRatio > 100) {
        issues.push("Indicatieve woonlastratio valt buiten de verwachte bandbreedte.");
      }
      for (const band of data.studentDebtGrossUpFactors) {
        if (band.factor <= 0 || band.factor > 3 || band.minRate < 0) {
          issues.push("Studieschuld-bruteringsfactor valt buiten de verwachte bandbreedte.");
        }
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
    case "duo-repayment-terms": {
      const terms = dataset.data as AnnualFinancialConstants["duo"]["defaultTerms"];
      for (const years of Object.values(terms)) {
        if (!Number.isInteger(years) || years <= 0 || years > 50) {
          issues.push("DUO-terugbetaaltermijn valt buiten de verwachte bandbreedte.");
        }
      }
      break;
    }
    case "duo-income-based-repayment-rules": {
      const rules = dataset.data as AnnualFinancialConstants["duo"]["incomeBasedRules"];
      for (const [rule, data] of Object.entries(rules)) {
        if (data.singleAllowance < 0 || data.partnerOrSingleParentAllowance < data.singleAllowance) {
          issues.push(`DUO-draagkrachtvrije voet is inconsistent voor ${rule}.`);
        }
        if (data.percentage !== null && (data.percentage < 0 || data.percentage > 100)) {
          issues.push(`DUO-draagkrachtpercentage valt buiten de verwachte bandbreedte voor ${rule}.`);
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
    case "duo-additional-grant-rules":
      return validateDuoAdditionalGrantRulesDataset(dataset.data);
    case "allowance-signal-rules":
      return validateAllowanceSignalRulesDataset(dataset.data);
    case "allowance-calculation-rules":
      return validateAllowanceCalculationRulesDataset(dataset.data);
    case "planning-debt-priority-rules": {
      const data = dataset.data as {
        kindBaseScore?: Record<string, number>;
        interestRateScoreMultiplier?: number;
        duoLowRateThresholdPercent?: number;
        duoLowRateCorrection?: number;
        highInterestThresholdPercent?: number;
      };
      if (!data.kindBaseScore || Object.values(data.kindBaseScore).some((score) => score < 0 || score > 100)) {
        issues.push("Schuldenprioriteitsscores vallen buiten de verwachte bandbreedte.");
      }
      if ((data.interestRateScoreMultiplier ?? 0) <= 0) {
        issues.push("Renteweging voor schuldenprioriteit moet positief zijn.");
      }
      if ((data.highInterestThresholdPercent ?? 0) <= 0) {
        issues.push("Hoge-rentedrempel voor schuldenprioriteit moet positief zijn.");
      }
      break;
    }
    case "mortgage-provider-rate":
      return validateMortgageProviderRateDataset(dataset.data);
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
    family: "mortgage-project-assumptions",
    scenario: "defaults-income-ratio-and-student-debt-gross-up",
    meta: {
      recordType: "dataset",
      id: "mortgage-project-assumptions-2026",
      title: "Hypotheekdefaults en studieschuld-brutering Project Site 2026",
      year: 2026,
      version: "1.0.0",
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-12-31",
      retrievedAt: constants2026.mortgage.meta.lastChecked,
      lastVerifiedAt: constants2026.mortgage.meta.lastChecked,
      nextReviewAt: "2026-11-15",
      sourceName: "Project Site",
      sourceUrl: "https://www.rijksoverheid.nl/onderwerpen/koopwoning/vraag-en-antwoord/hypotheek-studieschuld",
      sourceType: "project-assumption",
      methodology:
        "Projectmatige aannames voor hypotheek-defaults, indicatieve woonlastratio en studieschuld-bruteringsfactoren. Deze waarden zijn geen wettelijke norm en vervangen geen hypotheekacceptatie door een geldverstrekker.",
      methodologyType: "project-assumption",
      notes:
        "Label: project-assumption/indicative-rule. Rationale: uniforme indicatieve scenario's en uitlegbare hypotheekimpact zonder bankacceptatie te simuleren.",
      status: "active",
    },
    data: constants2026.mortgage,
    usedBy: [
      "artifact-hypotheek-wonen-maximale-hypotheek",
      "hypotheek-impact-studieschuld",
      "familiehulp-eerste-woning",
    ],
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
    family: "duo-repayment-terms",
    scenario: "sf35-sf15-sf15-old-lllk",
    meta: {
      recordType: "dataset",
      id: "duo-repayment-terms-2026",
      title: "DUO-terugbetaaltermijnen 2026",
      year: 2026,
      version: "1.0.0",
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-12-31",
      retrievedAt: constants2026.duo.meta.lastChecked,
      lastVerifiedAt: constants2026.duo.meta.lastChecked,
      nextReviewAt: "2026-11-15",
      sourceName: "DUO",
      sourceUrl: constants2026.duo.meta.sourceUrl ?? DUO_RATE_YEAR_METADATA_BY_YEAR[2026].sourceUrl,
      sourceType: "official-execution",
      methodology:
        "Centrale dataset voor wettelijke/uitvoeringsrechtelijke terugbetaalduur per DUO-regeling. De dataset bevat alleen de bestaande termijnen en verandert geen rekenuitkomsten.",
      methodologyType: "official-norm",
      notes: "SF35: 35 jaar. SF15, SF15_OLD en SF15_LLLK: 15 jaar. UNKNOWN blijft bestaande fallback op 35 jaar.",
      status: "active",
    },
    data: constants2026.duo.defaultTerms,
    usedBy: [
      "duo-maandbedrag",
      "duo-extra-aflossen",
      "duo-stoppen-kosten-prestatiebeurs",
      "hypotheek-impact-studieschuld",
      "familiehulp-eerste-woning",
    ],
  },
  {
    family: "duo-income-based-repayment-rules",
    scenario: "sf35-sf15-sf15-old-lllk",
    meta: {
      recordType: "dataset",
      id: "duo-income-based-repayment-rules-2026",
      title: "DUO-draagkrachtregels 2026",
      year: 2026,
      version: "1.0.0",
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-12-31",
      retrievedAt: constants2026.duo.meta.lastChecked,
      lastVerifiedAt: constants2026.duo.meta.lastChecked,
      nextReviewAt: "2026-11-15",
      sourceName: "DUO",
      sourceUrl: constants2026.duo.meta.sourceUrl ?? DUO_RATE_YEAR_METADATA_BY_YEAR[2026].sourceUrl,
      sourceType: "official-execution",
      methodology:
        "Centrale dataset voor bestaande draagkrachtvrije voeten en draagkrachtpercentages per DUO-regeling. SF15_OLD behoudt het bestaande gedrag met ontbrekend percentage als expliciete blocker.",
      methodologyType: "official-norm",
      notes:
        "SF15_OLD heeft percentage null omdat de officiële onderbouwing voor een eenvoudig centraal percentage niet voldoende is genormaliseerd. Bestaande berekeningsfallbacks blijven ongewijzigd.",
      status: "active",
    },
    data: constants2026.duo.incomeBasedRules,
    usedBy: ["duo-maandbedrag", "duo-extra-aflossen", "duo-stoppen-kosten-prestatiebeurs"],
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
  {
    family: "planning-debt-priority-rules",
    scenario: "project-score-v1",
    meta: {
      recordType: "dataset",
      id: "planning-debt-priority-rules-2026",
      title: "Schuldenprioriteit projectregels 2026",
      year: 2026,
      version: "1.0.0",
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-12-31",
      retrievedAt: "2026-07-21",
      lastVerifiedAt: "2026-07-21",
      nextReviewAt: "2026-11-15",
      sourceName: "Project Site",
      sourceUrl: "https://www.project-site.local/project-assumptions/planning-debt-priority",
      sourceType: "project-assumption",
      methodology:
        "Indicatieve Project Site-score voor volgorde van extra aflossen. Dit is geen wettelijke norm, geen financieel advies en geen vervanging van contractvoorwaarden of betalingsregelingen.",
      methodologyType: "project-assumption",
      notes:
        "Label: indicative-rule. Rationale: schulden vergelijkbaar maken op rente, flexibiliteit en praktisch risico zonder juridisch recht te claimen.",
      status: "active",
    },
    data: DEBT_PRIORITY_RULES_2026,
    usedBy: ["schulden-volgorde"],
  },
  {
    family: "duo-additional-grant-rules",
    scenario: "official-2026-prepared",
    meta: {
      recordType: "dataset",
      id: "duo-additional-grant-rules-2026",
      title: "DUO aanvullende beurs en peiljaarverlegging 2026 voorbereid",
      year: 2026,
      version: "0.1.0",
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-12-31",
      retrievedAt: "2026-07-20",
      lastVerifiedAt: "2026-07-20",
      nextReviewAt: "2026-10-15",
      sourceName: "DUO",
      sourceUrl: "https://duo.nl/particulier/aanvullende-beurs-studiefinanciering/hoeveel-is-het.jsp",
      sourceType: "official-execution",
      methodology:
        "Voorbereide officiele DUO-brondata en ontwerpcontracten voor de Aanvullende-beursscan 2026. De dataset legt bedragen, standaardpeiljaar, peiljaarverlegging, typed input/result-contracten, special cases en testvectors vast, maar activeert geen publieke calculator.",
      methodologyType: "official-norm",
      notes:
        "PDF-formulierlogica uit DUO-berekeningsfolders is als requires-calculation-guardian-review gemarkeerd. Geen React, route, manifest of PDF-output geactiveerd.",
      status: "active",
    },
    data: DUO_ADDITIONAL_GRANT_RULES_2026,
    usedBy: ["duo-additional-grant-scan-preparation"],
  },
  {
    family: "allowance-signal-rules",
    scenario: "general",
    meta: {
      recordType: "dataset",
      id: "allowance-signal-rules-2026",
      title: "Toeslagensignalen 2026",
      year: 2026,
      version: "1.0.0",
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-12-31",
      retrievedAt: "2026-07-19",
      lastVerifiedAt: "2026-07-19",
      nextReviewAt: "2026-11-15",
      sourceName: "Dienst Toeslagen / Belastingdienst",
      sourceUrl: "https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/hulpmiddel-proefberekening-toeslagen",
      sourceType: "official-execution",
      methodology:
        "Signal-only toeslagenscan 2026. De dataset bevat alleen harde voorwaarden en bronlinks die voldoende zijn voor signalering; concrete toeslagbedragen en afbouwformules blijven buiten scope.",
      methodologyType: "official-norm",
      notes:
        "Zorgtoeslag ondersteunt harde grenschecks. Huurtoeslag, kindgebonden budget en kinderopvangtoeslag blijven terughoudend en verwijzen na basischecks naar de officiele proefberekening.",
      status: "active",
    },
    data: {
      year: 2026,
      ruleVersion: "1.0.0",
      officialCalculationUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/hulpmiddel-proefberekening-toeslagen",
      applicationUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/aanvragen/ik-wil-een-toeslag-aanvragen",
      healthcare: {
        minimumAge: 18,
        maxIncomeSingle: 40_857,
        maxIncomeWithPartner: 51_142,
        maxAssetsSingle: 146_011,
        maxAssetsWithPartner: 184_633,
        informationUrl:
          "https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/kan-ik-zorgtoeslag-krijgen",
        incomeUrl:
          "https://www.belastingdienst.nl/wps/wcm/connect/nl/zorgtoeslag/content/maximaal-inkomen-voor-zorgtoeslag",
        officialCalculationUrl:
          "https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/hulpmiddel-proefberekening-toeslagen",
        applicationUrl:
          "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/aanvragen/ik-wil-een-toeslag-aanvragen",
        incompleteRules: [
          "foreign-or-residence-status",
          "special-assets",
          "monthly-start-after-eighteenth-birthday",
        ],
      },
      rent: {
        maxAssetsSingle: 38_479,
        maxAssetsWithPartner: 76_958,
        maxAssetsPerCoResident: 38_479,
        cappedRentThreshold: 932.93,
        cappedRentThresholdUnder21: 498.20,
        informationUrl:
          "https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/kan-ik-huurtoeslag-krijgen",
        changes2026Url:
          "https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/huurtoeslag-verandert-vanaf-2026",
        assetsUrl:
          "https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/maximaal-vermogen-huurtoeslag",
        coResidentUrl:
          "https://www.belastingdienst.nl/wps/wcm/connect/nl/huurtoeslag/content/wie-telt-als-medebewoner",
        officialCalculationUrl:
          "https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/hulpmiddel-proefberekening-toeslagen",
        applicationUrl:
          "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/aanvragen/ik-wil-een-toeslag-aanvragen",
        incompleteRules: [
          "income-rent-taper",
          "special-housing",
          "subsidisable-rent-exceptions",
          "co-resident-income-and-assets",
        ],
      },
      childBudget: {
        maxAssetsSingle: 146_011,
        maxAssetsWithPartner: 184_633,
        informationUrl:
          "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/kindgebonden-budget/voorwaarden/voorwaarden-kindgebonden-budget",
        assetsUrl:
          "https://www.belastingdienst.nl/wps/wcm/connect/nl/kindgebonden-budget/content/maximaal-vermogen-kindgebonden-budget",
        incomeUrl:
          "https://www.belastingdienst.nl/wps/wcm/connect/nl/kindgebonden-budget/content/maximaal-inkomen-kindgebonden-budget",
        officialCalculationUrl:
          "https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/hulpmiddel-proefberekening-toeslagen",
        applicationUrl:
          "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/aanvragen/ik-wil-een-toeslag-aanvragen",
        incompleteRules: [
          "income-taper",
          "single-parent-top",
          "co-parenting",
          "sixteen-seventeen-year-old-exceptions",
          "composite-family",
        ],
      },
      childcare: {
        maxHoursPerMonth: 230,
        informationUrl:
          "https://www.belastingdienst.nl/wps/wcm/connect/nl/kinderopvangtoeslag/content/kan-ik-kinderopvangtoeslag-krijgen",
        applicationUrl:
          "https://www.belastingdienst.nl/wps/wcm/connect/nl/kinderopvangtoeslag/content/hoe-moet-ik-kinderopvangtoeslag-aanvragen",
        maxHourlyRateUrl:
          "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/toeslagen/kinderopvangtoeslag/hoeveel-kinderopvangtoeslag-kan-ik-krijgen/maximaal-uurtarief-voor-de-kinderopvang",
        changes2026Url:
          "https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen-2026/topics/veranderingen-toeslagen-2026",
        officialCalculationUrl:
          "https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/hulpmiddel-proefberekening-toeslagen",
        incompleteRules: [
          "amount-calculation",
          "hourly-rate-tables",
          "application-deadline",
          "lrk-lookup",
          "education-or-trajectory-recognition",
        ],
      },
    },
    usedBy: ["toeslagenscan"],
  },
  {
    family: "allowance-calculation-rules",
    scenario: "official-2026-prepared",
    meta: {
      recordType: "dataset",
      id: "allowance-calculation-rules-2026",
      title: "Officiele toeslagenberekeningsregels 2026 voorbereid",
      year: 2026,
      version: "0.1.0",
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-12-31",
      retrievedAt: "2026-07-20",
      lastVerifiedAt: "2026-07-20",
      nextReviewAt: "2026-10-15",
      sourceName: "Dienst Toeslagen / Belastingdienst",
      sourceUrl:
        "https://www.belastingdienst.nl/wps/wcm/connect/nl/toeslagen/content/hulpmiddel-proefberekening-toeslagen",
      sourceType: "official-execution",
      methodology:
        "Voorbereide officiele 2026-brondata voor toekomstige euro-indicaties. De dataset documenteert geverifieerde waarden, benodigde invoer, onbekend-routes, blockers en testvectors, maar wordt nog niet geselecteerd door de publieke toeslagenscan.",
      methodologyType: "official-norm",
      notes:
        "Geen publieke bedragberekening geactiveerd. Volledige huurtoeslag-, kindgebonden-budget- en kinderopvangtoeslagformules vereisen verdere normalisatie door de Financial Domain & Calculation Guardian.",
      status: "active",
    },
    data: ALLOWANCE_CALCULATION_RULES_2026,
    usedBy: ["allowances-calculation-guardian-preparation"],
  },
];
