import type { SourceFreshnessStatus, SourceReference } from "@/lib/financial-constants";

export type AllowanceType =
  | "healthcare"
  | "rent"
  | "child-budget"
  | "childcare";

export type AllowanceSignalStatus =
  | "possible"
  | "probably-not"
  | "insufficient-information"
  | "official-calculation-recommended";

export type AllowanceSignalReasonCode =
  | "age-under-18"
  | "missing-age"
  | "missing-income"
  | "missing-assets"
  | "missing-partner-status"
  | "no-dutch-health-insurance"
  | "income-above-hard-threshold"
  | "assets-above-hard-threshold"
  | "not-renting"
  | "not-independent-home"
  | "missing-rent"
  | "missing-household-members"
  | "no-child-under-18"
  | "missing-children"
  | "missing-child-ages"
  | "no-registered-childcare"
  | "missing-childcare-hours"
  | "missing-qualifying-activity"
  | "complex-rules-official-calculation"
  | "hard-conditions-pass";

export type AllowanceSignalInput = {
  year: number;
  age?: number;
  hasAllowancePartner?: boolean;
  assessmentIncome?: number;
  assets?: number;
  hasDutchHealthInsurance?: boolean;
  housing?: {
    tenure?: "rent" | "owner" | "other";
    independentHome?: boolean;
    basicRent?: number;
    householdMemberCount?: number;
    allResidentsUnder21?: boolean;
  };
  children?: Array<{ age?: number }>;
  childcare?: {
    registeredChildcare?: boolean;
    hoursPerMonth?: number;
    parentHasQualifyingActivity?: boolean;
    partnerHasQualifyingActivity?: boolean;
  };
};

export type AllowanceSignalDataset = {
  year: number;
  healthcare: {
    minimumAge: number;
    maxIncomeSingle: number;
    maxIncomeWithPartner: number;
    maxAssetsSingle: number;
    maxAssetsWithPartner: number;
    officialCalculationUrl: string;
  };
  rent: {
    maxAssetsPerResident: number;
    maxAssetsPartnersTogether: number;
    cappedRentThreshold: number;
    cappedRentThresholdAllUnder21: number;
    officialCalculationUrl: string;
  };
  childBudget: {
    maxAssetsSingle: number;
    maxAssetsWithPartner: number;
    officialCalculationUrl: string;
  };
  childcare: {
    maxHoursPerMonth: number;
    officialCalculationUrl: string;
  };
};

export type AllowanceSignalResult = {
  allowanceType: AllowanceType;
  status: AllowanceSignalStatus;
  reasonCodes: AllowanceSignalReasonCode[];
  missingFields: string[];
  determinativeFactors: string[];
  uncertainties: string[];
  officialCalculationUrl: string;
  datasetId: string;
  year: number;
  freshnessStatus: SourceFreshnessStatus;
  sourceReferences: SourceReference[];
};

function isFiniteNonNegative(value: number | undefined) {
  return Number.isFinite(value ?? Number.NaN) && (value as number) >= 0;
}

function hasChildUnder18(children: AllowanceSignalInput["children"]) {
  return (children ?? []).some((child) => Number.isFinite(child.age ?? Number.NaN) && (child.age as number) < 18);
}

function buildResult(input: {
  allowanceType: AllowanceType;
  status: AllowanceSignalStatus;
  reasonCodes: AllowanceSignalReasonCode[];
  missingFields?: string[];
  determinativeFactors?: string[];
  uncertainties?: string[];
  officialCalculationUrl: string;
  datasetId: string;
  year: number;
  freshnessStatus: SourceFreshnessStatus;
  sourceReferences?: SourceReference[];
}): AllowanceSignalResult {
  return {
    allowanceType: input.allowanceType,
    status: input.status,
    reasonCodes: input.reasonCodes,
    missingFields: input.missingFields ?? [],
    determinativeFactors: input.determinativeFactors ?? [],
    uncertainties: input.uncertainties ?? [],
    officialCalculationUrl: input.officialCalculationUrl,
    datasetId: input.datasetId,
    year: input.year,
    freshnessStatus: input.freshnessStatus,
    sourceReferences: input.sourceReferences ?? [],
  };
}

function missingPartnerIncomeAssets(input: AllowanceSignalInput) {
  const missing: string[] = [];
  if (input.hasAllowancePartner === undefined) {
    missing.push("hasAllowancePartner");
  }
  if (!isFiniteNonNegative(input.assessmentIncome)) {
    missing.push("assessmentIncome");
  }
  if (!isFiniteNonNegative(input.assets)) {
    missing.push("assets");
  }
  return missing;
}

export function signalHealthcareAllowance(
  input: AllowanceSignalInput,
  dataset: AllowanceSignalDataset,
  context: {
    datasetId: string;
    freshnessStatus: SourceFreshnessStatus;
    sourceReferences?: SourceReference[];
  },
) {
  const missing = missingPartnerIncomeAssets(input);
  if (input.age === undefined) {
    missing.push("age");
  }
  if (input.hasDutchHealthInsurance === undefined) {
    missing.push("hasDutchHealthInsurance");
  }
  if (missing.length > 0) {
    return buildResult({
      allowanceType: "healthcare",
      status: "insufficient-information",
      reasonCodes: ["missing-income"],
      missingFields: missing,
      officialCalculationUrl: dataset.healthcare.officialCalculationUrl,
      datasetId: context.datasetId,
      year: dataset.year,
      freshnessStatus: context.freshnessStatus,
      sourceReferences: context.sourceReferences,
    });
  }
  if ((input.age ?? 0) < dataset.healthcare.minimumAge) {
    return buildResult({
      allowanceType: "healthcare",
      status: "probably-not",
      reasonCodes: ["age-under-18"],
      determinativeFactors: ["minimum-age"],
      officialCalculationUrl: dataset.healthcare.officialCalculationUrl,
      datasetId: context.datasetId,
      year: dataset.year,
      freshnessStatus: context.freshnessStatus,
      sourceReferences: context.sourceReferences,
    });
  }
  if (input.hasDutchHealthInsurance === false) {
    return buildResult({
      allowanceType: "healthcare",
      status: "probably-not",
      reasonCodes: ["no-dutch-health-insurance"],
      determinativeFactors: ["dutch-health-insurance"],
      officialCalculationUrl: dataset.healthcare.officialCalculationUrl,
      datasetId: context.datasetId,
      year: dataset.year,
      freshnessStatus: context.freshnessStatus,
      sourceReferences: context.sourceReferences,
    });
  }

  const hasPartner = input.hasAllowancePartner === true;
  const maxIncome = hasPartner ? dataset.healthcare.maxIncomeWithPartner : dataset.healthcare.maxIncomeSingle;
  const maxAssets = hasPartner ? dataset.healthcare.maxAssetsWithPartner : dataset.healthcare.maxAssetsSingle;
  if ((input.assessmentIncome ?? 0) > maxIncome) {
    return buildResult({
      allowanceType: "healthcare",
      status: "probably-not",
      reasonCodes: ["income-above-hard-threshold"],
      determinativeFactors: ["assessment-income"],
      officialCalculationUrl: dataset.healthcare.officialCalculationUrl,
      datasetId: context.datasetId,
      year: dataset.year,
      freshnessStatus: context.freshnessStatus,
      sourceReferences: context.sourceReferences,
    });
  }
  if ((input.assets ?? 0) > maxAssets) {
    return buildResult({
      allowanceType: "healthcare",
      status: "probably-not",
      reasonCodes: ["assets-above-hard-threshold"],
      determinativeFactors: ["assets"],
      officialCalculationUrl: dataset.healthcare.officialCalculationUrl,
      datasetId: context.datasetId,
      year: dataset.year,
      freshnessStatus: context.freshnessStatus,
      sourceReferences: context.sourceReferences,
    });
  }

  return buildResult({
    allowanceType: "healthcare",
    status: "possible",
    reasonCodes: ["hard-conditions-pass"],
    determinativeFactors: ["age", "insurance", "income", "assets"],
    officialCalculationUrl: dataset.healthcare.officialCalculationUrl,
    datasetId: context.datasetId,
    year: dataset.year,
    freshnessStatus: context.freshnessStatus,
    sourceReferences: context.sourceReferences,
  });
}

export function signalRentAllowance(
  input: AllowanceSignalInput,
  dataset: AllowanceSignalDataset,
  context: { datasetId: string; freshnessStatus: SourceFreshnessStatus; sourceReferences?: SourceReference[] },
) {
  const missing: string[] = [];
  if (input.housing?.tenure === undefined) missing.push("housing.tenure");
  if (input.housing?.independentHome === undefined) missing.push("housing.independentHome");
  if (!isFiniteNonNegative(input.housing?.basicRent)) missing.push("housing.basicRent");
  if (!isFiniteNonNegative(input.assets)) missing.push("assets");
  if (input.hasAllowancePartner === undefined) missing.push("hasAllowancePartner");
  if (!isFiniteNonNegative(input.housing?.householdMemberCount)) missing.push("housing.householdMemberCount");

  if (missing.length > 0) {
    return buildResult({
      allowanceType: "rent",
      status: "insufficient-information",
      reasonCodes: ["missing-rent"],
      missingFields: missing,
      officialCalculationUrl: dataset.rent.officialCalculationUrl,
      datasetId: context.datasetId,
      year: dataset.year,
      freshnessStatus: context.freshnessStatus,
      sourceReferences: context.sourceReferences,
    });
  }
  if (input.housing?.tenure !== "rent") {
    return buildResult({
      allowanceType: "rent",
      status: "probably-not",
      reasonCodes: ["not-renting"],
      determinativeFactors: ["tenure"],
      officialCalculationUrl: dataset.rent.officialCalculationUrl,
      datasetId: context.datasetId,
      year: dataset.year,
      freshnessStatus: context.freshnessStatus,
      sourceReferences: context.sourceReferences,
    });
  }
  if (input.housing?.independentHome === false) {
    return buildResult({
      allowanceType: "rent",
      status: "probably-not",
      reasonCodes: ["not-independent-home"],
      determinativeFactors: ["independent-home"],
      officialCalculationUrl: dataset.rent.officialCalculationUrl,
      datasetId: context.datasetId,
      year: dataset.year,
      freshnessStatus: context.freshnessStatus,
      sourceReferences: context.sourceReferences,
    });
  }

  const assetLimit =
    input.hasAllowancePartner === true
      ? dataset.rent.maxAssetsPartnersTogether
      : dataset.rent.maxAssetsPerResident * Math.max(input.housing?.householdMemberCount ?? 1, 1);
  if ((input.assets ?? 0) > assetLimit) {
    return buildResult({
      allowanceType: "rent",
      status: "probably-not",
      reasonCodes: ["assets-above-hard-threshold"],
      determinativeFactors: ["assets"],
      officialCalculationUrl: dataset.rent.officialCalculationUrl,
      datasetId: context.datasetId,
      year: dataset.year,
      freshnessStatus: context.freshnessStatus,
      sourceReferences: context.sourceReferences,
    });
  }

  return buildResult({
    allowanceType: "rent",
    status: "official-calculation-recommended",
    reasonCodes: ["complex-rules-official-calculation"],
    determinativeFactors: ["rent", "household", "income", "assets"],
    uncertainties: ["rent-allowance-income-calculation-not-implemented"],
    officialCalculationUrl: dataset.rent.officialCalculationUrl,
    datasetId: context.datasetId,
    year: dataset.year,
    freshnessStatus: context.freshnessStatus,
    sourceReferences: context.sourceReferences,
  });
}

export function signalChildBudgetAllowance(
  input: AllowanceSignalInput,
  dataset: AllowanceSignalDataset,
  context: { datasetId: string; freshnessStatus: SourceFreshnessStatus; sourceReferences?: SourceReference[] },
) {
  const missing = missingPartnerIncomeAssets(input);
  if (!input.children) missing.push("children");
  if (missing.length > 0) {
    return buildResult({
      allowanceType: "child-budget",
      status: "insufficient-information",
      reasonCodes: ["missing-children"],
      missingFields: missing,
      officialCalculationUrl: dataset.childBudget.officialCalculationUrl,
      datasetId: context.datasetId,
      year: dataset.year,
      freshnessStatus: context.freshnessStatus,
      sourceReferences: context.sourceReferences,
    });
  }
  if (!hasChildUnder18(input.children)) {
    return buildResult({
      allowanceType: "child-budget",
      status: "probably-not",
      reasonCodes: ["no-child-under-18"],
      determinativeFactors: ["children"],
      officialCalculationUrl: dataset.childBudget.officialCalculationUrl,
      datasetId: context.datasetId,
      year: dataset.year,
      freshnessStatus: context.freshnessStatus,
      sourceReferences: context.sourceReferences,
    });
  }
  const maxAssets = input.hasAllowancePartner ? dataset.childBudget.maxAssetsWithPartner : dataset.childBudget.maxAssetsSingle;
  if ((input.assets ?? 0) > maxAssets) {
    return buildResult({
      allowanceType: "child-budget",
      status: "probably-not",
      reasonCodes: ["assets-above-hard-threshold"],
      determinativeFactors: ["assets"],
      officialCalculationUrl: dataset.childBudget.officialCalculationUrl,
      datasetId: context.datasetId,
      year: dataset.year,
      freshnessStatus: context.freshnessStatus,
      sourceReferences: context.sourceReferences,
    });
  }
  return buildResult({
    allowanceType: "child-budget",
    status: "official-calculation-recommended",
    reasonCodes: ["complex-rules-official-calculation"],
    uncertainties: ["income-table-not-implemented"],
    officialCalculationUrl: dataset.childBudget.officialCalculationUrl,
    datasetId: context.datasetId,
    year: dataset.year,
    freshnessStatus: context.freshnessStatus,
    sourceReferences: context.sourceReferences,
  });
}

export function signalChildcareAllowance(
  input: AllowanceSignalInput,
  dataset: AllowanceSignalDataset,
  context: { datasetId: string; freshnessStatus: SourceFreshnessStatus; sourceReferences?: SourceReference[] },
) {
  const missing: string[] = [];
  if (!input.children) missing.push("children");
  if (input.childcare?.registeredChildcare === undefined) missing.push("childcare.registeredChildcare");
  if (!isFiniteNonNegative(input.childcare?.hoursPerMonth)) missing.push("childcare.hoursPerMonth");
  if (input.childcare?.parentHasQualifyingActivity === undefined) missing.push("childcare.parentHasQualifyingActivity");
  if (input.hasAllowancePartner === true && input.childcare?.partnerHasQualifyingActivity === undefined) {
    missing.push("childcare.partnerHasQualifyingActivity");
  }

  if (missing.length > 0) {
    return buildResult({
      allowanceType: "childcare",
      status: "insufficient-information",
      reasonCodes: ["missing-childcare-hours"],
      missingFields: missing,
      officialCalculationUrl: dataset.childcare.officialCalculationUrl,
      datasetId: context.datasetId,
      year: dataset.year,
      freshnessStatus: context.freshnessStatus,
      sourceReferences: context.sourceReferences,
    });
  }
  if (!hasChildUnder18(input.children)) {
    return buildResult({
      allowanceType: "childcare",
      status: "probably-not",
      reasonCodes: ["no-child-under-18"],
      officialCalculationUrl: dataset.childcare.officialCalculationUrl,
      datasetId: context.datasetId,
      year: dataset.year,
      freshnessStatus: context.freshnessStatus,
      sourceReferences: context.sourceReferences,
    });
  }
  if (input.childcare?.registeredChildcare === false) {
    return buildResult({
      allowanceType: "childcare",
      status: "probably-not",
      reasonCodes: ["no-registered-childcare"],
      determinativeFactors: ["registered-childcare"],
      officialCalculationUrl: dataset.childcare.officialCalculationUrl,
      datasetId: context.datasetId,
      year: dataset.year,
      freshnessStatus: context.freshnessStatus,
      sourceReferences: context.sourceReferences,
    });
  }
  if (
    input.childcare?.parentHasQualifyingActivity === false ||
    (input.hasAllowancePartner === true && input.childcare?.partnerHasQualifyingActivity === false)
  ) {
    return buildResult({
      allowanceType: "childcare",
      status: "probably-not",
      reasonCodes: ["missing-qualifying-activity"],
      determinativeFactors: ["qualifying-activity"],
      officialCalculationUrl: dataset.childcare.officialCalculationUrl,
      datasetId: context.datasetId,
      year: dataset.year,
      freshnessStatus: context.freshnessStatus,
      sourceReferences: context.sourceReferences,
    });
  }

  return buildResult({
    allowanceType: "childcare",
    status: "official-calculation-recommended",
    reasonCodes: ["complex-rules-official-calculation"],
    determinativeFactors: ["children", "registered-childcare", "hours", "activity"],
    uncertainties: ["childcare-amount-engine-not-implemented"],
    officialCalculationUrl: dataset.childcare.officialCalculationUrl,
    datasetId: context.datasetId,
    year: dataset.year,
    freshnessStatus: context.freshnessStatus,
    sourceReferences: context.sourceReferences,
  });
}
