import type {
  AllowanceKind,
  AllowanceMissingField,
  AllowanceReasonCode,
  AllowanceUncertaintyCode,
} from "@/lib/allowances/signaling";
import type {
  AllowanceAdvisorReliabilityLabel,
  AllowanceAdvisorReportModel,
} from "@/lib/allowances/advisor-experience";
import type { RegulationId } from "@/lib/regulations/types";
import type {
  QuestionFlowDecision,
  QuestionFlowProgress,
  QuestionFlowQuestionStatus,
} from "@/lib/regulations/question-flow";

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
  partnerAge: string;
  isFullYear: YesNoUnknown;
  residenceCountry: "NL" | "other" | "unknown";
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
  serviceCosts: string;
  hasCoResidents: YesNoUnknown;
  coResidentAges: string;
  coResidentAssets: string;
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

export type AllowancePublicResultStatus =
  | "eligible-estimate"
  | "ineligible"
  | "incomplete"
  | "special-case"
  | "unavailable";

export type AllowanceMissingInputView = {
  label: string;
  whyNeeded: string;
  alternativeQuestions: readonly string[];
  whereToFind: readonly string[];
};

export type AllowanceResultCardView = {
  kind: AllowanceKind;
  title: string;
  status: AllowancePublicResultStatus;
  statusLabel: string;
  summary: string;
  hardExclusion: boolean;
  monthlyAmountLabel?: string;
  annualAmountLabel?: string;
  reliabilityLabel: AllowanceAdvisorReliabilityLabel;
  reliabilityDisplayLabel: string;
  reliabilityDescription: string;
  reasonMessages: string[];
  missingFieldMessages: readonly string[];
  missingInputs: readonly AllowanceMissingInputView[];
  uncertaintyMessages: string[];
  inferredInputMessages: readonly string[];
  confirmationMessages: readonly string[];
  officialCalculationUrl: string;
  sourceLinks: {
    label: string;
    href: string;
  }[];
  components?: readonly {
    label: string;
    value: string;
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
    report: AllowanceAdvisorReportModel;
  };
};

export type AllowanceQuestionFlowItemView = {
  regulationId: RegulationId;
  allowanceKind: AllowanceKind;
  nextFieldLabel?: string;
  decisionReason: QuestionFlowDecision["reason"];
  progress: QuestionFlowProgress;
  answeredFieldLabels: readonly string[];
  blockingFieldLabels: readonly string[];
  inferredFieldLabels: readonly string[];
  skippedFieldLabels: readonly string[];
  notApplicableFieldLabels: readonly string[];
  confidenceLabel: string;
  officialVerificationRequired: boolean;
  recommendationIds: readonly string[];
};

export type AllowanceQuestionFlowReportingView = {
  answeredFieldLabels: readonly string[];
  inferredFieldLabels: readonly string[];
  skippedFieldLabels: readonly string[];
  notApplicableFieldLabels: readonly string[];
  blockingFieldLabels: readonly string[];
  confidenceLabels: readonly string[];
  officialVerificationRequired: boolean;
  recommendationIds: readonly string[];
};

export type AllowanceQuestionFlowView = {
  isValid: boolean;
  errors: AllowanceScanErrors;
  totalRelevant: number;
  completed: number;
  answered: number;
  inferred: number;
  skipped: number;
  blocked: number;
  remaining: number;
  percentage: number;
  nextFieldLabel?: string;
  decisionReason: QuestionFlowDecision["reason"];
  items: readonly AllowanceQuestionFlowItemView[];
  questionStatuses: Partial<Record<AllowanceMissingField, QuestionFlowQuestionStatus>>;
  reporting: AllowanceQuestionFlowReportingView;
};

export type CopyCoverage = {
  reasonCodes: readonly AllowanceReasonCode[];
  missingFields: readonly AllowanceMissingField[];
  uncertaintyCodes: readonly AllowanceUncertaintyCode[];
};
