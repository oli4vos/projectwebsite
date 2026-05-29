import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../../_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "simple_interest" as const;

export function calculateRenteInFinancialLease(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
