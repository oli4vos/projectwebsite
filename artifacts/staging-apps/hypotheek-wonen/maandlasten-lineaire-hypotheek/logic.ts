import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../../_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "linear_loan" as const;

export function calculateMaandlastenLineaireHypotheek(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
