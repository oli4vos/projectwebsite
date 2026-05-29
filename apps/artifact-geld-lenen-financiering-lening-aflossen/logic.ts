import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "loan_remaining_balance_after_period" as const;

export function calculateLeningAflossen(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
