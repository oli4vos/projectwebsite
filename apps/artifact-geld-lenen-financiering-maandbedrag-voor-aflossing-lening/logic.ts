import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "loan_monthly_payment" as const;

export function calculateMaandbedragVoorAflossingLening(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
