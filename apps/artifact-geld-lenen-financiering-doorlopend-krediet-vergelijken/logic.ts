import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "revolving_credit_comparison" as const;

export function calculateDoorlopendKredietVergelijken(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
