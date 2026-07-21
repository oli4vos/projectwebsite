import { ALLOWANCE_CALCULATION_RULES_2026 } from "@/lib/financial-constants/allowance-calculation-rules-2026";

export type ChildBudgetEligibilityStatus =
  | "calculated"
  | "ineligible"
  | "unsupported"
  | "incomplete";

export type ChildBudgetSpecialSituation =
  | "foreign-residence-factor"
  | "co-parenting"
  | "composite-family"
  | "partial-year"
  | "age-change-during-year";

export type ChildBudgetChildInput = {
  readonly age: number;
  readonly receivesChildBenefitOrMeetsMaintenanceCondition: boolean;
};

export type ChildBudgetInput = {
  readonly calculationYear: number;
  readonly hasPartner: boolean;
  readonly assessmentIncome: number;
  readonly applicantAssets: number;
  readonly partnerAssets?: number;
  readonly children: readonly ChildBudgetChildInput[];
  readonly residenceCountry: "NL" | "other";
  readonly specialSituations?: readonly ChildBudgetSpecialSituation[];
};

export type ChildBudgetResult = {
  readonly eligibilityStatus: ChildBudgetEligibilityStatus;
  readonly maximumYearlyAmount?: number;
  readonly baseChildAmount?: number;
  readonly olderChildSupplements?: number;
  readonly singleParentSupplement?: number;
  readonly incomeReduction?: number;
  readonly yearlyAmount?: number;
  readonly monthlyAmount?: number;
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

function blocked(
  eligibilityStatus: ChildBudgetEligibilityStatus,
  calculationYear: number,
  reasonCodes: readonly string[],
): ChildBudgetResult {
  return deepFreeze({
    eligibilityStatus,
    reasonCodes,
    warnings: eligibilityStatus === "unsupported" ? ["manual-review-required"] : [],
    sourceDatasetId: DATASET_ID,
    calculationYear,
    reliability: eligibilityStatus === "incomplete" ? "incomplete" : "blocked",
  });
}

function hasInvalidNumber(valueToCheck: number | undefined) {
  return valueToCheck !== undefined && (!Number.isFinite(valueToCheck) || valueToCheck < 0);
}

function baseAmount(childCount: number, hasPartner: boolean) {
  const rules = ALLOWANCE_CALCULATION_RULES_2026.childBudget;
  if (childCount <= 0) return 0;
  if (hasPartner) {
    return childCount === 1
      ? value(rules.maxAnnualOneChildWithPartner)
      : value(rules.maxAnnualTwoChildrenWithPartner) +
          Math.max(childCount - 2, 0) * value(rules.additionalAnnualFromThirdChild);
  }
  return childCount === 1
    ? value(rules.maxAnnualOneChildSingleParent)
    : value(rules.maxAnnualTwoChildrenSingleParent) +
        Math.max(childCount - 2, 0) * value(rules.additionalAnnualFromThirdChild);
}

function partnerSupplement(childCount: number) {
  const rules = ALLOWANCE_CALCULATION_RULES_2026.childBudget;
  if (childCount <= 0) return 0;
  const withPartner = childCount === 1
    ? value(rules.maxAnnualOneChildWithPartner)
    : value(rules.maxAnnualTwoChildrenWithPartner) +
        Math.max(childCount - 2, 0) * value(rules.additionalAnnualFromThirdChild);
  const single = childCount === 1
    ? value(rules.maxAnnualOneChildSingleParent)
    : value(rules.maxAnnualTwoChildrenSingleParent) +
        Math.max(childCount - 2, 0) * value(rules.additionalAnnualFromThirdChild);
  return money(single - withPartner);
}

function ageSupplements(children: readonly ChildBudgetChildInput[]) {
  const rules = ALLOWANCE_CALCULATION_RULES_2026.childBudget;
  return children.reduce((sum, child) => {
    if (child.age >= 16 && child.age < 18) return sum + value(rules.ageIncrease16To17);
    if (child.age >= 12 && child.age < 16) return sum + value(rules.ageIncrease12To15);
    return sum;
  }, 0);
}

export function calculateChildBudget2026(input: ChildBudgetInput): ChildBudgetResult {
  if (input.calculationYear !== 2026) {
    return blocked("unsupported", input.calculationYear, ["unsupported-calculation-year"]);
  }
  const invalidReasonCodes = [
    hasInvalidNumber(input.assessmentIncome) ? "invalid-assessmentIncome" : undefined,
    hasInvalidNumber(input.applicantAssets) ? "invalid-applicantAssets" : undefined,
    hasInvalidNumber(input.partnerAssets) ? "invalid-partnerAssets" : undefined,
    ...input.children.flatMap((child, index) => [
      hasInvalidNumber(child.age) || child.age > 120 ? `invalid-child-${index}-age` : undefined,
    ]),
  ].filter(Boolean) as string[];
  if (invalidReasonCodes.length > 0) {
    return blocked("incomplete", input.calculationYear, invalidReasonCodes);
  }
  if (input.residenceCountry !== "NL") {
    return blocked("unsupported", input.calculationYear, [
      "unsupported-foreign-residence-factor",
      "manual-review-required",
    ]);
  }
  if ((input.specialSituations ?? []).includes("co-parenting")) {
    return blocked("unsupported", input.calculationYear, [
      "unsupported-co-parenting",
      "manual-review-required",
    ]);
  }
  if ((input.specialSituations ?? []).includes("partial-year") || (input.specialSituations ?? []).includes("age-change-during-year")) {
    return blocked("unsupported", input.calculationYear, [
      "partial-year-not-supported",
      "manual-review-required",
    ]);
  }

  const eligibleChildren = input.children.filter((child) =>
    child.age < 18 && child.receivesChildBenefitOrMeetsMaintenanceCondition,
  );
  if (eligibleChildren.length === 0) {
    return blocked("ineligible", input.calculationYear, ["child-budget-no-qualifying-children"]);
  }

  const rules = ALLOWANCE_CALCULATION_RULES_2026.childBudget;
  const assetLimit = input.hasPartner ? value(rules.maxAssetsWithPartner) : value(rules.maxAssetsSingle);
  const assets = input.applicantAssets + (input.hasPartner ? input.partnerAssets ?? 0 : 0);
  if (assets > assetLimit) {
    return blocked("ineligible", input.calculationYear, ["child-budget-assets-above-limit"]);
  }

  const baseChildAmount = baseAmount(eligibleChildren.length, input.hasPartner);
  const olderChildSupplements = ageSupplements(eligibleChildren);
  const maximumYearlyBeforeResidenceFactor = money(baseChildAmount + olderChildSupplements);
  const residenceFactor = value(rules.domesticResidenceFactor) / 100;
  const maximumYearlyAmount = money(maximumYearlyBeforeResidenceFactor * residenceFactor);
  const incomeThreshold = input.hasPartner
    ? value(rules.thresholdIncomePartnersChange2026)
    : value(rules.thresholdIncomeSingleParentChange2026);
  const incomeReduction = money(
    Math.max(input.assessmentIncome - incomeThreshold, 0) *
      value(rules.taperPercent) / 100,
  );
  const yearlyAmount = money(Math.max(maximumYearlyAmount - incomeReduction, 0));
  const monthlyAmount = Math.floor(yearlyAmount / 12);

  return deepFreeze({
    eligibilityStatus: monthlyAmount > 0 ? "calculated" : "ineligible",
    maximumYearlyAmount,
    baseChildAmount,
    olderChildSupplements,
    singleParentSupplement: input.hasPartner ? 0 : partnerSupplement(eligibleChildren.length),
    incomeReduction,
    yearlyAmount,
    monthlyAmount,
    reasonCodes: [
      monthlyAmount > 0 ? "child-budget-calculated" : "child-budget-zero-after-income-reduction",
      ...(input.assessmentIncome > incomeThreshold ? ["child-budget-income-reduction-applied"] : []),
      "child-budget-domestic-residence-factor-applied",
    ],
    warnings: [],
    sourceDatasetId: DATASET_ID,
    calculationYear: input.calculationYear,
    reliability: "official-standard-scenario",
  });
}
