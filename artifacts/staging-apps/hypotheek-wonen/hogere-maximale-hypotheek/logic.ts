import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../../_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "generic_contract" as const;

export function calculateHogereMaximaleHypotheek(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
