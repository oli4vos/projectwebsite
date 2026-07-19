import type {
  AllowanceKind,
  AllowanceSignalStatus,
  AllowanceMissingField,
  AllowanceReasonCode,
  AllowanceUncertaintyCode,
} from "@/lib/allowances/signaling";

export type YesNoUnknown = "yes" | "no" | "unknown";
export type PartnerChoice = YesNoUnknown;
export type TenureChoice = "rent" | "owner" | "other" | "unknown";
export type ChildResidenceChoice = "yes" | "no" | "partial" | "unknown";
export type QualifyingActivityChoice =
  | "work"
  | "study"
  | "trajectory"
  | "none"
  | "unknown";

export type AllowanceScanFormState = {
  age: string;
  partnerStatus: PartnerChoice;
  assessmentIncome: string;
  jointAssessmentIncome: string;
  assets: string;
  jointAssets: string;
  complexSituation: YesNoUnknown;
  foreignOrResidenceSituation: YesNoUnknown;
  specialAssets: YesNoUnknown;
  partYearPartner: YesNoUnknown;
  hasDutchHealthInsurance: YesNoUnknown;
  tenure: TenureChoice;
  independentHome: YesNoUnknown;
  basicRent: string;
  hasCoResidents: YesNoUnknown;
  householdIncome: string;
  householdAssets: string;
  complexHousing: YesNoUnknown;
  adaptedHomeOrDisability: YesNoUnknown;
  uncertainSubsidiableRent: YesNoUnknown;
  hasChildren: YesNoUnknown;
  childCount: string;
  childAges: string;
  receivesChildBenefit: YesNoUnknown;
  childLivesWithApplicant: ChildResidenceChoice;
  complexFamily: YesNoUnknown;
  usesChildcare: YesNoUnknown;
  registeredChildcare: YesNoUnknown;
  paysOwnContribution: YesNoUnknown;
  childcareHoursPerMonth: string;
  applicantActivity: QualifyingActivityChoice;
  partnerActivity: QualifyingActivityChoice;
  complexChildcare: YesNoUnknown;
};

export type AllowanceScanField = keyof AllowanceScanFormState;
export type AllowanceScanErrors = Partial<Record<AllowanceScanField, string>>;

export type AllowanceResultCardView = {
  kind: AllowanceKind;
  title: string;
  status: AllowanceSignalStatus;
  statusLabel: string;
  summary: string;
  hardExclusion: boolean;
  reasonMessages: string[];
  missingFieldMessages: string[];
  uncertaintyMessages: string[];
  officialCalculationUrl: string;
  sourceLinks: {
    label: string;
    href: string;
  }[];
  ruleYear: number;
  datasetId: string;
  datasetVersion: string;
};

export type AllowanceScanView = {
  isValid: boolean;
  errors: AllowanceScanErrors;
  result: null | {
    summary: string;
    ruleYear: number;
    datasetId: string;
    datasetVersion: string;
    cards: AllowanceResultCardView[];
  };
};

export type CopyCoverage = {
  reasonCodes: readonly AllowanceReasonCode[];
  missingFields: readonly AllowanceMissingField[];
  uncertaintyCodes: readonly AllowanceUncertaintyCode[];
};
