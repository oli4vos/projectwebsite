import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "personal_loan_comparison" as const;

export function calculatePersoonlijkeLeningVergelijken(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
