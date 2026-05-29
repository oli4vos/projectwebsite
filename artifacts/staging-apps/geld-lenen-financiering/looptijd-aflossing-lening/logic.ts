import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../../_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "annuity_term" as const;

export function calculateLooptijdAflossingLening(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
