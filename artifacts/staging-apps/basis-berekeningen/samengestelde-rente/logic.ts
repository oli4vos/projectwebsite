import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../../_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "compound_interest" as const;

export function calculateSamengesteldeRente(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
