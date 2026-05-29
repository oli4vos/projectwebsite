import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "max_loan_from_budget" as const;

export function calculateMaximaleLening(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
