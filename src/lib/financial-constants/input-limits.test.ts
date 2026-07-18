import { describe, expect, it } from "vitest";

import {
  validateFinancialInputLimit,
  validateFinancialInputLimits,
} from "@/lib/financial-constants/input-limits";
import type { FinancialInputLimit } from "@/lib/financial-constants/input-limits";

const normativeLimit: FinancialInputLimit = {
  id: "duo-monthly-loan",
  label: "DUO maandlening",
  kind: "official-policy",
  min: 0,
  max: 1032.42,
  step: 0.01,
  unit: "eur",
  severity: "blocking",
  sourceDatasetId: "duo-borrowing-limits-2026",
};

describe("financial input limits", () => {
  it("accepts exact minimum and maximum boundaries", () => {
    expect(validateFinancialInputLimit(0, normativeLimit).status).toBe("valid");
    expect(validateFinancialInputLimit(1032.42, normativeLimit).status).toBe("valid");
  });

  it("blocks values outside a normative range without silently clamping", () => {
    const below = validateFinancialInputLimit(-0.01, normativeLimit);
    const above = validateFinancialInputLimit(1032.43, normativeLimit);

    expect(below.status).toBe("below-minimum");
    expect(below.value).toBe(-0.01);
    expect(below.blocking).toBe(true);
    expect(above.status).toBe("above-maximum");
    expect(above.value).toBe(1032.43);
    expect(above.valid).toBe(false);
  });

  it("treats practical slider ranges as guidance, not legal truth", () => {
    const sliderLimit: FinancialInputLimit = {
      id: "salary-increase",
      label: "Salarisverhoging",
      kind: "practical-slider",
      min: 0,
      max: 500,
      step: 25,
      unit: "eur",
      severity: "warning",
      note: "UI-range voor snel rekenen; directe invoer mag hoger zijn.",
    };

    const result = validateFinancialInputLimit(750, sliderLimit);

    expect(result.status).toBe("outside-guidance");
    expect(result.valid).toBe(true);
    expect(result.blocking).toBe(false);
  });

  it("flags missing or non-finite values explicitly", () => {
    const result = validateFinancialInputLimit(Number.NaN, normativeLimit);

    expect(result.status).toBe("not-finite");
    expect(result.valid).toBe(false);
    expect(result.messages[0]).toContain("eindige waarde");
  });

  it("validates a limit set by stable identifiers", () => {
    const [duo, salary] = validateFinancialInputLimits(
      { "duo-monthly-loan": 1000, "salary-increase": 600 },
      [
        normativeLimit,
        {
          id: "salary-increase",
          label: "Salarisverhoging",
          kind: "practical-slider",
          min: 0,
          max: 500,
          step: 50,
          unit: "eur",
          severity: "warning",
        },
      ],
    );

    expect(duo.status).toBe("valid");
    expect(salary.status).toBe("outside-guidance");
  });
});
