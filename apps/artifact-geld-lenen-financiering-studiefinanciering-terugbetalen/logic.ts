import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "student_loan_repayment" as const;

export function calculateStudiefinancieringTerugbetalen(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
