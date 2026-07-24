import type {
  ChildBudgetInput,
  ChildBudgetResult,
} from "@/lib/allowances/child-budget";
import { calculateChildBudget2026 } from "@/lib/allowances/child-budget";
import type {
  ChildcareBenefitInput,
  ChildcareBenefitResult,
} from "@/lib/allowances/childcare-benefit";
import { calculateChildcareBenefit2026 } from "@/lib/allowances/childcare-benefit";
import type { ChildcareCareType } from "@/lib/allowances/childcare-helpers";
import type {
  OfficialAllowanceCalculationResult,
} from "@/lib/allowances/official-calculations";
import type {
  RentBenefitInput,
  RentBenefitResult,
} from "@/lib/allowances/rent-benefit";
import { calculateRentBenefit2026 } from "@/lib/allowances/rent-benefit";
import type {
  AllowanceAdapterIssue,
  AllowanceAdapterResult,
  PublicAllowanceBenefitResult,
  PublicAllowanceScanInput,
} from "@/lib/allowances/scan-types";

const DATASET_ID = "allowance-calculation-rules-2026";

function missing(field: string): AllowanceAdapterIssue {
  return { code: `missing-${field}`, field };
}

function blocker(code: string, field?: string): AllowanceAdapterIssue {
  return { code, field };
}

function hasPartner(input: PublicAllowanceScanInput) {
  return input.household.hasPartner === true;
}

function isFullYear(input: PublicAllowanceScanInput) {
  return input.calculationPeriod.kind === "full-year";
}

function issuesToPublicResult(
  allowanceType: PublicAllowanceBenefitResult["allowanceType"],
  issues: readonly AllowanceAdapterIssue[],
  calculationYear = 2026,
): PublicAllowanceBenefitResult {
  const reasonCodes = issues.map((issue) => issue.code);
  const manualReview = reasonCodes.includes("manual-review-required");
  const unsupported = reasonCodes.some((code) =>
    code.startsWith("unsupported-") || code === "partial-year-not-supported",
  );

  return {
    allowanceType,
    status: manualReview ? "manual-review" : unsupported ? "unsupported" : "incomplete-input",
    reliability: unsupported || manualReview ? "blocked" : "incomplete",
    reasonCodes,
    warnings: manualReview ? ["manual-review-required"] : [],
    components: {},
    sourceDatasetId: DATASET_ID,
    calculationYear,
    assumptions: [],
    nextStep: unsupported || manualReview
      ? "Gebruik de officiele proefberekening voor deze situatie."
      : "Vul de ontbrekende gegevens aan voordat de scan een bedrag berekent.",
  };
}

export function mapScanInputToRentBenefitInput(
  input: PublicAllowanceScanInput,
): AllowanceAdapterResult<RentBenefitInput> {
  const issues: AllowanceAdapterIssue[] = [];
  if (input.housing.tenure !== "rent") {
    return { ok: false, issues: [blocker("rent-not-renting", "housing.tenure")] };
  }
  if (!isFullYear(input)) issues.push(blocker("partial-year-not-supported", "calculationPeriod"));
  if (input.rent?.specialSituations.includes("special-housing-situation")) {
    issues.push(blocker("unsupported-special-housing-situation", "rent.specialSituations"));
  }
  if (input.rent?.specialSituations.includes("moving-household")) {
    issues.push(blocker("partial-year-not-supported", "rent.specialSituations"));
  }
  if (input.applicant.age === undefined) issues.push(missing("age"));
  if (input.household.hasPartner === undefined) issues.push(missing("partner-status"));
  if (hasPartner(input) && input.partner?.age === undefined) issues.push(missing("partner-age"));
  if (input.rent?.isIndependentHome === undefined) issues.push(missing("rent-independent-home"));
  if (input.rent?.basicRent === undefined) issues.push(missing("rent-basic-rent"));
  if (input.applicant.assets === undefined) issues.push(missing("assets"));
  if (hasPartner(input) && input.partner?.assets === undefined) issues.push(missing("joint-assets"));

  const coResidents = input.household.householdMembers;
  if (coResidents.some((member) => member.assets === undefined)) {
    issues.push(missing("household-assets"));
  }
  if (coResidents.length > 0 && input.household.householdIncome === undefined) {
    issues.push(missing("household-income"));
  }

  if (issues.length > 0) return { ok: false, issues };

  return {
    ok: true,
    value: {
      calculationYear: input.calculationYear,
      applicantAge: input.applicant.age as number,
      hasPartner: hasPartner(input),
      partnerAge: hasPartner(input) ? input.partner?.age : undefined,
      isIndependentHome: input.rent?.isIndependentHome as boolean,
      basicRent: input.rent?.basicRent as number,
      serviceCosts: input.rent?.serviceCosts,
      householdIncome: input.household.householdIncome ??
        (hasPartner(input) ? input.partner?.assessmentIncome : input.applicant.assessmentIncome),
      applicantIncome: input.applicant.assessmentIncome,
      partnerIncome: hasPartner(input) ? input.partner?.assessmentIncome : undefined,
      applicantAssets: input.applicant.assets as number,
      partnerAssets: hasPartner(input) ? input.partner?.assets : undefined,
      coResidents,
      hasChildOrDisabilityExceptionWhenUnder21: input.rent?.hasChildOrDisabilityExceptionWhenUnder21,
      specialSituations: input.rent?.specialSituations,
    },
  };
}

export function mapScanInputToChildBudgetInput(
  input: PublicAllowanceScanInput,
): AllowanceAdapterResult<ChildBudgetInput> {
  const issues: AllowanceAdapterIssue[] = [];
  if (!isFullYear(input)) issues.push(blocker("partial-year-not-supported", "calculationPeriod"));
  if (input.housing.residenceCountry === "other") {
    issues.push(blocker("unsupported-foreign-residence-factor", "housing.residenceCountry"));
  } else if (input.housing.residenceCountry === undefined) {
    issues.push(missing("residence-country"));
  }
  if (input.household.hasPartner === undefined) issues.push(missing("partner-status"));
  if (input.applicant.assets === undefined) issues.push(missing("assets"));
  if (hasPartner(input) && input.partner?.assets === undefined) issues.push(missing("joint-assets"));
  const income = hasPartner(input) ? input.partner?.assessmentIncome : input.applicant.assessmentIncome;
  if (income === undefined) issues.push(hasPartner(input) ? missing("joint-income") : missing("income"));
  if (input.children.length === 0) issues.push(blocker("child-budget-no-children", "children"));
  if (input.children.some((child) => child.livesWithApplicant === false)) {
    issues.push(blocker("child-budget-child-residence-excluded", "children.livesWithApplicant"));
  }
  if (input.children.some((child) => child.coParenting)) {
    issues.push(blocker("unsupported-co-parenting", "children.coParenting"));
  }
  if (input.children.some((child) => child.compositeFamily)) {
    issues.push(blocker("manual-review-required", "children.compositeFamily"));
  }

  if (issues.length > 0) return { ok: false, issues };

  return {
    ok: true,
    value: {
      calculationYear: input.calculationYear,
      hasPartner: hasPartner(input),
      assessmentIncome: income as number,
      applicantAssets: input.applicant.assets as number,
      partnerAssets: hasPartner(input) ? input.partner?.assets : undefined,
      children: input.children.map((child) => ({
        age: child.age,
        receivesChildBenefitOrMeetsMaintenanceCondition:
          child.receivesChildBenefitOrMeetsMaintenanceCondition,
      })),
      residenceCountry: "NL",
    },
  };
}

function childcareCareType(careType: "daycare" | "after-school" | "childminder" | undefined): ChildcareCareType | undefined {
  if (careType === "daycare") return "daycare";
  if (careType === "after-school") return "out-of-school-care";
  if (careType === "childminder") return "childminder-care";
  return undefined;
}

export function mapScanInputToChildcareBenefitInput(
  input: PublicAllowanceScanInput,
): AllowanceAdapterResult<ChildcareBenefitInput> {
  const issues: AllowanceAdapterIssue[] = [];
  const usesChildcare = input.childcare.usesChildcare;
  const hasPartnerValue = hasPartner(input);
  const income = hasPartnerValue ? input.partner?.assessmentIncome : input.applicant.assessmentIncome;

  if (!isFullYear(input)) issues.push(blocker("partial-year-not-supported", "calculationPeriod"));
  if (input.household.hasPartner === undefined) issues.push(missing("partner-status"));
  if (income === undefined) issues.push(hasPartnerValue ? missing("joint-income") : missing("income"));
  if (input.children.length === 0) issues.push(blocker("childcare-no-children", "children"));
  if (usesChildcare === undefined) issues.push(missing("childcare-care-use"));
  if (usesChildcare === false) issues.push(blocker("childcare-no-care", "childcare.usesChildcare"));
  if (input.children.some((child) => child.livesWithApplicant === false)) {
    issues.push(blocker("childcare-child-residence-excluded", "children.livesWithApplicant"));
  }
  if (input.children.some((child) => child.coParenting || child.compositeFamily)) {
    issues.push(blocker("manual-review-required", "children"));
  }
  if (input.childcare.applicantHasQualifyingActivity === undefined) {
    issues.push(missing("childcare-applicant-activity"));
  }
  if (input.childcare.applicantHasQualifyingActivity === false) {
    issues.push(blocker("childcare-no-qualifying-activity", "childcare.applicantHasQualifyingActivity"));
  }
  if (hasPartnerValue && input.childcare.partnerHasQualifyingActivity === undefined) {
    issues.push(missing("childcare-partner-activity"));
  }
  if (hasPartnerValue && input.childcare.partnerHasQualifyingActivity === false) {
    issues.push(blocker("childcare-partner-no-qualifying-activity", "childcare.partnerHasQualifyingActivity"));
  }
  if (input.childcare.contracts.length === 0 && usesChildcare === true) {
    issues.push(missing("childcare-contracts"));
  }

  const mappedContracts = input.childcare.contracts.map((contract, index) => {
    const mappedCareType = childcareCareType(contract.careType);
    if (!mappedCareType) issues.push(missing(`childcare-contract-${index + 1}-care-type`));
    if (contract.hoursPerMonth === undefined) issues.push(missing("childcare-hours"));
    if (contract.hourlyRate === undefined) issues.push(missing("childcare-hourly-rate"));
    if (contract.isLrkRegistered === undefined) {
      issues.push(missing("childcare-care-registration"));
    } else if (!contract.isLrkRegistered) {
      issues.push(blocker("childcare-care-not-registered", "childcare.contracts.isLrkRegistered"));
    }
    if (contract.paysOwnContribution === undefined) {
      issues.push(missing("childcare-own-contribution"));
    } else if (!contract.paysOwnContribution) {
      issues.push(blocker("childcare-no-own-contribution", "childcare.contracts.paysOwnContribution"));
    }
    return {
      childId: contract.childId,
      careType: mappedCareType,
      hoursPerMonth: contract.hoursPerMonth,
      hourlyRate: contract.hourlyRate,
    };
  });

  if (issues.length > 0) return { ok: false, issues };

  return {
    ok: true,
    value: {
      calculationYear: input.calculationYear,
      hasPartner: hasPartnerValue,
      assessmentIncome: income as number,
      hasChildren: input.children.length > 0,
      usesChildcare: usesChildcare as boolean,
      childrenLivingWithApplicant: input.children.every((child) => child.livesWithApplicant),
      isLrkRegistered: input.childcare.contracts.every((contract) => contract.isLrkRegistered === true),
      paysOwnContribution: input.childcare.contracts.every((contract) => contract.paysOwnContribution === true),
      applicantHasQualifyingActivity: input.childcare.applicantHasQualifyingActivity as boolean,
      partnerHasQualifyingActivity: hasPartnerValue
        ? input.childcare.partnerHasQualifyingActivity
        : "not-applicable",
      contracts: mappedContracts.map((contract) => ({
        childId: contract.childId,
        careType: contract.careType as ChildcareCareType,
        hoursPerMonth: contract.hoursPerMonth as number,
        hourlyRate: contract.hourlyRate as number,
      })),
      specialSituations: [
        ...(input.unsupportedSituations.includes("partial-year") ? ["partial-year" as const] : []),
        ...(input.unsupportedSituations.includes("manual-review-required") ? ["manual-review-required" as const] : []),
      ],
    },
  };
}

export function mapRentBenefitResultToScanResult(
  result: RentBenefitResult,
): PublicAllowanceBenefitResult {
  const isNoEntitlement = result.eligibilityStatus === "ineligible";
  return {
    allowanceType: "rent",
    status: result.eligibilityStatus === "calculated"
      ? "calculated"
      : isNoEntitlement
        ? "no-entitlement"
        : result.eligibilityStatus === "unsupported"
          ? "unsupported"
          : "incomplete-input",
    monthlyAmount: result.monthlyAmount,
    yearlyAmount: result.yearlyAmount,
    reliability: result.reliability,
    reasonCodes: result.reasonCodes,
    warnings: result.warnings,
    components: {
      qualityDiscountPart: result.components.qualityDiscountPart,
      cappingBandPart: result.components.cappingBandPart,
      aboveCappingPart: result.components.aboveCappingPart,
      incomeCorrection: result.components.incomeCorrection,
      ...(result.calculationRent !== undefined ? { calculationRent: result.calculationRent } : {}),
      ...(result.cappedCalculationRent !== undefined ? { cappedCalculationRent: result.cappedCalculationRent } : {}),
      ...(result.householdIncomeUsed !== undefined ? { householdIncomeUsed: result.householdIncomeUsed } : {}),
    },
    sourceDatasetId: result.sourceDatasetId,
    calculationYear: result.calculationYear,
    assumptions: [
      "Standaardscenario 2026.",
      "Servicekosten worden niet als kale huur meegerekend.",
    ],
    nextStep: result.eligibilityStatus === "calculated"
      ? "Controleer de indicatie in Mijn Toeslagen voordat je aanvraagt of wijzigt."
      : "Controleer de hoofdreden en gebruik bij twijfel de officiele proefberekening.",
  };
}

export function mapChildBudgetResultToScanResult(
  result: ChildBudgetResult,
): PublicAllowanceBenefitResult {
  const isNoEntitlement = result.eligibilityStatus === "ineligible";
  return {
    allowanceType: "child-budget",
    status: result.eligibilityStatus === "calculated"
      ? "calculated"
      : isNoEntitlement
        ? "no-entitlement"
        : result.eligibilityStatus === "unsupported"
          ? "unsupported"
          : "incomplete-input",
    monthlyAmount: result.monthlyAmount,
    yearlyAmount: result.yearlyAmount,
    reliability: result.reliability,
    reasonCodes: result.reasonCodes,
    warnings: result.warnings,
    components: {
      ...(result.baseChildAmount !== undefined ? { baseChildAmount: result.baseChildAmount } : {}),
      ...(result.olderChildSupplements !== undefined ? { olderChildSupplements: result.olderChildSupplements } : {}),
      ...(result.singleParentSupplement !== undefined ? { singleParentSupplement: result.singleParentSupplement } : {}),
      ...(result.incomeReduction !== undefined ? { incomeReduction: result.incomeReduction } : {}),
      ...(result.maximumYearlyAmount !== undefined ? { maximumYearlyAmount: result.maximumYearlyAmount } : {}),
    },
    sourceDatasetId: result.sourceDatasetId,
    calculationYear: result.calculationYear,
    assumptions: [
      "Standaardscenario 2026.",
      "Alleen Nederlandse woonlandfactor wordt publiek ondersteund.",
    ],
    nextStep: result.eligibilityStatus === "calculated"
      ? "Controleer de indicatie in Mijn Toeslagen voordat je aanvraagt of wijzigt."
      : "Controleer de hoofdreden en gebruik bij twijfel de officiele proefberekening.",
  };
}

export function mapChildcareBenefitResultToScanResult(
  result: ChildcareBenefitResult,
): PublicAllowanceBenefitResult {
  const isNoEntitlement = result.eligibilityStatus === "ineligible";
  return {
    allowanceType: "childcare",
    status: result.eligibilityStatus === "calculated"
      ? "calculated"
      : isNoEntitlement
        ? "no-entitlement"
        : result.eligibilityStatus === "unsupported"
          ? "unsupported"
          : "incomplete-input",
    monthlyAmount: result.monthlyAmount,
    yearlyAmount: result.yearlyAmount,
    reliability: result.reliability,
    reasonCodes: result.reasonCodes,
    warnings: result.warnings,
    components: {
      subsidisableMonthlyCosts: result.components.subsidisableMonthlyCosts,
      firstChildMonthlyCosts: result.components.firstChildMonthlyCosts,
      nextChildrenMonthlyCosts: result.components.nextChildrenMonthlyCosts,
      firstChildReimbursementPercentage: result.components.firstChildReimbursementPercentage,
      nextChildReimbursementPercentage: result.components.nextChildReimbursementPercentage,
      cappedContractCount: result.components.cappedContractCount,
      ...(result.firstChildId !== undefined ? { firstChildId: result.firstChildId } : {}),
    },
    sourceDatasetId: result.sourceDatasetId,
    calculationYear: result.calculationYear,
    assumptions: [
      "Standaardscenario 2026.",
      "Opvanguren en uurtarief zijn als maandgemiddelde per kind en opvangsoort opgegeven.",
    ],
    nextStep: result.eligibilityStatus === "calculated"
      ? "Controleer de indicatie in Mijn Toeslagen voordat je aanvraagt of wijzigt."
      : "Controleer de hoofdreden en gebruik bij twijfel de officiele proefberekening.",
  };
}

export function mapExistingHealthBenefitResultToScanResult(
  result: OfficialAllowanceCalculationResult,
): PublicAllowanceBenefitResult {
  return {
    allowanceType: "healthcare",
    status: result.status === "available" && result.amount.monthlyAmount !== undefined
      ? "calculated"
      : result.eligibilityStatus === "fails-known-hard-checks"
        ? "no-entitlement"
        : result.status === "incomplete"
          ? "incomplete-input"
          : result.status === "special-case"
            ? "manual-review"
            : "unavailable",
    monthlyAmount: result.amount.monthlyAmount,
    yearlyAmount: result.amount.annualAmount,
    reliability: result.status === "available" ? "strong-indication" : "preliminary",
    reasonCodes: result.reasonCodes,
    warnings: result.uncertaintyCodes,
    components: {},
    sourceDatasetId: result.datasetId,
    calculationYear: result.calculationYear,
    assumptions: ["Bestaande centrale zorgtoeslagberekening blijft ongewijzigd."],
    nextStep: "Controleer de indicatie in Mijn Toeslagen voordat je aanvraagt of wijzigt.",
  };
}

export function adapterIssuesToScanResult(
  allowanceType: PublicAllowanceBenefitResult["allowanceType"],
  issues: readonly AllowanceAdapterIssue[],
): PublicAllowanceBenefitResult {
  return issuesToPublicResult(allowanceType, issues);
}

export function calculateRentBenefitScanResult(
  input: PublicAllowanceScanInput,
): PublicAllowanceBenefitResult {
  const mapped = mapScanInputToRentBenefitInput(input);
  return mapped.ok
    ? mapRentBenefitResultToScanResult(calculateRentBenefit2026(mapped.value))
    : adapterIssuesToScanResult("rent", mapped.issues);
}

export function calculateChildBudgetScanResult(
  input: PublicAllowanceScanInput,
): PublicAllowanceBenefitResult {
  const mapped = mapScanInputToChildBudgetInput(input);
  return mapped.ok
    ? mapChildBudgetResultToScanResult(calculateChildBudget2026(mapped.value))
    : adapterIssuesToScanResult("child-budget", mapped.issues);
}

export function calculateChildcareBenefitScanResult(
  input: PublicAllowanceScanInput,
): PublicAllowanceBenefitResult {
  const mapped = mapScanInputToChildcareBenefitInput(input);
  return mapped.ok
    ? mapChildcareBenefitResultToScanResult(calculateChildcareBenefit2026(mapped.value))
    : adapterIssuesToScanResult("childcare", mapped.issues);
}
