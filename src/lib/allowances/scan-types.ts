import type { AllowanceKind } from "@/lib/allowances/signaling";

export type PublicAllowanceBenefitStatus =
  | "calculated"
  | "no-entitlement"
  | "incomplete-input"
  | "unsupported"
  | "manual-review"
  | "signal-only"
  | "unavailable";

export type PublicAllowanceReliability =
  | "official-standard-scenario"
  | "strong-indication"
  | "reasonable-indication"
  | "preliminary"
  | "blocked"
  | "incomplete";

export type PublicAllowanceHouseholdMember = {
  readonly id: string;
  readonly age: number;
  readonly income?: number;
  readonly assets: number;
  readonly isChildOfApplicantOrPartner?: boolean;
  readonly excludedAsSubtenant?: boolean;
};

export type PublicAllowanceChild = {
  readonly id: string;
  readonly age: number;
  readonly receivesChildBenefitOrMeetsMaintenanceCondition: boolean;
  readonly livesWithApplicant: boolean;
  readonly coParenting?: boolean;
  readonly compositeFamily?: boolean;
};

export type PublicChildcareContract = {
  readonly childId: string;
  readonly careType?: "daycare" | "after-school" | "childminder";
  readonly hoursPerMonth?: number;
  readonly hourlyRate?: number;
  readonly isLrkRegistered?: boolean;
  readonly paysOwnContribution?: boolean;
};

export type PublicAllowanceUnsupportedSituation =
  | "foreign-residence-factor"
  | "co-parenting"
  | "composite-family"
  | "partial-year"
  | "manual-review-required";

export type PublicAllowanceScanInput = {
  readonly calculationYear: 2026;
  readonly applicant: {
    readonly age?: number;
    readonly assessmentIncome?: number;
    readonly assets?: number;
    readonly hasDutchHealthInsurance?: boolean;
  };
  readonly partner?: {
    readonly age?: number;
    readonly assessmentIncome?: number;
    readonly assets?: number;
  };
  readonly household: {
    readonly hasPartner?: boolean;
    readonly householdIncome?: number;
    readonly householdMembers: readonly PublicAllowanceHouseholdMember[];
  };
  readonly children: readonly PublicAllowanceChild[];
  readonly assets: {
    readonly applicant?: number;
    readonly partner?: number;
    readonly householdMembers: readonly { readonly memberId: string; readonly assets: number }[];
  };
  readonly housing: {
    readonly tenure?: "rent" | "owner" | "other";
    readonly residenceCountry?: "NL" | "other";
  };
  readonly rent?: {
    readonly isIndependentHome?: boolean;
    readonly basicRent?: number;
    readonly serviceCosts?: number;
    readonly hasChildOrDisabilityExceptionWhenUnder21?: boolean;
    readonly specialSituations: readonly ("special-housing-situation" | "partial-year" | "moving-household" | "subtenant")[];
  };
  readonly childcare: {
    readonly usesChildcare?: boolean;
    readonly contracts: readonly PublicChildcareContract[];
    readonly applicantHasQualifyingActivity?: boolean;
    readonly partnerHasQualifyingActivity?: boolean | "not-applicable";
  };
  readonly calculationPeriod: {
    readonly kind?: "full-year" | "partial-year";
  };
  readonly unsupportedSituations: readonly PublicAllowanceUnsupportedSituation[];
};

export type PublicAllowanceBenefitResult = {
  readonly allowanceType: AllowanceKind;
  readonly status: PublicAllowanceBenefitStatus;
  readonly monthlyAmount?: number;
  readonly yearlyAmount?: number;
  readonly reliability: PublicAllowanceReliability;
  readonly reasonCodes: readonly string[];
  readonly warnings: readonly string[];
  readonly components: Readonly<Record<string, number | string | boolean>>;
  readonly sourceDatasetId: string;
  readonly calculationYear: number;
  readonly assumptions: readonly string[];
  readonly nextStep: string;
};

export type AllowanceAdapterIssue = {
  readonly code: string;
  readonly field?: string;
};

export type AllowanceAdapterResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly issues: readonly AllowanceAdapterIssue[] };

export function amountContributesToTotal(result: PublicAllowanceBenefitResult) {
  return result.status === "calculated" ||
    (result.status === "no-entitlement" &&
      result.monthlyAmount === 0 &&
      result.yearlyAmount === 0);
}
