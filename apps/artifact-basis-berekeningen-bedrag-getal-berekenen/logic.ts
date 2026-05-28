import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "value_from_percentage" as const;

export function calculateBedragGetalBerekenen(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
