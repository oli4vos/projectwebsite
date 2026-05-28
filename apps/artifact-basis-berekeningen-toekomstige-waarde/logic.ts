import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "future_value" as const;

export function calculateToekomstigeWaarde(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
