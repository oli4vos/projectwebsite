import {
  getDatasetForDate,
  getDatasetFreshness,
} from "@/lib/financial-constants/source-datasets";
import type {
  SourceDataset,
  SourceFreshnessStatus,
  SourceReference,
} from "@/lib/financial-constants/types";

export type AllowanceKind =
  | "healthcare"
  | "rent"
  | "child-budget"
  | "childcare";

export type AllowanceType = AllowanceKind;

export type AllowanceSignalStatus =
  | "possible"
  | "probably-not"
  | "insufficient-information"
  | "official-calculation-recommended";

export type UnknownableBoolean = boolean | "unknown";

export type AllowanceReasonCode =
  | "missing-age"
  | "missing-partner-status"
  | "missing-income"
  | "missing-joint-income"
  | "missing-assets"
  | "missing-joint-assets"
  | "missing-household-income"
  | "missing-household-assets"
  | "missing-child-ages"
  | "invalid-rule-year"
  | "invalid-negative-input"
  | "invalid-non-finite-input"
  | "complex-exception"
  | "official-calculation-required"
  | "healthcare-under-minimum-age"
  | "healthcare-no-dutch-insurance"
  | "healthcare-missing-insurance"
  | "healthcare-income-above-limit"
  | "healthcare-assets-above-limit"
  | "healthcare-possible"
  | "rent-missing-tenure"
  | "rent-missing-independent-home"
  | "rent-missing-basic-rent"
  | "rent-missing-co-residents"
  | "rent-not-renting"
  | "rent-not-independent-home"
  | "rent-assets-above-limit"
  | "rent-household-complex"
  | "rent-subsidiable-rent-uncertain"
  | "rent-possible"
  | "child-budget-missing-children"
  | "child-budget-missing-child-benefit"
  | "child-budget-missing-child-residence"
  | "child-budget-no-children"
  | "child-budget-no-child-under-18"
  | "child-budget-no-child-benefit"
  | "child-budget-assets-above-limit"
  | "child-budget-child-residence-excluded"
  | "child-budget-family-complex"
  | "child-budget-possible"
  | "childcare-missing-children"
  | "childcare-missing-care-use"
  | "childcare-missing-care-registration"
  | "childcare-missing-own-contribution"
  | "childcare-missing-child-residence"
  | "childcare-missing-applicant-activity"
  | "childcare-missing-partner-activity"
  | "childcare-missing-hours"
  | "childcare-no-children"
  | "childcare-no-care"
  | "childcare-care-not-registered"
  | "childcare-no-own-contribution"
  | "childcare-no-qualifying-activity"
  | "childcare-partner-no-qualifying-activity"
  | "childcare-child-residence-excluded"
  | "childcare-situation-complex"
  | "childcare-possible";

export type AllowanceSignalReasonCode = AllowanceReasonCode;

export type AllowanceMissingField =
  | "year"
  | "age"
  | "partnerStatus"
  | "assessmentIncome"
  | "jointAssessmentIncome"
  | "assets"
  | "jointAssets"
  | "householdIncome"
  | "householdAssets"
  | "healthcare.hasDutchHealthInsurance"
  | "rent.tenure"
  | "rent.independentHome"
  | "rent.basicRent"
  | "rent.hasCoResidents"
  | "children.hasChildren"
  | "children.childAges"
  | "children.receivesChildBenefit"
  | "children.childLivesWithApplicant"
  | "childcare.usesChildcare"
  | "childcare.registeredChildcare"
  | "childcare.paysOwnContribution"
  | "childcare.childLivesWithApplicant"
  | "childcare.applicantHasQualifyingActivity"
  | "childcare.partnerHasQualifyingActivity"
  | "childcare.hoursPerMonth";

export type AllowanceUncertaintyCode =
  | "foreign-or-residence-status"
  | "special-assets"
  | "assessment-income-uncertain"
  | "part-year-partner"
  | "rent-income-table-not-implemented"
  | "rent-household-income-not-fully-modeled"
  | "special-housing"
  | "special-income"
  | "disabled-household-member"
  | "income-table-not-implemented"
  | "co-parenting"
  | "composite-family"
  | "foreign-child-or-parent"
  | "child-benefit-exception"
  | "childcare-amount-engine-not-implemented"
  | "education-recognition-uncertain"
  | "trajectory-uncertain"
  | "variable-childcare-hours"
  | "multiple-childcare-types"
  | "lrk-registration-uncertain"
  | "dataset-not-fresh";

export type AllowancePartnerStatus = "yes" | "no" | "unknown";

export type AllowanceCommonInput = {
  year?: number;
  age?: number;
  partnerStatus?: AllowancePartnerStatus;
  assessmentIncome?: number;
  jointAssessmentIncome?: number;
  assets?: number;
  jointAssets?: number;
  complexSituation?: boolean;
  foreignOrResidenceSituation?: boolean;
  specialAssets?: boolean;
  partYearPartner?: boolean;
};

export type HealthcareAllowanceInput = {
  hasDutchHealthInsurance?: UnknownableBoolean;
};

export type RentAllowanceInput = {
  tenure?: "rent" | "owner" | "other" | "unknown";
  independentHome?: UnknownableBoolean;
  basicRent?: number;
  hasCoResidents?: UnknownableBoolean;
  householdIncome?: number;
  householdAssets?: number;
  complexHousing?: boolean;
  adaptedHomeOrDisability?: boolean;
  uncertainSubsidiableRent?: boolean;
};

export type ChildBudgetAllowanceInput = {
  hasChildren?: UnknownableBoolean;
  childAges?: readonly number[];
  receivesChildBenefit?: UnknownableBoolean;
  childLivesWithApplicant?: UnknownableBoolean;
  coParenting?: boolean;
  compositeFamily?: boolean;
  specialChildBenefitSituation?: boolean;
};

export type ChildcareAllowanceInput = {
  hasChildren?: UnknownableBoolean;
  usesChildcare?: UnknownableBoolean;
  registeredChildcare?: UnknownableBoolean;
  childLivesWithApplicant?: UnknownableBoolean;
  paysOwnContribution?: UnknownableBoolean;
  applicantHasQualifyingActivity?: UnknownableBoolean;
  partnerHasQualifyingActivity?: UnknownableBoolean | "not-applicable";
  hoursPerMonth?: number;
  complexActivityOrPartnerSituation?: boolean;
  variableHours?: boolean;
  multipleChildcareTypes?: boolean;
  lrkUncertain?: boolean;
};

export type AllowanceScanInput = AllowanceCommonInput & {
  healthcare?: HealthcareAllowanceInput;
  rent?: RentAllowanceInput;
  childBudget?: ChildBudgetAllowanceInput;
  childcare?: ChildcareAllowanceInput;
};

export type AllowanceSignalInput = AllowanceScanInput;

export type AllowanceSignalDataset = {
  year: number;
  ruleVersion: string;
  officialCalculationUrl: string;
  applicationUrl: string;
  healthcare: {
    minimumAge: number;
    maxIncomeSingle: number;
    maxIncomeWithPartner: number;
    maxAssetsSingle: number;
    maxAssetsWithPartner: number;
    informationUrl: string;
    incomeUrl: string;
    officialCalculationUrl: string;
    applicationUrl: string;
    incompleteRules: readonly string[];
  };
  rent: {
    maxAssetsSingle: number;
    maxAssetsWithPartner: number;
    maxAssetsPerCoResident: number;
    cappedRentThreshold: number;
    cappedRentThresholdUnder21: number;
    informationUrl: string;
    changes2026Url: string;
    assetsUrl: string;
    coResidentUrl: string;
    officialCalculationUrl: string;
    applicationUrl: string;
    incompleteRules: readonly string[];
  };
  childBudget: {
    maxAssetsSingle: number;
    maxAssetsWithPartner: number;
    informationUrl: string;
    assetsUrl: string;
    incomeUrl: string;
    officialCalculationUrl: string;
    applicationUrl: string;
    incompleteRules: readonly string[];
  };
  childcare: {
    maxHoursPerMonth: number;
    informationUrl: string;
    applicationUrl: string;
    maxHourlyRateUrl: string;
    changes2026Url: string;
    officialCalculationUrl: string;
    incompleteRules: readonly string[];
  };
};

export type AllowanceSignalResult = {
  allowanceKind: AllowanceKind;
  allowanceType: AllowanceKind;
  status: AllowanceSignalStatus;
  reasonCodes: AllowanceReasonCode[];
  missingFields: AllowanceMissingField[];
  uncertaintyCodes: AllowanceUncertaintyCode[];
  sourceReferences: SourceReference[];
  ruleYear: number;
  year: number;
  datasetId: string;
  datasetVersion: string;
  freshnessStatus: SourceFreshnessStatus;
  hardExclusion: boolean;
  officialCalculationUrl: string;
};

export type AllowanceScanResult = {
  ruleYear: number;
  datasetId: string;
  datasetVersion: string;
  freshnessStatus: SourceFreshnessStatus;
  results: [
    AllowanceSignalResult,
    AllowanceSignalResult,
    AllowanceSignalResult,
    AllowanceSignalResult,
  ];
};

export type AllowanceEvaluationContext = {
  referenceDate?: string;
  ruleYear?: number;
  dataset?: SourceDataset<AllowanceSignalDataset>;
  registry?: readonly SourceDataset[];
};

type EvaluationState = {
  missingFields: AllowanceMissingField[];
  reasonCodes: AllowanceReasonCode[];
  uncertaintyCodes: AllowanceUncertaintyCode[];
  hardExclusion: boolean;
  complex: boolean;
};

const ALLOWANCE_SIGNAL_SCENARIO = "general";
const ALLOWANCE_ORDER: readonly AllowanceKind[] = [
  "healthcare",
  "rent",
  "child-budget",
  "childcare",
];

function isKnownTrue(value: UnknownableBoolean | undefined) {
  return value === true;
}

function isKnownFalse(value: UnknownableBoolean | undefined) {
  return value === false;
}

function isMissingUnknown(value: unknown) {
  return value === undefined || value === "unknown";
}

function isFiniteNonNegative(value: number | undefined) {
  return Number.isFinite(value ?? Number.NaN) && (value as number) >= 0;
}

function hasInvalidNumber(value: number | undefined) {
  return value !== undefined && (!Number.isFinite(value) || value < 0);
}

function hasChildUnder18(children: readonly number[] | undefined) {
  return (children ?? []).some((age) => Number.isFinite(age) && age >= 0 && age < 18);
}

function resolveIncomeAndAssets(input: AllowanceScanInput) {
  const hasPartner = input.partnerStatus === "yes";

  return {
    income: hasPartner ? input.jointAssessmentIncome : input.assessmentIncome,
    assets: hasPartner ? input.jointAssets : input.assets,
    missingIncome: hasPartner ? "jointAssessmentIncome" : "assessmentIncome",
    missingAssets: hasPartner ? "jointAssets" : "assets",
  } as const;
}

function addUnique<T>(target: T[], value: T) {
  if (!target.includes(value)) {
    target.push(value);
  }
}

function addCommonValidation(input: AllowanceScanInput, state: EvaluationState) {
  if (input.year !== undefined && input.year !== 2026) {
    addUnique(state.reasonCodes, "invalid-rule-year");
    addUnique(state.missingFields, "year");
  }
  if (hasInvalidNumber(input.age)) {
    addUnique(state.reasonCodes, "invalid-negative-input");
    addUnique(state.missingFields, "age");
  }
  for (const [field, value] of [
    ["assessmentIncome", input.assessmentIncome],
    ["jointAssessmentIncome", input.jointAssessmentIncome],
    ["assets", input.assets],
    ["jointAssets", input.jointAssets],
  ] as const) {
    if (hasInvalidNumber(value)) {
      addUnique(
        state.reasonCodes,
        Number.isFinite(value) ? "invalid-negative-input" : "invalid-non-finite-input",
      );
      addUnique(state.missingFields, field);
    }
  }
  if (input.complexSituation) {
    state.complex = true;
    addUnique(state.reasonCodes, "complex-exception");
  }
  if (input.foreignOrResidenceSituation) {
    state.complex = true;
    addUnique(state.uncertaintyCodes, "foreign-or-residence-status");
  }
  if (input.specialAssets) {
    state.complex = true;
    addUnique(state.uncertaintyCodes, "special-assets");
  }
  if (input.partYearPartner) {
    state.complex = true;
    addUnique(state.uncertaintyCodes, "part-year-partner");
  }
}

function sourceReference(
  dataset: SourceDataset<AllowanceSignalDataset>,
  freshnessStatus: SourceFreshnessStatus,
  label: string,
  sourceUrl: string,
): SourceReference {
  return {
    label,
    sourceName: dataset.meta.sourceName,
    sourceUrl,
    sourceType: dataset.meta.sourceType,
    referenceDate: dataset.meta.lastVerifiedAt,
    year: dataset.meta.year,
    effectiveFrom: dataset.meta.effectiveFrom,
    effectiveTo: dataset.meta.effectiveTo,
    methodology: dataset.meta.methodology,
    methodologyType: dataset.meta.methodologyType,
    freshnessStatus,
    datasetId: dataset.meta.id,
    version: dataset.meta.version,
  };
}

function uniqueReferences(references: SourceReference[]) {
  const seen = new Set<string>();

  return references.filter((reference) => {
    const key = `${reference.label}:${reference.sourceUrl}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function buildResult(input: {
  allowanceKind: AllowanceKind;
  state: EvaluationState;
  dataset: SourceDataset<AllowanceSignalDataset>;
  freshnessStatus: SourceFreshnessStatus;
  sourceReferences: SourceReference[];
  possibleReasonCode: AllowanceReasonCode;
  officialCalculationUrl: string;
}): AllowanceSignalResult {
  let status: AllowanceSignalStatus;
  if (input.state.missingFields.length > 0) {
    status = "insufficient-information";
  } else if (input.state.hardExclusion) {
    status = "probably-not";
  } else if (input.state.complex || input.state.uncertaintyCodes.length > 0) {
    status = "official-calculation-recommended";
    addUnique(input.state.reasonCodes, "official-calculation-required");
    addUnique(input.state.reasonCodes, input.possibleReasonCode);
  } else {
    status = input.allowanceKind === "healthcare" ? "possible" : "official-calculation-recommended";
    addUnique(
      input.state.reasonCodes,
      input.allowanceKind === "healthcare" ? input.possibleReasonCode : "official-calculation-required",
    );
    if (input.allowanceKind !== "healthcare") {
      addUnique(input.state.reasonCodes, input.possibleReasonCode);
    }
  }

  return {
    allowanceKind: input.allowanceKind,
    allowanceType: input.allowanceKind,
    status,
    reasonCodes: input.state.reasonCodes,
    missingFields: input.state.missingFields,
    uncertaintyCodes: input.state.uncertaintyCodes,
    sourceReferences: uniqueReferences(input.sourceReferences),
    ruleYear: input.dataset.data.year,
    year: input.dataset.data.year,
    datasetId: input.dataset.meta.id,
    datasetVersion: input.dataset.meta.version,
    freshnessStatus: input.freshnessStatus,
    hardExclusion: input.state.hardExclusion,
    officialCalculationUrl: input.officialCalculationUrl,
  };
}

function createState(input: AllowanceScanInput): EvaluationState {
  const state: EvaluationState = {
    missingFields: [],
    reasonCodes: [],
    uncertaintyCodes: [],
    hardExclusion: false,
    complex: false,
  };
  addCommonValidation(input, state);

  return state;
}

function requirePartnerIncomeAssets(input: AllowanceScanInput, state: EvaluationState) {
  if (input.partnerStatus === undefined || input.partnerStatus === "unknown") {
    addUnique(state.missingFields, "partnerStatus");
    addUnique(state.reasonCodes, "missing-partner-status");
    addUnique(state.missingFields, "assessmentIncome");
    addUnique(state.reasonCodes, "missing-income");
    addUnique(state.missingFields, "assets");
    addUnique(state.reasonCodes, "missing-assets");
    return;
  }

  const resolved = resolveIncomeAndAssets(input);
  if (!isFiniteNonNegative(resolved.income)) {
    addUnique(state.missingFields, resolved.missingIncome);
    addUnique(
      state.reasonCodes,
      input.partnerStatus === "yes" ? "missing-joint-income" : "missing-income",
    );
  }
  if (!isFiniteNonNegative(resolved.assets)) {
    addUnique(state.missingFields, resolved.missingAssets);
    addUnique(
      state.reasonCodes,
      input.partnerStatus === "yes" ? "missing-joint-assets" : "missing-assets",
    );
  }
}

export function evaluateHealthcareAllowance(
  input: AllowanceScanInput,
  dataset: SourceDataset<AllowanceSignalDataset>,
  freshnessStatus = getDatasetFreshness(dataset).status,
): AllowanceSignalResult {
  const data = dataset.data.healthcare;
  const state = createState(input);
  requirePartnerIncomeAssets(input, state);

  if (input.age === undefined) {
    addUnique(state.missingFields, "age");
    addUnique(state.reasonCodes, "missing-age");
  }
  if (isMissingUnknown(input.healthcare?.hasDutchHealthInsurance)) {
    addUnique(state.missingFields, "healthcare.hasDutchHealthInsurance");
    addUnique(state.reasonCodes, "healthcare-missing-insurance");
  }
  if (input.age !== undefined && Number.isFinite(input.age) && input.age < data.minimumAge) {
    state.hardExclusion = true;
    addUnique(state.reasonCodes, "healthcare-under-minimum-age");
  }
  if (isKnownFalse(input.healthcare?.hasDutchHealthInsurance)) {
    state.hardExclusion = true;
    addUnique(state.reasonCodes, "healthcare-no-dutch-insurance");
  }
  if (input.partnerStatus === "yes" || input.partnerStatus === "no") {
    const { income, assets } = resolveIncomeAndAssets(input);
    const maxIncome =
      input.partnerStatus === "yes" ? data.maxIncomeWithPartner : data.maxIncomeSingle;
    const maxAssets =
      input.partnerStatus === "yes" ? data.maxAssetsWithPartner : data.maxAssetsSingle;
    if (isFiniteNonNegative(income) && (income as number) > maxIncome) {
      state.hardExclusion = true;
      addUnique(state.reasonCodes, "healthcare-income-above-limit");
    }
    if (isFiniteNonNegative(assets) && (assets as number) > maxAssets) {
      state.hardExclusion = true;
      addUnique(state.reasonCodes, "healthcare-assets-above-limit");
    }
  }

  return buildResult({
    allowanceKind: "healthcare",
    state,
    dataset,
    freshnessStatus,
    possibleReasonCode: "healthcare-possible",
    officialCalculationUrl: data.officialCalculationUrl,
    sourceReferences: [
      sourceReference(dataset, freshnessStatus, "Zorgtoeslag voorwaarden", data.informationUrl),
      sourceReference(dataset, freshnessStatus, "Zorgtoeslag inkomensgrenzen", data.incomeUrl),
      sourceReference(dataset, freshnessStatus, "Officiele proefberekening", data.officialCalculationUrl),
      sourceReference(dataset, freshnessStatus, "Toeslag aanvragen", data.applicationUrl),
    ],
  });
}

export function evaluateRentAllowance(
  input: AllowanceScanInput,
  dataset: SourceDataset<AllowanceSignalDataset>,
  freshnessStatus = getDatasetFreshness(dataset).status,
): AllowanceSignalResult {
  const data = dataset.data.rent;
  const state = createState(input);
  requirePartnerIncomeAssets(input, state);

  if (isMissingUnknown(input.rent?.tenure)) {
    addUnique(state.missingFields, "rent.tenure");
    addUnique(state.reasonCodes, "rent-missing-tenure");
  }
  if (isMissingUnknown(input.rent?.independentHome)) {
    addUnique(state.missingFields, "rent.independentHome");
    addUnique(state.reasonCodes, "rent-missing-independent-home");
  }
  if (!isFiniteNonNegative(input.rent?.basicRent)) {
    addUnique(state.missingFields, "rent.basicRent");
    addUnique(state.reasonCodes, "rent-missing-basic-rent");
  }
  if (isMissingUnknown(input.rent?.hasCoResidents)) {
    addUnique(state.missingFields, "rent.hasCoResidents");
    addUnique(state.reasonCodes, "rent-missing-co-residents");
  }
  if (hasInvalidNumber(input.rent?.basicRent)) {
    addUnique(
      state.reasonCodes,
      Number.isFinite(input.rent?.basicRent) ? "invalid-negative-input" : "invalid-non-finite-input",
    );
  }
  if (input.rent?.tenure === "owner" || input.rent?.tenure === "other") {
    state.hardExclusion = true;
    addUnique(state.reasonCodes, "rent-not-renting");
  }
  if (isKnownFalse(input.rent?.independentHome)) {
    state.hardExclusion = true;
    addUnique(state.reasonCodes, "rent-not-independent-home");
  }
  const assetsForRent =
    input.partnerStatus === "yes"
      ? input.jointAssets
      : input.rent?.hasCoResidents === true
        ? input.rent.householdAssets
        : input.assets;
  if (input.rent?.hasCoResidents === true && !isFiniteNonNegative(input.rent.householdIncome)) {
    addUnique(state.missingFields, "householdIncome");
    addUnique(state.reasonCodes, "missing-household-income");
  }
  if (input.rent?.hasCoResidents === true && !isFiniteNonNegative(input.rent.householdAssets)) {
    addUnique(state.missingFields, "householdAssets");
    addUnique(state.reasonCodes, "missing-household-assets");
  }
  const assetLimit =
    input.partnerStatus === "yes" ? data.maxAssetsWithPartner : data.maxAssetsSingle;
  if (isFiniteNonNegative(assetsForRent) && (assetsForRent as number) > assetLimit) {
    state.hardExclusion = true;
    addUnique(state.reasonCodes, "rent-assets-above-limit");
  }
  if (
    input.rent?.hasCoResidents === true ||
    input.rent?.complexHousing ||
    input.rent?.adaptedHomeOrDisability ||
    input.rent?.uncertainSubsidiableRent
  ) {
    state.complex = true;
    addUnique(state.reasonCodes, "rent-household-complex");
    addUnique(state.uncertaintyCodes, "rent-household-income-not-fully-modeled");
  }
  if (input.rent?.uncertainSubsidiableRent) {
    addUnique(state.reasonCodes, "rent-subsidiable-rent-uncertain");
  }
  if (input.rent?.adaptedHomeOrDisability) {
    addUnique(state.uncertaintyCodes, "disabled-household-member");
  }
  addUnique(state.uncertaintyCodes, "rent-income-table-not-implemented");

  return buildResult({
    allowanceKind: "rent",
    state,
    dataset,
    freshnessStatus,
    possibleReasonCode: "rent-possible",
    officialCalculationUrl: data.officialCalculationUrl,
    sourceReferences: [
      sourceReference(dataset, freshnessStatus, "Huurtoeslag voorwaarden", data.informationUrl),
      sourceReference(dataset, freshnessStatus, "Huurtoeslag 2026 wijzigingen", data.changes2026Url),
      sourceReference(dataset, freshnessStatus, "Huurtoeslag vermogen", data.assetsUrl),
      sourceReference(dataset, freshnessStatus, "Huurtoeslag medebewoners", data.coResidentUrl),
      sourceReference(dataset, freshnessStatus, "Officiele proefberekening", data.officialCalculationUrl),
      sourceReference(dataset, freshnessStatus, "Toeslag aanvragen", data.applicationUrl),
    ],
  });
}

export function evaluateChildBudgetAllowance(
  input: AllowanceScanInput,
  dataset: SourceDataset<AllowanceSignalDataset>,
  freshnessStatus = getDatasetFreshness(dataset).status,
): AllowanceSignalResult {
  const data = dataset.data.childBudget;
  const state = createState(input);
  requirePartnerIncomeAssets(input, state);

  if (isMissingUnknown(input.childBudget?.hasChildren)) {
    addUnique(state.missingFields, "children.hasChildren");
    addUnique(state.reasonCodes, "child-budget-missing-children");
  }
  if (isKnownTrue(input.childBudget?.hasChildren) && input.childBudget?.childAges === undefined) {
    addUnique(state.missingFields, "children.childAges");
    addUnique(state.reasonCodes, "missing-child-ages");
  }
  if (isMissingUnknown(input.childBudget?.receivesChildBenefit)) {
    addUnique(state.missingFields, "children.receivesChildBenefit");
    addUnique(state.reasonCodes, "child-budget-missing-child-benefit");
  }
  if (isMissingUnknown(input.childBudget?.childLivesWithApplicant)) {
    addUnique(state.missingFields, "children.childLivesWithApplicant");
    addUnique(state.reasonCodes, "child-budget-missing-child-residence");
  }
  if (isKnownFalse(input.childBudget?.hasChildren)) {
    state.hardExclusion = true;
    addUnique(state.reasonCodes, "child-budget-no-children");
  }
  if (
    isKnownTrue(input.childBudget?.hasChildren) &&
    input.childBudget?.childAges !== undefined &&
    !hasChildUnder18(input.childBudget.childAges)
  ) {
    state.hardExclusion = true;
    addUnique(state.reasonCodes, "child-budget-no-child-under-18");
  }
  if (isKnownFalse(input.childBudget?.receivesChildBenefit)) {
    state.hardExclusion = true;
    addUnique(state.reasonCodes, "child-budget-no-child-benefit");
  }
  if (isKnownFalse(input.childBudget?.childLivesWithApplicant)) {
    state.hardExclusion = true;
    addUnique(state.reasonCodes, "child-budget-child-residence-excluded");
  }
  if (input.partnerStatus === "yes" || input.partnerStatus === "no") {
    const maxAssets =
      input.partnerStatus === "yes" ? data.maxAssetsWithPartner : data.maxAssetsSingle;
    const { assets } = resolveIncomeAndAssets(input);
    if (isFiniteNonNegative(assets) && (assets as number) > maxAssets) {
      state.hardExclusion = true;
      addUnique(state.reasonCodes, "child-budget-assets-above-limit");
    }
  }
  if (
    input.childBudget?.coParenting ||
    input.childBudget?.compositeFamily ||
    input.childBudget?.specialChildBenefitSituation
  ) {
    state.complex = true;
    addUnique(state.reasonCodes, "child-budget-family-complex");
  }
  if (input.childBudget?.coParenting) addUnique(state.uncertaintyCodes, "co-parenting");
  if (input.childBudget?.compositeFamily) addUnique(state.uncertaintyCodes, "composite-family");
  if (input.childBudget?.specialChildBenefitSituation) {
    addUnique(state.uncertaintyCodes, "child-benefit-exception");
  }
  addUnique(state.uncertaintyCodes, "income-table-not-implemented");

  return buildResult({
    allowanceKind: "child-budget",
    state,
    dataset,
    freshnessStatus,
    possibleReasonCode: "child-budget-possible",
    officialCalculationUrl: data.officialCalculationUrl,
    sourceReferences: [
      sourceReference(dataset, freshnessStatus, "Kindgebonden budget voorwaarden", data.informationUrl),
      sourceReference(dataset, freshnessStatus, "Kindgebonden budget vermogen", data.assetsUrl),
      sourceReference(dataset, freshnessStatus, "Kindgebonden budget inkomen", data.incomeUrl),
      sourceReference(dataset, freshnessStatus, "Officiele proefberekening", data.officialCalculationUrl),
      sourceReference(dataset, freshnessStatus, "Toeslag aanvragen", data.applicationUrl),
    ],
  });
}

export function evaluateChildcareAllowance(
  input: AllowanceScanInput,
  dataset: SourceDataset<AllowanceSignalDataset>,
  freshnessStatus = getDatasetFreshness(dataset).status,
): AllowanceSignalResult {
  const data = dataset.data.childcare;
  const state = createState(input);

  if (input.partnerStatus === undefined || input.partnerStatus === "unknown") {
    addUnique(state.missingFields, "partnerStatus");
    addUnique(state.reasonCodes, "missing-partner-status");
  }
  if (isMissingUnknown(input.childcare?.hasChildren)) {
    addUnique(state.missingFields, "children.hasChildren");
    addUnique(state.reasonCodes, "childcare-missing-children");
  }
  if (isMissingUnknown(input.childcare?.usesChildcare)) {
    addUnique(state.missingFields, "childcare.usesChildcare");
    addUnique(state.reasonCodes, "childcare-missing-care-use");
  }
  if (isMissingUnknown(input.childcare?.registeredChildcare)) {
    addUnique(state.missingFields, "childcare.registeredChildcare");
    addUnique(state.reasonCodes, "childcare-missing-care-registration");
  }
  if (isMissingUnknown(input.childcare?.paysOwnContribution)) {
    addUnique(state.missingFields, "childcare.paysOwnContribution");
    addUnique(state.reasonCodes, "childcare-missing-own-contribution");
  }
  if (isMissingUnknown(input.childcare?.childLivesWithApplicant)) {
    addUnique(state.missingFields, "childcare.childLivesWithApplicant");
    addUnique(state.reasonCodes, "childcare-missing-child-residence");
  }
  if (isMissingUnknown(input.childcare?.applicantHasQualifyingActivity)) {
    addUnique(state.missingFields, "childcare.applicantHasQualifyingActivity");
    addUnique(state.reasonCodes, "childcare-missing-applicant-activity");
  }
  if (
    input.partnerStatus === "yes" &&
    isMissingUnknown(input.childcare?.partnerHasQualifyingActivity)
  ) {
    addUnique(state.missingFields, "childcare.partnerHasQualifyingActivity");
    addUnique(state.reasonCodes, "childcare-missing-partner-activity");
  }
  if (!isFiniteNonNegative(input.childcare?.hoursPerMonth)) {
    addUnique(state.missingFields, "childcare.hoursPerMonth");
    addUnique(state.reasonCodes, "childcare-missing-hours");
  }
  if (hasInvalidNumber(input.childcare?.hoursPerMonth)) {
    addUnique(
      state.reasonCodes,
      Number.isFinite(input.childcare?.hoursPerMonth)
        ? "invalid-negative-input"
        : "invalid-non-finite-input",
    );
  }
  if (isKnownFalse(input.childcare?.hasChildren)) {
    state.hardExclusion = true;
    addUnique(state.reasonCodes, "childcare-no-children");
  }
  if (isKnownFalse(input.childcare?.usesChildcare)) {
    state.hardExclusion = true;
    addUnique(state.reasonCodes, "childcare-no-care");
  }
  if (isKnownFalse(input.childcare?.registeredChildcare)) {
    state.hardExclusion = true;
    addUnique(state.reasonCodes, "childcare-care-not-registered");
  }
  if (isKnownFalse(input.childcare?.paysOwnContribution)) {
    state.hardExclusion = true;
    addUnique(state.reasonCodes, "childcare-no-own-contribution");
  }
  if (isKnownFalse(input.childcare?.childLivesWithApplicant)) {
    state.hardExclusion = true;
    addUnique(state.reasonCodes, "childcare-child-residence-excluded");
  }
  if (isKnownFalse(input.childcare?.applicantHasQualifyingActivity)) {
    state.hardExclusion = true;
    addUnique(state.reasonCodes, "childcare-no-qualifying-activity");
  }
  if (input.partnerStatus === "yes" && input.childcare?.partnerHasQualifyingActivity === false) {
    state.hardExclusion = true;
    addUnique(state.reasonCodes, "childcare-partner-no-qualifying-activity");
  }
  if (
    input.childcare?.complexActivityOrPartnerSituation ||
    input.childcare?.variableHours ||
    input.childcare?.multipleChildcareTypes ||
    input.childcare?.lrkUncertain
  ) {
    state.complex = true;
    addUnique(state.reasonCodes, "childcare-situation-complex");
  }
  if (input.childcare?.complexActivityOrPartnerSituation) {
    addUnique(state.uncertaintyCodes, "education-recognition-uncertain");
    addUnique(state.uncertaintyCodes, "trajectory-uncertain");
  }
  if (input.childcare?.variableHours) addUnique(state.uncertaintyCodes, "variable-childcare-hours");
  if (input.childcare?.multipleChildcareTypes) addUnique(state.uncertaintyCodes, "multiple-childcare-types");
  if (input.childcare?.lrkUncertain) addUnique(state.uncertaintyCodes, "lrk-registration-uncertain");
  addUnique(state.uncertaintyCodes, "childcare-amount-engine-not-implemented");

  return buildResult({
    allowanceKind: "childcare",
    state,
    dataset,
    freshnessStatus,
    possibleReasonCode: "childcare-possible",
    officialCalculationUrl: data.officialCalculationUrl,
    sourceReferences: [
      sourceReference(dataset, freshnessStatus, "Kinderopvangtoeslag voorwaarden", data.informationUrl),
      sourceReference(dataset, freshnessStatus, "Kinderopvangtoeslag aanvragen", data.applicationUrl),
      sourceReference(dataset, freshnessStatus, "Maximaal uurtarief kinderopvang", data.maxHourlyRateUrl),
      sourceReference(dataset, freshnessStatus, "Toeslagen 2026 wijzigingen", data.changes2026Url),
      sourceReference(dataset, freshnessStatus, "Officiele proefberekening", data.officialCalculationUrl),
    ],
  });
}

function resolveDataset(context: AllowanceEvaluationContext = {}) {
  if (context.dataset) {
    return context.dataset;
  }

  return getDatasetForDate("allowance-signal-rules", context.referenceDate, {
    scenario: ALLOWANCE_SIGNAL_SCENARIO,
    registry: context.registry,
  }) as SourceDataset<AllowanceSignalDataset>;
}

export function evaluateAllowanceSignals(
  input: AllowanceScanInput,
  context: AllowanceEvaluationContext = {},
): AllowanceScanResult {
  const dataset = resolveDataset(context);
  const freshness = getDatasetFreshness(dataset, context.referenceDate);
  if (context.ruleYear !== undefined && context.ruleYear !== dataset.data.year) {
    throw new Error(`Geen toeslagensignaalregels voor jaar ${context.ruleYear}.`);
  }
  if (freshness.status !== "fresh" && freshness.status !== "review-due") {
    throw new Error(`Toeslagensignaalregels ${dataset.meta.id} zijn niet actief bruikbaar: ${freshness.status}.`);
  }

  const results = [
    evaluateHealthcareAllowance(input, dataset, freshness.status),
    evaluateRentAllowance(input, dataset, freshness.status),
    evaluateChildBudgetAllowance(input, dataset, freshness.status),
    evaluateChildcareAllowance(input, dataset, freshness.status),
  ] as AllowanceScanResult["results"];

  return {
    ruleYear: dataset.data.year,
    datasetId: dataset.meta.id,
    datasetVersion: dataset.meta.version,
    freshnessStatus: freshness.status,
    results,
  };
}

export function signalHealthcareAllowance(
  input: AllowanceScanInput,
  dataset: AllowanceSignalDataset,
  context: {
    datasetId: string;
    freshnessStatus: SourceFreshnessStatus;
    sourceReferences?: SourceReference[];
  },
) {
  return evaluateHealthcareAllowance(input, createLegacyDataset(dataset, context.datasetId), context.freshnessStatus);
}

export function signalRentAllowance(
  input: AllowanceScanInput,
  dataset: AllowanceSignalDataset,
  context: { datasetId: string; freshnessStatus: SourceFreshnessStatus; sourceReferences?: SourceReference[] },
) {
  return evaluateRentAllowance(input, createLegacyDataset(dataset, context.datasetId), context.freshnessStatus);
}

export function signalChildBudgetAllowance(
  input: AllowanceScanInput,
  dataset: AllowanceSignalDataset,
  context: { datasetId: string; freshnessStatus: SourceFreshnessStatus; sourceReferences?: SourceReference[] },
) {
  return evaluateChildBudgetAllowance(input, createLegacyDataset(dataset, context.datasetId), context.freshnessStatus);
}

export function signalChildcareAllowance(
  input: AllowanceScanInput,
  dataset: AllowanceSignalDataset,
  context: { datasetId: string; freshnessStatus: SourceFreshnessStatus; sourceReferences?: SourceReference[] },
) {
  return evaluateChildcareAllowance(input, createLegacyDataset(dataset, context.datasetId), context.freshnessStatus);
}

export const ALLOWANCE_SIGNAL_ORDER = ALLOWANCE_ORDER;

function createLegacyDataset(
  dataset: AllowanceSignalDataset,
  datasetId: string,
): SourceDataset<AllowanceSignalDataset> {
  return {
    family: "allowance-signal-rules",
    scenario: ALLOWANCE_SIGNAL_SCENARIO,
    meta: {
      recordType: "dataset",
      id: datasetId,
      title: "Toeslagensignalen 2026",
      year: dataset.year,
      version: dataset.ruleVersion,
      effectiveFrom: "2026-01-01",
      effectiveTo: "2026-12-31",
      retrievedAt: "2026-07-19",
      lastVerifiedAt: "2026-07-19",
      nextReviewAt: "2026-11-15",
      sourceName: "Dienst Toeslagen / Belastingdienst",
      sourceUrl: dataset.officialCalculationUrl,
      sourceType: "official-execution",
      methodology: "Signal-only toeslagenscan op basis van harde officiele voorwaarden.",
      methodologyType: "official-norm",
      status: "active",
    },
    data: dataset,
    usedBy: ["toeslagenscan"],
  };
}
