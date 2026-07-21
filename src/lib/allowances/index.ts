export {
  adaptAllowanceScanToRegulationResults,
  adaptAllowanceSignalToRegulationResult,
  getAllowanceRegulationId,
} from "@/lib/allowances/adapter";
export {
  ALLOWANCE_REGULATION_DEFINITIONS,
  getAllowanceRegulationDefinition,
} from "@/lib/allowances/definitions";
export {
  evaluateAllowanceRegulations,
} from "@/lib/allowances/regulations-pipeline";
export {
  calculateOfficialAllowance2026,
  calculateOfficialAllowanceScan2026,
} from "@/lib/allowances/official-calculations";
export { calculateRentBenefit2026 } from "@/lib/allowances/rent-benefit";
export { calculateChildBudget2026 } from "@/lib/allowances/child-budget";
export {
  capChildcareContract2026,
  lookupChildcarePercentageBand2026,
  selectFirstChildForChildcare2026,
} from "@/lib/allowances/childcare-helpers";
export {
  ALLOWANCE_SIGNAL_ORDER,
  evaluateAllowanceSignals,
  evaluateChildBudgetAllowance,
  evaluateChildcareAllowance,
  evaluateHealthcareAllowance,
  evaluateRentAllowance,
  signalChildBudgetAllowance,
  signalChildcareAllowance,
  signalHealthcareAllowance,
  signalRentAllowance,
} from "@/lib/allowances/signaling";
export type {
  AllowanceCommonInput,
  AllowanceEvaluationContext,
  AllowanceKind,
  AllowanceMissingField,
  AllowancePartnerStatus,
  AllowanceReasonCode,
  AllowanceScanInput,
  AllowanceScanResult,
  AllowanceSignalDataset,
  AllowanceSignalInput,
  AllowanceSignalReasonCode,
  AllowanceSignalResult,
  AllowanceSignalStatus,
  AllowanceType,
  AllowanceUncertaintyCode,
  ChildBudgetAllowanceInput,
  ChildcareAllowanceInput,
  HealthcareAllowanceInput,
  RentAllowanceInput,
} from "@/lib/allowances/signaling";
export type {
  AllowanceRegulationAssessment,
  AllowanceRegulationsScanResult,
} from "@/lib/allowances/regulations-pipeline";
export type {
  OfficialAllowanceAmount,
  OfficialAllowanceCalculationInput,
  OfficialAllowanceCalculationReasonCode,
  OfficialAllowanceCalculationResult,
  OfficialAllowanceCalculationStatus,
  OfficialAllowanceEligibilityStatus,
  OfficialAllowanceScanCalculationResult,
} from "@/lib/allowances/official-calculations";
export type {
  RentBenefitCoResidentInput,
  RentBenefitComponents,
  RentBenefitEligibilityStatus,
  RentBenefitInput,
  RentBenefitResult,
  RentBenefitSpecialSituation,
} from "@/lib/allowances/rent-benefit";
export type {
  ChildBudgetChildInput,
  ChildBudgetEligibilityStatus,
  ChildBudgetInput,
  ChildBudgetResult,
  ChildBudgetSpecialSituation,
} from "@/lib/allowances/child-budget";
export type {
  ChildcareCareType,
  ChildcareContractInput,
  ChildcareFirstChildSelection,
  ChildcareSubsidisableContract,
} from "@/lib/allowances/childcare-helpers";
