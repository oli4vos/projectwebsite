import { describe, expect, it } from "vitest";
import { calculateWisselkoersValuta } from "./logic";

describe("calculateWisselkoersValuta", () => {
  it("converts without costs", () => {
    const result = calculateWisselkoersValuta({
      amount: 100,
      fromCurrency: "EUR",
      toCurrency: "USD",
      rateOverride: 1.1,
      feePercent: 0,
      fixedFee: 0,
      feeCurrencyMode: "target",
    });

    expect(result.grossConvertedAmount).toBe(110);
    expect(result.netConvertedAmount).toBe(110);
  });

  it("handles zero amount", () => {
    const result = calculateWisselkoersValuta({
      amount: 0,
      fromCurrency: "EUR",
      toCurrency: "USD",
      rateOverride: 1.1,
      feePercent: 0,
      fixedFee: 0,
      feeCurrencyMode: "target",
    });

    expect(result.netConvertedAmount).toBe(0);
  });

  it("matches expected regression with percent and fixed fee", () => {
    const result = calculateWisselkoersValuta({
      amount: 100,
      fromCurrency: "EUR",
      toCurrency: "USD",
      rateOverride: 1.2,
      feePercent: 2,
      fixedFee: 1,
      feeCurrencyMode: "target",
    });

    expect(result.grossConvertedAmount).toBe(120);
    expect(result.percentFeeAmountTarget).toBe(2.4);
    expect(result.netConvertedAmount).toBe(116.6);
  });
});
