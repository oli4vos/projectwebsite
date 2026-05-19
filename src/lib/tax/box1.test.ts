import { describe, expect, it } from "vitest";
import { calculateBox1Tax } from "@/lib/tax/box1";

describe("calculateBox1Tax", () => {
  it("returns zero tax for zero income", () => {
    const result = calculateBox1Tax({ taxableIncome: 0, year: 2026 });
    expect(result.totalTax).toBe(0);
    expect(result.effectiveRate).toBe(0);
    expect(result.marginalRate).toBe(0);
  });

  it("calculates tax in first bracket only", () => {
    const result = calculateBox1Tax({ taxableIncome: 10000, year: 2026 });
    expect(result.totalTax).toBeCloseTo(3575, 2);
    expect(result.marginalRate).toBe(35.75);
  });

  it("calculates tax across multiple brackets with consistent breakdown", () => {
    const result = calculateBox1Tax({ taxableIncome: 100000, year: 2026 });
    const sumTax = result.bracketBreakdown.reduce((sum, row) => sum + row.tax, 0);
    const thirdBracketTaxable = result.bracketBreakdown[2]?.taxableAmount ?? 0;

    expect(result.totalTax).toBeCloseTo(sumTax, 2);
    expect(thirdBracketTaxable).toBeGreaterThan(0);
    expect(result.marginalRate).toBe(49.5);
  });

  it("sanitizes negative input to zero", () => {
    const result = calculateBox1Tax({ taxableIncome: -5000, year: 2026 });
    expect(result.totalTax).toBe(0);
    expect(result.taxableIncome).toBe(0);
  });
});
