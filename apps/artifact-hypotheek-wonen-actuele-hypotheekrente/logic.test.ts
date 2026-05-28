import { describe, expect, it } from "vitest";
import { getProfileFixture } from "../_artifact_shared/runtime";
import { calculateActueleHypotheekrente, TOOL_PROFILE } from "./logic";

describe("calculateActueleHypotheekrente", () => {
  it("runs fixture for profile", () => {
    const fixture = getProfileFixture(TOOL_PROFILE);
    const result = calculateActueleHypotheekrente(fixture.input);
    expect(result.profile).toBe(TOOL_PROFILE);
    expect(result.isValid).toBe(fixture.expectValid);
  });

  it("rejects empty input safely", () => {
    const result = calculateActueleHypotheekrente({});
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("handles non-finite values without crashing", () => {
    const result = calculateActueleHypotheekrente({ valueA: Number.NaN, valueB: Number.POSITIVE_INFINITY });
    expect(result.isValid).toBe(false);
  });
});
