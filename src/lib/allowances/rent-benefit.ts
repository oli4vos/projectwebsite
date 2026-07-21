import { ALLOWANCE_CALCULATION_RULES_2026 } from "@/lib/financial-constants/allowance-calculation-rules-2026";

export type RentBenefitEligibilityStatus =
  | "calculated"
  | "ineligible"
  | "unsupported"
  | "incomplete";

export type RentBenefitSpecialSituation =
  | "special-housing-situation"
  | "partial-year"
  | "moving-household"
  | "subtenant";

export type RentBenefitCoResidentInput = {
  readonly age: number;
  readonly income?: number;
  readonly assets: number;
  readonly isChildOfApplicantOrPartner?: boolean;
  readonly excludedAsSubtenant?: boolean;
};

export type RentBenefitInput = {
  readonly calculationYear: number;
  readonly applicantAge: number;
  readonly hasPartner: boolean;
  readonly partnerAge?: number;
  readonly isIndependentHome: boolean;
  readonly basicRent: number;
  readonly serviceCosts?: number;
  readonly householdIncome?: number;
  readonly applicantIncome?: number;
  readonly partnerIncome?: number;
  readonly applicantAssets: number;
  readonly partnerAssets?: number;
  readonly coResidents?: readonly RentBenefitCoResidentInput[];
  readonly hasChildOrDisabilityExceptionWhenUnder21?: boolean;
  readonly specialSituations?: readonly RentBenefitSpecialSituation[];
};

export type RentBenefitComponents = {
  readonly qualityDiscountPart: number;
  readonly cappingBandPart: number;
  readonly aboveCappingPart: number;
  readonly incomeCorrection: number;
};

export type RentBenefitResult = {
  readonly eligibilityStatus: RentBenefitEligibilityStatus;
  readonly monthlyAmount?: number;
  readonly yearlyAmount?: number;
  readonly cappedCalculationRent?: number;
  readonly baseRent?: number;
  readonly calculationRent?: number;
  readonly householdIncomeUsed?: number;
  readonly components: RentBenefitComponents;
  readonly reasonCodes: readonly string[];
  readonly warnings: readonly string[];
  readonly sourceDatasetId: "allowance-calculation-rules-2026";
  readonly calculationYear: number;
  readonly reliability: "official-standard-scenario" | "blocked" | "incomplete";
};

const DATASET_ID = "allowance-calculation-rules-2026" as const;

function deepFreeze<T>(value: T): T {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const nested of Object.values(value)) deepFreeze(nested);
  return value;
}

function value(source: { readonly value: number | string | readonly number[] }) {
  return Number(source.value);
}

function money(valueToRound: number) {
  return Math.round(valueToRound * 100) / 100;
}

function emptyComponents(): RentBenefitComponents {
  return {
    qualityDiscountPart: 0,
    cappingBandPart: 0,
    aboveCappingPart: 0,
    incomeCorrection: 0,
  };
}

function unsupported(reasonCodes: readonly string[], calculationYear: number): RentBenefitResult {
  return deepFreeze({
    eligibilityStatus: "unsupported",
    components: emptyComponents(),
    reasonCodes,
    warnings: ["manual-review-required"],
    sourceDatasetId: DATASET_ID,
    calculationYear,
    reliability: "blocked",
  });
}

function ineligible(reasonCodes: readonly string[], calculationYear: number): RentBenefitResult {
  return deepFreeze({
    eligibilityStatus: "ineligible",
    monthlyAmount: 0,
    yearlyAmount: 0,
    components: emptyComponents(),
    reasonCodes,
    warnings: [],
    sourceDatasetId: DATASET_ID,
    calculationYear,
    reliability: "official-standard-scenario",
  });
}

function hasInvalidNumber(valueToCheck: number | undefined) {
  return valueToCheck !== undefined && (!Number.isFinite(valueToCheck) || valueToCheck < 0);
}

function validateInput(input: RentBenefitInput) {
  const reasonCodes: string[] = [];
  if (input.calculationYear !== 2026) reasonCodes.push("unsupported-calculation-year");
  for (const [fieldId, fieldValue] of Object.entries({
    applicantAge: input.applicantAge,
    partnerAge: input.partnerAge,
    basicRent: input.basicRent,
    serviceCosts: input.serviceCosts,
    householdIncome: input.householdIncome,
    applicantIncome: input.applicantIncome,
    partnerIncome: input.partnerIncome,
    applicantAssets: input.applicantAssets,
    partnerAssets: input.partnerAssets,
  })) {
    if (hasInvalidNumber(fieldValue)) reasonCodes.push(`invalid-${fieldId}`);
  }
  for (const [index, coResident] of (input.coResidents ?? []).entries()) {
    if (hasInvalidNumber(coResident.age)) reasonCodes.push(`invalid-coResident-${index}-age`);
    if (hasInvalidNumber(coResident.income)) reasonCodes.push(`invalid-coResident-${index}-income`);
    if (hasInvalidNumber(coResident.assets)) reasonCodes.push(`invalid-coResident-${index}-assets`);
  }
  return reasonCodes;
}

function householdSize(input: RentBenefitInput) {
  return 1 + (input.hasPartner ? 1 : 0) + (input.coResidents ?? []).filter((item) => !item.excludedAsSubtenant).length;
}

function isUnder21Household(input: RentBenefitInput) {
  const ages = [
    input.applicantAge,
    ...(input.hasPartner && input.partnerAge !== undefined ? [input.partnerAge] : []),
    ...(input.coResidents ?? []).filter((item) => !item.excludedAsSubtenant).map((item) => item.age),
  ];
  return ages.length > 0 && ages.every((age) => age < 21);
}

function incomeFromMembers(input: RentBenefitInput) {
  if (input.householdIncome !== undefined) return money(input.householdIncome);
  const rules = ALLOWANCE_CALCULATION_RULES_2026.rent;
  const childExemption = value(rules.childIncomeExemptionUnder23);
  return money(
    (input.applicantIncome ?? 0) +
      (input.hasPartner ? input.partnerIncome ?? 0 : 0) +
      (input.coResidents ?? [])
        .filter((item) => !item.excludedAsSubtenant)
        .reduce((sum, item) => {
          const income = item.income ?? 0;
          if (item.isChildOfApplicantOrPartner && item.age < 23) {
            return sum + Math.max(income - childExemption, 0);
          }
          return sum + income;
        }, 0),
  );
}

export function calculateRentBenefit2026(input: RentBenefitInput): RentBenefitResult {
  const invalidReasonCodes = validateInput(input);
  if (invalidReasonCodes.length > 0) {
    return deepFreeze({
      eligibilityStatus: input.calculationYear === 2026 ? "incomplete" : "unsupported",
      components: emptyComponents(),
      reasonCodes: invalidReasonCodes,
      warnings: [],
      sourceDatasetId: DATASET_ID,
      calculationYear: input.calculationYear,
      reliability: input.calculationYear === 2026 ? "incomplete" : "blocked",
    });
  }
  if (!input.isIndependentHome) {
    return unsupported(["unsupported-non-independent-home"], input.calculationYear);
  }
  if ((input.specialSituations ?? []).includes("special-housing-situation")) {
    return unsupported(["unsupported-special-housing-situation", "manual-review-required"], input.calculationYear);
  }
  if ((input.specialSituations ?? []).includes("partial-year")) {
    return unsupported(["partial-year-not-supported", "manual-review-required"], input.calculationYear);
  }

  const rules = ALLOWANCE_CALCULATION_RULES_2026.rent;
  const partnerAssets = input.hasPartner ? input.partnerAssets ?? 0 : 0;
  const partnerAssetLimit = input.hasPartner ? value(rules.maxAssetsWithPartner) : value(rules.maxAssetsSingle);
  if (input.applicantAssets + partnerAssets > partnerAssetLimit) {
    return ineligible(["rent-assets-above-limit"], input.calculationYear);
  }
  if ((input.coResidents ?? []).some((item) => item.assets > value(rules.maxAssetsPerCoResident))) {
    return ineligible(["rent-co-resident-assets-above-limit"], input.calculationYear);
  }

  const size = householdSize(input);
  const under21Only = isUnder21Household(input) && !input.hasChildOrDisabilityExceptionWhenUnder21;
  const rentCap = under21Only
    ? value(rules.cappedRentThresholdUnder21)
    : value(rules.cappedRentThreshold);
  const calculationRent = money(input.basicRent);
  const cappedCalculationRent = money(Math.min(calculationRent, rentCap));
  const baseRent = value(size === 1 ? rules.baseRentSingleHousehold : rules.baseRentMultiPersonHousehold);
  const qualityThreshold = value(rules.qualityDiscountThreshold);
  const cappingThreshold = size <= 2
    ? value(rules.cappingThresholdOneOrTwoPersons)
    : value(rules.cappingThresholdThreeOrMorePersons);
  const partA = money(
    Math.max(Math.min(cappedCalculationRent, qualityThreshold) - baseRent, 0) *
      value(rules.qualityDiscountReimbursementPercent) / 100,
  );
  const partB = under21Only
    ? 0
    : money(Math.max(Math.min(cappedCalculationRent, cappingThreshold) - qualityThreshold, 0) *
        value(rules.cappingBandReimbursementPercent) / 100);
  const partC = under21Only
    ? 0
    : money(Math.max(cappedCalculationRent - cappingThreshold, 0) *
        value(rules.aboveCappingReimbursementPercent) / 100);
  const householdIncomeUsed = incomeFromMembers(input);
  const referenceIncome = size === 1
    ? value(rules.incomeReferencePointSingleHousehold)
    : value(rules.incomeReferencePointMultiPersonHousehold);
  const taperPercent = size === 1
    ? value(rules.incomeTaperSingleHousehold)
    : value(rules.incomeTaperMultiPersonHousehold);
  const incomeCorrection = money(Math.max(householdIncomeUsed - referenceIncome, 0) * taperPercent / 100 / 12);
  const monthlyAmount = Math.floor(Math.max(partA + partB + partC - incomeCorrection, 0));

  return deepFreeze({
    eligibilityStatus: monthlyAmount > 0 ? "calculated" : "ineligible",
    monthlyAmount,
    yearlyAmount: monthlyAmount * 12,
    cappedCalculationRent,
    baseRent,
    calculationRent,
    householdIncomeUsed,
    components: {
      qualityDiscountPart: partA,
      cappingBandPart: partB,
      aboveCappingPart: partC,
      incomeCorrection,
    },
    reasonCodes: [
      monthlyAmount > 0 ? "rent-benefit-calculated" : "rent-benefit-zero-after-income-correction",
      ...(calculationRent > cappedCalculationRent ? ["rent-calculation-rent-capped"] : []),
      ...(input.serviceCosts && input.serviceCosts > 0 ? ["rent-service-costs-ignored-2026"] : []),
      ...(under21Only ? ["rent-under-21-cap-applied"] : []),
    ],
    warnings: [],
    sourceDatasetId: DATASET_ID,
    calculationYear: input.calculationYear,
    reliability: "official-standard-scenario",
  });
}
