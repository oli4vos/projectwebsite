import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../../_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "nominal_rate" as const;

export function calculateNominaleRente(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
