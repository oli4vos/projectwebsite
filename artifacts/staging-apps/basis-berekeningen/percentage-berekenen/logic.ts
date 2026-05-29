import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../../_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "percentage_of_total" as const;

export function calculatePercentageBerekenen(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
