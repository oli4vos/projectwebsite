import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "percentage_composition" as const;

export function calculatePercentageBerekenen2(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
