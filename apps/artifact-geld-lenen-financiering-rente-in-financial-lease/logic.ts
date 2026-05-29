import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "financial_lease_interest_rate" as const;

export function calculateRenteInFinancialLease(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
