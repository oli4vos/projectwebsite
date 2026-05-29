import {
  executeProfile,
  type GenericCalculationInput,
  type GenericCalculationResult,
} from "../../_shared/runtime";

export type ToolInput = GenericCalculationInput;
export type ToolResult = GenericCalculationResult;

export const TOOL_PROFILE = "present_value_annuity" as const;

export function calculateContanteWaardeVoorEenReeksBetalingen(input: ToolInput): ToolResult {
  return executeProfile(TOOL_PROFILE, input);
}
