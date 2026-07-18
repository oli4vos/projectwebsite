export type FinancialInputLimitKind =
  | "normative-law"
  | "official-policy"
  | "provider-product"
  | "practical-slider"
  | "technical-absolute";

export type FinancialInputLimitSeverity = "blocking" | "warning";

export type FinancialInputLimit = {
  id: string;
  label: string;
  kind: FinancialInputLimitKind;
  min?: number;
  max?: number;
  step?: number;
  unit: "eur" | "percent" | "months" | "years" | "count";
  severity: FinancialInputLimitSeverity;
  sourceDatasetId?: string;
  validFrom?: string;
  validTo?: string;
  note?: string;
};

export type FinancialInputLimitValidationStatus =
  | "valid"
  | "below-minimum"
  | "above-maximum"
  | "not-finite"
  | "outside-guidance";

export type FinancialInputLimitValidationResult = {
  status: FinancialInputLimitValidationStatus;
  value: number;
  valid: boolean;
  blocking: boolean;
  limit: FinancialInputLimit;
  messages: string[];
};

function isFiniteNumber(value: number) {
  return Number.isFinite(value);
}

function compareLimit(value: number, limit: FinancialInputLimit) {
  if (limit.min !== undefined && value < limit.min) {
    return "below-minimum" as const;
  }
  if (limit.max !== undefined && value > limit.max) {
    return "above-maximum" as const;
  }

  return "valid" as const;
}

export function validateFinancialInputLimit(
  value: number,
  limit: FinancialInputLimit,
): FinancialInputLimitValidationResult {
  if (!isFiniteNumber(value)) {
    return {
      status: "not-finite",
      value,
      valid: false,
      blocking: limit.severity === "blocking",
      limit,
      messages: [`${limit.label} moet een eindige waarde zijn.`],
    };
  }

  const comparison = compareLimit(value, limit);
  if (comparison === "valid") {
    return {
      status: "valid",
      value,
      valid: true,
      blocking: false,
      limit,
      messages: [],
    };
  }

  const outsideMessage =
    comparison === "below-minimum"
      ? `${limit.label} ligt onder de centrale minimumgrens.`
      : `${limit.label} ligt boven de centrale maximumgrens.`;
  const blocking = limit.severity === "blocking";

  return {
    status: blocking ? comparison : "outside-guidance",
    value,
    valid: !blocking,
    blocking,
    limit,
    messages: [outsideMessage],
  };
}

export function validateFinancialInputLimits(
  values: Record<string, number>,
  limits: readonly FinancialInputLimit[],
) {
  return limits.map((limit) =>
    validateFinancialInputLimit(values[limit.id] ?? Number.NaN, limit),
  );
}
