import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "financial_lease_remaining_balance" as const;

export function calculateRestschuldBijFinancialLease(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
