import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "indexed_amount" as const;

export function calculateIndexeringAlimentatie(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
