import { describe, expect, it } from "vitest";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateHypotheekExtraAflossen, TOOL_PROFILE } from "./logic";

describe("calculateHypotheekExtraAflossen", () => {
  it("runs fixture for profile", () => {
    const fixture = getProfileFixture(TOOL_PROFILE);
    const result = calculateHypotheekExtraAflossen(fixture.input);
    expect(result.profile).toBe(TOOL_PROFILE);
    expect(result.isValid).toBe(fixture.expectValid);
  });

  it("rejects empty input safely", () => {
    const result = calculateHypotheekExtraAflossen({});
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("handles non-finite values without crashing", () => {
    const result = calculateHypotheekExtraAflossen({ valueA: Number.NaN, valueB: Number.POSITIVE_INFINITY });
    expect(result.isValid).toBe(false);
  });
});
