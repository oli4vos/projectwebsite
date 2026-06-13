import { describe, expect, it } from "vitest";

import {
  findCurrencyValues,
  formatEuro,
  normalizeComparisonText,
  parseDutchCurrency,
  scoreKeywordHit,
  summarizeDelta,
} from "@/lib/browser-automation/heuristics";

describe("browser automation heuristics", () => {
  it("normalizes text for fuzzy label matching", () => {
    expect(normalizeComparisonText("Bruto Jaarinkomen")).toBe("bruto jaarinkomen");
    expect(scoreKeywordHit("Maximale hypotheek berekenen", ["hypotheek"])).toBe(1);
  });

  it("parses and formats euro values", () => {
    expect(parseDutchCurrency("€ 315.777,85")).toBe(315777.85);
    expect(formatEuro(315777.85)).toBe("€ 315.777,85");
  });

  it("extracts currency values from a text block", () => {
    expect(findCurrencyValues("Onze engine: € 315.777,85 | Independer: € 202.500")).toEqual([
      315777.85,
      202500,
    ]);
  });

  it("summarizes deltas", () => {
    expect(summarizeDelta(200000, 250000)).toEqual({
      difference: 50000,
      percent: 25,
    });
  });
});
