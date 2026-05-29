import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "loan_remaining_balance" as const;

export function calculateRestschuldLening(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
