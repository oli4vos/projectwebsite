import { describe, expect, it } from "vitest";
import {
  buildDraft,
  draftToInput,
  formatOutputValue,
  formatSummaryValue,
  normalizeNumberInput,
  parseNumberList,
  toHumanLabel,
  tryParseNumber,
} from "./input";

describe("artifact input adapter", () => {
  it("normalizes and parses decimal input", () => {
    expect(normalizeNumberInput(" 1 234,50 ")).toBe("1234.50");
    expect(tryParseNumber("1 234,50")).toBe(1234.5);
    expect(tryParseNumber("abc")).toBeUndefined();
  });

  it("parses semicolon, comma or pipe separated number lists", () => {
    expect(parseNumberList("1; 2|3")).toEqual([1, 2, 3]);
    expect(parseNumberList("1; abc")).toBeUndefined();
    expect(parseNumberList("")).toEqual([]);
  });

  it("builds and maps dynamic draft input without empty keys or values", () => {
    const draft = buildDraft({
      principal: 1000,
      rates: [2.5, 3],
      enabled: true,
      empty: null,
    });

    expect(draft).toEqual([
      { id: "field-0-principal", key: "principal", value: "1000", locked: true },
      { id: "field-1-rates", key: "rates", value: "2.5; 3", locked: true },
      { id: "field-2-enabled", key: "enabled", value: "true", locked: true },
      { id: "field-3-empty", key: "empty", value: "", locked: true },
    ]);

    expect(draftToInput(draft)).toEqual({
      principal: 1000,
      rates: [2.5, 3],
      enabled: true,
    });
  });

  it("formats labels and output values for generic renderers", () => {
    expect(toHumanLabel("annualRate", { annualRate: "Jaarrente" })).toBe("Jaarrente");
    expect(toHumanLabel("annualRate", {})).toBe("Annual Rate");
    expect(formatOutputValue(false)).toBe("Nee");
    expect(formatOutputValue(Number.POSITIVE_INFINITY)).toBe("Ongeldig getal");
    expect(formatSummaryValue(null)).toBe("-");
  });
});
