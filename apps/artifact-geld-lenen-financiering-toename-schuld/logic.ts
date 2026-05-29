import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "debt_growth" as const;

export function calculateToenameSchuld(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
