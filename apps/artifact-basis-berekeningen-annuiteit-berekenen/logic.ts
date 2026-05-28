import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "annuity_payment" as const;

export function calculateAnnuiteitBerekenen(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
