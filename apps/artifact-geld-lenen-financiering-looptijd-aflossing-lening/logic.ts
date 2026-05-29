import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../_artifact_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "loan_term_months" as const;

export function calculateLooptijdAflossingLening(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
