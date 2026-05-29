import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "loan_interest_rate" as const;

export function calculateRenteBijLening(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
