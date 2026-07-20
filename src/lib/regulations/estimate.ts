import type { EstimateRange, Result } from "@/lib/regulations/types";

export function createEstimateRange(input: EstimateRange): Result<EstimateRange> {
  if (
    !Number.isFinite(input.minimum) ||
    !Number.isFinite(input.likely) ||
    !Number.isFinite(input.maximum)
  ) {
    return { ok: false, errors: ["estimate-range-not-finite"] };
  }
  if (input.minimum > input.likely) {
    return { ok: false, errors: ["estimate-minimum-above-likely"] };
  }
  if (input.likely > input.maximum) {
    return { ok: false, errors: ["estimate-likely-above-maximum"] };
  }
  if (!Number.isInteger(input.sourceYear) || input.sourceYear < 1900 || input.sourceYear > 2200) {
    return { ok: false, errors: ["estimate-source-year-invalid"] };
  }
  if (input.unit === "custom" && !input.customUnit) {
    return { ok: false, errors: ["estimate-custom-unit-missing"] };
  }
  if (input.period === "custom" && !input.customPeriod) {
    return { ok: false, errors: ["estimate-custom-period-missing"] };
  }

  return { ok: true, value: input };
}
