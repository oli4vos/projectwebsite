import { describe, expect, it } from "vitest";
import { normalizeDecimalInput, parseOptionalDecimalInput } from "./number-input";

describe("number input parsing", () => {
  it("normalizes comma to point", () => {
    expect(normalizeDecimalInput("12,34")).toBe("12.34");
  });

  it("removes spaces and parses finite numbers", () => {
    expect(parseOptionalDecimalInput(" 1 234,5 ")).toBe(1234.5);
  });

  it("returns undefined for empty or invalid values", () => {
    expect(parseOptionalDecimalInput("")).toBeUndefined();
    expect(parseOptionalDecimalInput("abc")).toBeUndefined();
  });
});
