import { describe, expect, it } from "vitest";
import { parseFeatureFlag } from "@/lib/feature-flags";

describe("parseFeatureFlag", () => {
  it("returns false for empty or missing values", () => {
    expect(parseFeatureFlag(undefined)).toBe(false);
    expect(parseFeatureFlag("")).toBe(false);
    expect(parseFeatureFlag("   ")).toBe(false);
  });

  it("supports 1/true for enabled values", () => {
    expect(parseFeatureFlag("1")).toBe(true);
    expect(parseFeatureFlag("true")).toBe(true);
    expect(parseFeatureFlag(" TRUE ")).toBe(true);
  });

  it("returns false for other values", () => {
    expect(parseFeatureFlag("0")).toBe(false);
    expect(parseFeatureFlag("false")).toBe(false);
    expect(parseFeatureFlag("yes")).toBe(false);
  });
});

