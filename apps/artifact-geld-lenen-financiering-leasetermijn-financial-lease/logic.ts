import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "financial_lease_payment" as const;

export function calculateLeasetermijnFinancialLease(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
