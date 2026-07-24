import {
  capChildcareContract2026,
  lookupChildcarePercentageBand2026,
  selectFirstChildForChildcare2026,
  type ChildcareContractInput,
  type ChildcareSubsidisableContract,
} from "@/lib/allowances/childcare-helpers";

export type ChildcareBenefitEligibilityStatus =
  | "calculated"
  | "ineligible"
  | "unsupported"
  | "incomplete";

export type ChildcareBenefitSpecialSituation =
  | "partial-year"
  | "variable-hours"
  | "unverified-lrk"
  | "multiple-childcare-types"
  | "manual-review-required";

export type ChildcareBenefitInput = {
  readonly calculationYear: number;
  readonly hasPartner: boolean;
  readonly assessmentIncome: number;
  readonly hasChildren: boolean;
  readonly usesChildcare: boolean;
  readonly childrenLivingWithApplicant: boolean;
  readonly isLrkRegistered: boolean;
  readonly paysOwnContribution: boolean;
  readonly applicantHasQualifyingActivity: boolean;
  readonly partnerHasQualifyingActivity?: boolean | "not-applicable";
  readonly contracts: readonly ChildcareContractInput[];
  readonly specialSituations?: readonly ChildcareBenefitSpecialSituation[];
};

export type ChildcareBenefitContractResult = ChildcareSubsidisableContract & {
  readonly isFirstChild: boolean;
  readonly reimbursementPercentage: number;
  readonly reimbursedMonthlyAmount: number;
};

export type ChildcareBenefitComponents = {
  readonly subsidisableMonthlyCosts: number;
  readonly firstChildMonthlyCosts: number;
  readonly nextChildrenMonthlyCosts: number;
  readonly firstChildReimbursementPercentage: number;
  readonly nextChildReimbursementPercentage: number;
  readonly cappedContractCount: number;
};

export type ChildcareBenefitResult = {
  readonly eligibilityStatus: ChildcareBenefitEligibilityStatus;
  readonly monthlyAmount?: number;
  readonly yearlyAmount?: number;
  readonly firstChildId?: string;
  readonly contracts: readonly ChildcareBenefitContractResult[];
  readonly components: ChildcareBenefitComponents;
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

function money(value: number) {
  return Math.round(value * 100) / 100;
}

function emptyComponents(): ChildcareBenefitComponents {
  return {
    subsidisableMonthlyCosts: 0,
    firstChildMonthlyCosts: 0,
    nextChildrenMonthlyCosts: 0,
    firstChildReimbursementPercentage: 0,
    nextChildReimbursementPercentage: 0,
    cappedContractCount: 0,
  };
}

function blocked(
  eligibilityStatus: ChildcareBenefitEligibilityStatus,
  calculationYear: number,
  reasonCodes: readonly string[],
): ChildcareBenefitResult {
  return deepFreeze({
    eligibilityStatus,
    contracts: [],
    components: emptyComponents(),
    reasonCodes,
    warnings: eligibilityStatus === "unsupported" ? ["manual-review-required"] : [],
    sourceDatasetId: DATASET_ID,
    calculationYear,
    reliability: eligibilityStatus === "incomplete" ? "incomplete" : "blocked",
  });
}

function ineligible(reasonCodes: readonly string[], calculationYear: number): ChildcareBenefitResult {
  return deepFreeze({
    eligibilityStatus: "ineligible",
    monthlyAmount: 0,
    yearlyAmount: 0,
    contracts: [],
    components: emptyComponents(),
    reasonCodes,
    warnings: [],
    sourceDatasetId: DATASET_ID,
    calculationYear,
    reliability: "official-standard-scenario",
  });
}

function hasInvalidNumber(value: number | undefined) {
  return value !== undefined && (!Number.isFinite(value) || value < 0);
}

function validateInput(input: ChildcareBenefitInput) {
  const reasonCodes: string[] = [];
  if (input.calculationYear !== 2026) reasonCodes.push("unsupported-calculation-year");
  if (hasInvalidNumber(input.assessmentIncome)) reasonCodes.push("invalid-assessmentIncome");
  for (const [index, contract] of input.contracts.entries()) {
    if (!contract.childId.trim()) reasonCodes.push(`invalid-contract-${index}-childId`);
    if (hasInvalidNumber(contract.hoursPerMonth)) reasonCodes.push(`invalid-contract-${index}-hoursPerMonth`);
    if (hasInvalidNumber(contract.hourlyRate)) reasonCodes.push(`invalid-contract-${index}-hourlyRate`);
  }
  return reasonCodes;
}

export function calculateChildcareBenefit2026(input: ChildcareBenefitInput): ChildcareBenefitResult {
  const invalidReasonCodes = validateInput(input);
  if (invalidReasonCodes.length > 0) {
    return blocked(input.calculationYear === 2026 ? "incomplete" : "unsupported", input.calculationYear, invalidReasonCodes);
  }
  if ((input.specialSituations ?? []).includes("partial-year") || (input.specialSituations ?? []).includes("variable-hours")) {
    return blocked("unsupported", input.calculationYear, [
      "partial-year-not-supported",
      "manual-review-required",
    ]);
  }
  if ((input.specialSituations ?? []).includes("manual-review-required") || (input.specialSituations ?? []).includes("unverified-lrk")) {
    return blocked("unsupported", input.calculationYear, [
      "childcare-situation-complex",
      "manual-review-required",
    ]);
  }
  if (!input.hasChildren) return ineligible(["childcare-no-children"], input.calculationYear);
  if (!input.usesChildcare) return ineligible(["childcare-no-care"], input.calculationYear);
  if (!input.childrenLivingWithApplicant) return ineligible(["childcare-child-residence-excluded"], input.calculationYear);
  if (!input.isLrkRegistered) return ineligible(["childcare-care-not-registered"], input.calculationYear);
  if (!input.paysOwnContribution) return ineligible(["childcare-no-own-contribution"], input.calculationYear);
  if (!input.applicantHasQualifyingActivity) return ineligible(["childcare-no-qualifying-activity"], input.calculationYear);
  if (input.hasPartner && input.partnerHasQualifyingActivity !== true) {
    return ineligible(["childcare-partner-no-qualifying-activity"], input.calculationYear);
  }
  if (input.contracts.length === 0) {
    return blocked("incomplete", input.calculationYear, ["missing-childcare-contracts"]);
  }

  const percentageBand = lookupChildcarePercentageBand2026(input.assessmentIncome);
  const firstChildSelection = selectFirstChildForChildcare2026(input.contracts);
  if (!percentageBand || !firstChildSelection) {
    return blocked("incomplete", input.calculationYear, ["missing-childcare-percentage-band"]);
  }

  let subsidisableMonthlyCosts = 0;
  let firstChildMonthlyCosts = 0;
  let nextChildrenMonthlyCosts = 0;
  let cappedContractCount = 0;

  const contracts = input.contracts.map((contract) => {
    const capped = capChildcareContract2026(contract);
    const isFirstChild = capped.childId === firstChildSelection.firstChildId;
    const reimbursementPercentage = isFirstChild
      ? percentageBand.firstChildPercent
      : percentageBand.nextChildPercent;
    const reimbursedMonthlyAmount = money(capped.subsidisableCosts * reimbursementPercentage / 100);

    subsidisableMonthlyCosts = money(subsidisableMonthlyCosts + capped.subsidisableCosts);
    if (isFirstChild) {
      firstChildMonthlyCosts = money(firstChildMonthlyCosts + capped.subsidisableCosts);
    } else {
      nextChildrenMonthlyCosts = money(nextChildrenMonthlyCosts + capped.subsidisableCosts);
    }
    if (capped.cappedHours !== contract.hoursPerMonth || capped.cappedHourlyRate !== contract.hourlyRate) {
      cappedContractCount += 1;
    }

    return {
      ...capped,
      isFirstChild,
      reimbursementPercentage,
      reimbursedMonthlyAmount,
    };
  });
  const unroundedMonthlyAmount = contracts.reduce((sum, contract) => sum + contract.reimbursedMonthlyAmount, 0);
  const monthlyAmount = Math.floor(unroundedMonthlyAmount);

  return deepFreeze({
    eligibilityStatus: monthlyAmount > 0 ? "calculated" : "ineligible",
    monthlyAmount,
    yearlyAmount: monthlyAmount * 12,
    firstChildId: firstChildSelection.firstChildId,
    contracts,
    components: {
      subsidisableMonthlyCosts,
      firstChildMonthlyCosts,
      nextChildrenMonthlyCosts,
      firstChildReimbursementPercentage: percentageBand.firstChildPercent,
      nextChildReimbursementPercentage: percentageBand.nextChildPercent,
      cappedContractCount,
    },
    reasonCodes: [
      monthlyAmount > 0 ? "childcare-calculated" : "childcare-zero-after-reimbursement",
      "childcare-first-child-rule-applied",
      ...(cappedContractCount > 0 ? ["childcare-hours-or-rate-capped"] : []),
      ...(input.contracts.length > 1 ? ["childcare-multiple-contracts-calculated"] : []),
    ],
    warnings: [],
    sourceDatasetId: DATASET_ID,
    calculationYear: input.calculationYear,
    reliability: "official-standard-scenario",
  });
}
