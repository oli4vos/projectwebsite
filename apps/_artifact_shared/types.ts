import type {
  GenericCalculationInput,
  GenericCalculationResult,
  ToolProfile,
} from "./runtime";

export type ArtifactCalculatorProps = {
  title: string;
  defaultInput: GenericCalculationInput;
  calculate: (input: GenericCalculationInput) => GenericCalculationResult;
  profile?: ToolProfile;
};

export type DraftEntry = {
  id: string;
  key: string;
  value: string;
  locked?: boolean;
};

export type FieldType =
  | "currency"
  | "number"
  | "integer"
  | "percentage"
  | "number-list"
  | "text";

export type StrictField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  min?: number;
  max?: number;
};

export type StrictProfileConfig = {
  description: string;
  fields: StrictField[];
  outputOrder?: string[];
  summaryKey?: string;
  summaryLabel?: string;
};
