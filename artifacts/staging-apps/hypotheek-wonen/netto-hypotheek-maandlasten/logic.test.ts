import { describe, expect, it } from "vitest";
import { getProfileFixture } from "../../_shared/runtime";
import { calculateNettoHypotheekMaandlasten, TOOL_PROFILE } from "./logic";

describe("calculateNettoHypotheekMaandlasten", () => {
  it("runs fixture for profile", () => {
    const fixture = getProfileFixture(TOOL_PROFILE);
    const result = calculateNettoHypotheekMaandlasten(fixture.input);
    expect(result.profile).toBe(TOOL_PROFILE);
    expect(result.isValid).toBe(fixture.expectValid);
  });

  it("rejects empty input safely", () => {
    const result = calculateNettoHypotheekMaandlasten({});
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("handles non-finite values without crashing", () => {
    const result = calculateNettoHypotheekMaandlasten({ valueA: Number.NaN, valueB: Number.POSITIVE_INFINITY });
    expect(result.isValid).toBe(false);
  });
});
