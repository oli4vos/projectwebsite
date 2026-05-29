import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../../_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "effective_rate" as const;

export function calculateEffectieveRente(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
