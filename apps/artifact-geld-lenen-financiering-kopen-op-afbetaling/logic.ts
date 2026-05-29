import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "installment_purchase_cost" as const;

export function calculateKopenOpAfbetaling(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
